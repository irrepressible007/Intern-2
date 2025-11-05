import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { Category } from '../categories/schemas/category.schema';
import { Expense } from '../expenses/schemas/expense.schema';
import { Budget } from '../budgets/schemas/budget.schema';
import { RecurringExpense } from '../recurring-expenses/schemas/recurring-expense.schema';
import { Cadence } from '../recurring-expenses/schemas/recurring-expense.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('--- Starting Seeder ---');

  // Get all necessary models
  const UserModel = app.get<Model<User>>(getModelToken(User.name));
  const CategoryModel = app.get<Model<Category>>(getModelToken(Category.name));
  const ExpenseModel = app.get<Model<Expense>>(getModelToken(Expense.name));
  const BudgetModel = app.get<Model<Budget>>(getModelToken(Budget.name));
  const RecExpenseModel = app.get<Model<RecurringExpense>>(getModelToken(RecurringExpense.name));

  // 1. Clean previous data
  console.log('Cleaning database...');
  await Promise.all([
    UserModel.deleteMany({}),
    CategoryModel.deleteMany({}),
    ExpenseModel.deleteMany({}),
    BudgetModel.deleteMany({}),
    RecExpenseModel.deleteMany({}),
  ]);

  // 2. Create Test User
  console.log('Creating test user...');
  const testUser = await UserModel.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123', // Will be hashed by pre-save hook
  });
  const userId = testUser._id;
  console.log(`User created: ${testUser.email} (ID: ${userId})`);

  // 3. Create Categories
  console.log('Creating categories...');
  const catGroceries = await CategoryModel.create({ userId, name: 'Groceries', slug: 'groceries' });
  const catTransport = await CategoryModel.create({ userId, name: 'Transport', slug: 'transport' });
  const catBills = await CategoryModel.create({ userId, name: 'Bills', slug: 'bills' });

  // 4. Create Budgets (for October 2025)
  console.log('Creating budgets...');
  await BudgetModel.create({
    userId,
    month: '2025-10',
    limit: 1000,
    categoryId: null, // Overall
  });
  await BudgetModel.create({
    userId,
    month: '2025-10',
    limit: 250,
    categoryId: catGroceries._id, // Groceries budget
  });

  // 5. Create Expenses (for Oct & Nov 2025)
  console.log('Creating expenses...');
  await ExpenseModel.insertMany([
    // October expenses
    { userId, title: 'Weekly Shop', amount: 150.00, categoryId: catGroceries._id, date: new Date('2025-10-05T10:00:00Z'), paymentMethod: 'card', tags: ['weekly'] },
    { userId, title: 'Bus Pass', amount: 65.00, categoryId: catTransport._id, date: new Date('2025-10-01T08:00:00Z'), paymentMethod: 'bkash' },
    { userId, title: 'Electric Bill', amount: 75.50, categoryId: catBills._id, date: new Date('2025-10-10T17:00:00Z'), paymentMethod: 'card' },
    { userId, title: 'Another grocery run', amount: 120.00, categoryId: catGroceries._id, date: new Date('2025-10-20T18:00:00Z') }, // This will push Groceries over budget
    
    // November expenses
    { userId, title: 'Train Ticket', amount: 45.00, categoryId: catTransport._id, date: new Date('2025-11-02T09:00:00Z'), paymentMethod: 'card' },
  ]);
  
  // 6. Create Recurring Expense
  console.log('Creating recurring expense template...');
  await RecExpenseModel.create({
    userId,
    title: 'Monthly Netflix',
    amount: 15.99,
    categoryId: catBills._id,
    cadence: Cadence.MONTHLY,
    startDate: new Date('2025-10-28'),
    nextRunDate: new Date('2025-10-28'), // Set to run in the past to test catch-up
  });

  await app.close();
  console.log('--- Seeding Complete ---');
  process.exit(0);
}

bootstrap().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});