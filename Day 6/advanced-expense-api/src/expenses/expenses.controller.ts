import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query, // <-- 1. Import Query
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';
import { QueryExpenseDto } from './dto/query-expense.dto'; // <-- 2. Import Query DTO

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses with optional filters and pagination' })
  @ApiQuery({ name: 'month', required: false, type: String, description: 'Filter by month (YYYY-MM)' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by Category ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page' })
  // --- This is FIX #1 ---
  findAll(@Query() queryDto: QueryExpenseDto) { 
    return this.expensesService.findAll(queryDto); // <-- Pass queryDto to service
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single expense by ID' })
  // --- This is FIX #2 ---
  findOne(@Param('id', MongoIdPipe) id: string) {
    return this.expensesService.findOne(id); // <-- Remove '+' from id
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense by ID (Partial updates allowed)' })
  // --- This is FIX #3 ---
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, updateExpenseDto); // <-- Remove '+' from id
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an expense by ID' })
  // --- This is FIX #4 ---
  remove(@Param('id', MongoIdPipe) id: string) {
    return this.expensesService.remove(id); // <-- Remove '+' from id
  }
}