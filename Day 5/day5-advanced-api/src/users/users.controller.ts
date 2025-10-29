import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';
import { QueryUserDto } from './dto/query-user.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateBulkUserDto } from './dto/create-bulk-user.dto'; // <-- 1. Import new DTO

@ApiTags('users') // Group endpoints in Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' }) // Swagger decorator
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // --- Task 8: Bulk Create Endpoint ---
  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple users in bulk (skips duplicates)' })
  createBulk(@Body() createBulkUserDto: CreateBulkUserDto) {
    return this.usersService.createBulk(createBulkUserDto);
  }
  // ------------------------------------

  @Get()
  @ApiOperation({ summary: 'Find all users with filters, sorting, and pagination' })
  // --- Task 10: Add Swagger docs for all query params ---
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'minAge', required: false, type: Number })
  @ApiQuery({ name: 'maxAge', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'isDeleted', required: false, type: Boolean })
  // --------------------------------------------------------
  findAll(@Query() queryDto: QueryUserDto) {
    // Pass the validated QueryUserDto to the service
    return this.usersService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a single user by ID' })
  findOne(@Param('id', MongoIdPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a user by ID' })
  remove(@Param('id', MongoIdPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted user by ID' })
  restore(@Param('id', MongoIdPipe) id: string) {
    return this.usersService.restore(id);
  }
}