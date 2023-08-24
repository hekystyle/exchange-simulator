import { Global, Module } from '@nestjs/common';
import { Accounts } from './accounts.js';

@Global()
@Module({
  providers: [Accounts],
  exports: [Accounts],
})
export class AccountsModule {}
