import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Task 8: POST /users
  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  // Task 8: GET /users
  // Task 6: Hide soft-deleted users
  async findAll(): Promise<User[]> {
    // Only find users that are NOT deleted
    return this.userModel.find({ isDeleted: false }).exec();
  }

  // Task 8: GET /users/:id
  // Task 6: Hide soft-deleted users
  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findOne({ _id: id, isDeleted: false }) // Find by ID and only if not deleted
      .exec();
      
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Task 8: PUT /users/:id
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateUserDto, {
        new: true, // This option returns the updated document
      })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  // Task 8: DELETE /users/:id (Soft Delete)
  async remove(id: string): Promise<User> {
    const softDeletedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!softDeletedUser) {
      throw new NotFoundException('User not found');
    }
    return softDeletedUser;
  }

  // Task 9: PUT /users/:id/restore
  async restore(id: string): Promise<User> {
    const restoredUser = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          isDeleted: false,
          deletedAt: null, // Reset the deletedAt field
        },
        { new: true },
      )
      .exec();

    if (!restoredUser) {
      throw new NotFoundException('User not found');
    }
    return restoredUser;
  }
}