import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose'; // <-- 1. Import
import { User, UserSchema } from './schemas/user.schema'; // <-- 2. Import

@Module({
  imports: [
    // 3. This is the line that fixes your error
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}