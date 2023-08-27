import { Global, Module } from '@nestjs/common';
import { clientProvider } from './client.provider.js';
import { DatabaseService } from './database.service.js';

@Global()
@Module({
  providers: [clientProvider, DatabaseService],
  exports: [clientProvider],
})
export class DatabaseModule {}
