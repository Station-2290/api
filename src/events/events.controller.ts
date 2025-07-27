import { Controller, Sse, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { Observable, map } from 'rxjs';
import { EventsService } from './events.service';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';

@ApiTags('events')
@Controller({ path: 'events', version: '1' })
export class EventsController {
  constructor(private readonly events_service: EventsService) {}

  @Sse('orders')
  @UseGuards(CombinedAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Subscribe to order events via Server-Sent Events',
    description:
      'Real-time order notifications for tablet display. Requires JWT token as query parameter (?token=your_jwt_token) or API key header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Event stream established',
    content: {
      'text/event-stream': {
        schema: {
          type: 'string',
          example:
            'data: {"type":"order_created","order_id":1,"order_number":"ORD-20250125-0001","status":"PENDING","total_amount":15.99,"customer_name":"John Doe","created_at":"2025-01-25T10:00:00Z","updated_at":"2025-01-25T10:00:00Z"}',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - API key or JWT token missing or invalid',
  })
  order_events(): Observable<MessageEvent> {
    return this.events_service.events$.pipe(
      map(
        (event) =>
          ({
            data: JSON.stringify(event),
            type: 'order_event',
          }) as MessageEvent,
      ),
    );
  }
}
