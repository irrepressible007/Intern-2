import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { ExpensesModule } from 'src/expenses/expenses.module'; // <-- 1. IMPORT ExpensesModule

@Module({
  imports: [
    MulterModule.register({
      dest: join(__dirname, '..', '..', 'uploads'),
    }),
    ExpensesModule, // <-- 2. ADD IT HERE
  ],
  controllers: [UploadsController],
  providers: [],
})
export class UploadsModule {}