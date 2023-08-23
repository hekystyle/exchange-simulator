import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly db: PrismaClient) {}

  async onApplicationBootstrap() {
    this.logger.log('Connecting to database...');
    await this.db.$connect();
    this.logger.log('Connected to database.');
  }

  async onApplicationShutdown() {
    this.logger.log('Disconnecting from database...');
    await this.db.$disconnect();
    this.logger.log('Disconnected from database.');
  }
}
