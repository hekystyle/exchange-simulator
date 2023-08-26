import { Provider } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export const clientProvider: Provider<PrismaClient> = {
  provide: PrismaClient,
  useFactory: () => new PrismaClient(),
};
