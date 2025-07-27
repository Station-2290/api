import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('PrismaClient');

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });
  }

  async onModuleInit() {
    // @ts-expect-error - don't know how to fix the error
    this.$on('query', (event: Prisma.QueryEvent) => {
      this.logger.log('Query: ' + event.query);
      this.logger.log('Duration: ' + event.duration + 'ms');
    });

    await this.$connect();
  }
}
