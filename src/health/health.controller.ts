import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/shared/modules/prisma';
import { Public } from '../auth/decorators/public.decorator';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  database: {
    status: string;
  };
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma_service: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'connected' },
          },
        },
      },
    },
  })
  async check(): Promise<HealthCheckResponse> {
    let database_status = 'disconnected';

    try {
      await this.prisma_service.$queryRaw`SELECT 1`;
      database_status = 'connected';
    } catch {
      database_status = 'error';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: database_status,
      },
    };
  }
}
