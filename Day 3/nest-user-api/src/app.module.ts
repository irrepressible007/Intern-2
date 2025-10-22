import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- 1. Import new modules

@Module({
  imports: [
    // 2. Load the .env file (make it global)
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 3. Change MongooseModule to be "async"
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // 4. Import ConfigModule here
      useFactory: async (configService: ConfigService) => ({
        // 5. Get the URI from the .env file
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService], // 6. Inject the ConfigService
    }),
    
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}