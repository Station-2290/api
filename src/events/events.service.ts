import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { OrderStatus } from '@prisma/client';

export interface OrderEvent {
  type: 'order_created' | 'order_updated' | 'order_cancelled';
  order_id: number;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  customer_name?: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class EventsService {
  private readonly events_subject = new Subject<OrderEvent>();

  get events$() {
    return this.events_subject.asObservable();
  }

  emit_order_event(event: OrderEvent) {
    this.events_subject.next(event);
  }
}
