import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- Import
import { MongooseModule } from '@nestjs/mongoose'; // <-- Import
import { UsersModule } from './users/users.module'; // <-- Import

@Module({
  imports: [
    // This line loads the .env file
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // This block reads the .env file and connects
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // This line must match your .env variable name
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}