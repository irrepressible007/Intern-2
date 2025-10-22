import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Task 4: POST API to create a user
   * Task 9: Return custom response format
   */
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    // The @Body() decorator automatically gets the JSON from the request
    // and (thanks to ValidationPipe) validates it using our DTO

    const data = this.usersService.create(createUserDto);

    return {
      success: true,
      message: 'User created successfully',
      data: data,
    };
  }

  // --- Methods from the generator we haven't implemented yet ---
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}