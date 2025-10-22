import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  // ParseIntPipe is removed!
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);
    return {
      success: true,
      message: 'User created successfully',
      data: data,
    };
  }

  @Get()
  async findAll(@Query('active') active?: string) {
    const data = await this.usersService.findAll(active);
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // The '+' is removed from id
    const data = await this.usersService.findOne(id); 
    return {
      success: true,
      message: 'User retrieved successfully',
      data: data,
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // The '+' is removed from id
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // The '+' is removed from id
    return this.usersService.remove(id);
  }
}