import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/shared/modules/prisma';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';
import { PaginationHelper } from 'src/shared/utils/pagination.helper';
import { Order } from './entities/order.entity';
import { OrderStatus } from '@prisma/client';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma_service: PrismaService,
    private readonly events_service: EventsService,
  ) {}

  async create(create_order_dto: CreateOrderDto): Promise<Order> {
    const { items, ...order_data } = create_order_dto;

    // Validate products and calculate totals
    const product_ids = items.map((item) => item.product_id);
    const products = await this.prisma_service.product.findMany({
      where: {
        id: { in: product_ids },
        is_active: true,
      },
    });

    if (products.length !== product_ids.length) {
      throw new BadRequestException(
        'One or more products not found or inactive',
      );
    }

    // Check stock availability
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (product && product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
        );
      }
    }

    // Calculate order total and prepare items
    let total_amount = 0;
    const order_items = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)!;
      const subtotal = product.price * item.quantity;
      total_amount += subtotal;

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: subtotal,
      };
    });

    // Generate unique order number
    const order_number = await this.generate_order_number();

    // Create order with items in a transaction
    const order = await this.prisma_service.$transaction(async (prisma) => {
      // Create order
      const new_order = await prisma.order.create({
        data: {
          ...order_data,
          order_number,
          total_amount,
          items: {
            create: order_items,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });

      // Update product stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.product_id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return new_order;
    });

    // Emit order created event
    this.events_service.emit_order_event({
      type: 'order_created',
      order_id: order.id,
      order_number: order.order_number,
      status: order.status,
      total_amount: order.total_amount,
      customer_name: order.customer
        ? `${order.customer.first_name} ${order.customer.last_name}`
        : undefined,
      created_at: order.created_at,
      updated_at: order.updated_at,
    });

    return order;
  }

  async find_all(
    query: PaginationQueryDto & { status?: OrderStatus },
  ): Promise<PaginatedResponseDto<Order>> {
    const { skip, take } = PaginationHelper.getPaginationOptions(query);

    const where = query.status ? { status: query.status } : {};

    const [data, total] = await this.prisma_service.$transaction([
      this.prisma_service.order.findMany({
        skip,
        take,
        where,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma_service.order.count({ where }),
    ]);

    const meta = PaginationHelper.createPaginationMeta(
      total,
      query.page || 1,
      query.limit || 10,
    );

    return new PaginatedResponseDto(data, meta);
  }

  async find_one(id: number): Promise<Order> {
    const order = await this.prisma_service.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: number, update_order_dto: UpdateOrderDto): Promise<Order> {
    const order = await this.find_one(id);

    // Validate status transitions
    if (update_order_dto.status) {
      this.validate_status_transition(order.status, update_order_dto.status);
    }

    const updated_order = await this.prisma_service.order.update({
      where: { id },
      data: update_order_dto,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Emit order updated event
    this.events_service.emit_order_event({
      type: 'order_updated',
      order_id: updated_order.id,
      order_number: updated_order.order_number,
      status: updated_order.status,
      total_amount: updated_order.total_amount,
      customer_name: updated_order.customer
        ? `${updated_order.customer.first_name} ${updated_order.customer.last_name}`
        : undefined,
      created_at: updated_order.created_at,
      updated_at: updated_order.updated_at,
    });

    return updated_order;
  }

  async cancel(id: number): Promise<Order> {
    const order = await this.find_one(id);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed order');
    }

    // Cancel order and restore stock in transaction
    const cancelled_order = await this.prisma_service.$transaction(
      async (prisma) => {
        // Update order status
        const cancelled_order = await prisma.order.update({
          where: { id },
          data: { status: OrderStatus.CANCELLED },
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        // Restore product stock
        for (const item of cancelled_order.items) {
          await prisma.product.update({
            where: { id: item.product_id },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        return cancelled_order;
      },
    );

    // Emit order cancelled event
    this.events_service.emit_order_event({
      type: 'order_cancelled',
      order_id: cancelled_order.id,
      order_number: cancelled_order.order_number,
      status: cancelled_order.status,
      total_amount: cancelled_order.total_amount,
      customer_name: cancelled_order.customer
        ? `${cancelled_order.customer.first_name} ${cancelled_order.customer.last_name}`
        : undefined,
      created_at: cancelled_order.created_at,
      updated_at: cancelled_order.updated_at,
    });

    return cancelled_order;
  }

  private async generate_order_number(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Count orders for today
    const start_of_day = new Date(date.setHours(0, 0, 0, 0));
    const end_of_day = new Date(date.setHours(23, 59, 59, 999));

    const today_count = await this.prisma_service.order.count({
      where: {
        created_at: {
          gte: start_of_day,
          lte: end_of_day,
        },
      },
    });

    const order_sequence = String(today_count + 1).padStart(4, '0');
    return `ORD-${year}${month}${day}-${order_sequence}`;
  }

  private validate_status_transition(
    current_status: OrderStatus,
    new_status: OrderStatus,
  ): void {
    const valid_transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!valid_transitions[current_status].includes(new_status)) {
      throw new BadRequestException(
        `Cannot transition from ${current_status} to ${new_status}`,
      );
    }
  }
}
