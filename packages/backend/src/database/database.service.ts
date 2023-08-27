import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Inject(PrismaClient)
    private readonly prisma: PrismaClient,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Connecting to database...');
    await this.prisma.$connect();
    this.logger.log('Connected to database');
  }
}
