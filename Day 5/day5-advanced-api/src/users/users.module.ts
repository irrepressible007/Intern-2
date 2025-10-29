import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose'; // <-- Import
import { User, UserSchema } from './schemas/user.schema'; // <-- Import

@Module({
  imports: [
    // This "wires up" the User model
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}