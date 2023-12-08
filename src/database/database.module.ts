import { Global, Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Global()
@Module({
  exports: [DatabaseService],
  providers: [DatabaseService],
})
export class DatabaseModule {}
