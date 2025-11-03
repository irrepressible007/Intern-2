import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Used for the signup process in AuthService
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    // The pre-save hook in the schema will hash the password
    return createdUser.save();
  }

  /**
   * Used for the login process in AuthService to find a user by their email
   */
  async findOneByEmail(email: string): Promise<User | null> {
    // We must explicitly select the password, since it's hidden by default
    return this.userModel.findOne({ email }).select('+password').lean().exec();
  }

  // --- We can ignore the default CRUD methods for now ---
  findAll() {
    return `This action returns all users (not implemented)`;
  }

  findOne(id: string) {
    return `This action returns a #${id} user (not implemented)`;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user (not implemented)`;
  }

  remove(id: string) {
    return `This action removes a #${id} user (not implemented)`;
  }
}