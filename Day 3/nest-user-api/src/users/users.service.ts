import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose'; // <-- Import
import { Model } from 'mongoose'; // <-- Import
import { User, UserDocument } from './schemas/user.schema'; // <-- Import

@Injectable()
export class UsersService {
  // This constructor line is what was causing the error
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(active?: string): Promise<User[]> {
    const filter = {};
    if (active === 'true') {
      filter['active'] = true;
    }
    if (active === 'false') {
      filter['active'] = false;
    }
    return this.userModel.find(filter).exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}