import { ClassProvider } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export const prismaProvider: ClassProvider<PrismaClient> = {
  provide: PrismaClient,
  useClass: PrismaClient,
};
