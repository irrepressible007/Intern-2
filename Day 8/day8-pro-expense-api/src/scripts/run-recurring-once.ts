import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RecurringExpensesService } from '../recurring-expenses/recurring-expenses.service';

/**
 * This script manually triggers the cron job from Task 5.
 * It will find the "Monthly Netflix" template (set to run on 2025-10-28)
 * and create a concrete expense for it.
 */
async function bootstrap() {
  // Use createApplicationContext since we don't need the HTTP server
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Get the RecurringExpensesService instance from the app context
  const recurringService = app.get(RecurringExpensesService);

  console.log('--- Manually Triggering Recurring Expense Worker ---');
  
  // Manually call the handleCron method
  await recurringService.handleCron();

  await app.close();
  console.log('--- Worker Run Complete ---');
  process.exit(0);
}

bootstrap().catch(err => {
  console.error('Worker execution failed:', err);
  process.exit(1);
});