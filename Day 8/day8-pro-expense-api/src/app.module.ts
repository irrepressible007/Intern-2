import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static'; // <-- 1. Import
import { join } from 'path'; // <-- 2. Import path
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BudgetsModule } from './budgets/budgets.module';
import { RecurringExpensesModule } from './recurring-expenses/recurring-expenses.module';
import { UploadsModule } from './uploads/uploads.module'; // <-- 3. Import
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    // Task 7: Serve static files from the 'uploads' folder
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'), // Path to 'uploads' folder
      serveRoot: '/uploads', // Map local folder to /uploads URL path
    }),
    CategoriesModule,
    ExpensesModule,
    ReportsModule,
    UsersModule,
    AuthModule,
    BudgetsModule,
    RecurringExpensesModule,
    UploadsModule, // <-- 4. Add UploadsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}