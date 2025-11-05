import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';

@Module({
  imports: [
    // Configure Multer to save files to the 'uploads' directory
    MulterModule.register({
      dest: join(__dirname, '..', '..', 'uploads'),
    }),
    // We don't need to import ExpensesModule here,
    // as this module doesn't depend on any of its services.
  ],
  controllers: [UploadsController],
  providers: [],
})
export class UploadsModule {}