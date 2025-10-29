import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put, // We'll use PUT for full updates
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe'; // <-- Import your pipe

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Task 8: POST /users
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Task 8: GET /users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Task 8: GET /users/:id
  @Get(':id')
  findOne(@Param('id', MongoIdPipe) id: string) { // <-- Use your MongoIdPipe
    return this.usersService.findOne(id);
  }

  // Task 8: PUT /users/:id
  @Put(':id')
  update(
    @Param('id', MongoIdPipe) id: string, // <-- Use your MongoIdPipe
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // Task 8: DELETE /users/:id (Soft Delete)
  @Delete(':id')
  remove(@Param('id', MongoIdPipe) id: string) { // <-- Use your MongoIdPipe
    return this.usersService.remove(id);
  }

  // Task 9: PUT /users/:id/restore
  @Put(':id/restore')
  restore(@Param('id', MongoIdPipe) id: string) { // <-- Use your MongoIdPipe
    return this.usersService.restore(id);
  }
}