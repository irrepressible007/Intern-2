import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { QueryBudgetDto } from './dto/query-budget.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// Import 'type' for the interface
import { User, type ReqUser } from 'src/auth/user.decorator'; 

@ApiTags('budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget for a month (overall or per-category)' })
  create(
    @Body() createBudgetDto: CreateBudgetDto,
    @User() user: ReqUser, // Inject user
  ) {
    // Pass user.userId to the service
    return this.budgetsService.create(createBudgetDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets for a specific month (User-Scoped)' })
  @ApiQuery({ name: 'month', required: true, type: String, description: 'Month (YYYY-MM)', example: '2025-10' })
  findAll(
    @Query() queryDto: QueryBudgetDto, // Pass query DTO
    @User() user: ReqUser, // Inject user
  ) {
    // Pass both to the service
    return this.budgetsService.findAll(queryDto, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single budget by ID (User-Scoped)' })
  findOne(
    @Param('id', MongoIdPipe) id: string,
    @User() user: ReqUser, // Inject user
  ) {
    // Pass id and user.userId
    return this.budgetsService.findOne(id, user.userId);
  }

  @Put(':id') // Use PUT
  @ApiOperation({ summary: 'Update a budget by ID (User-Scoped)' })
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @User() user: ReqUser, // Inject user
  ) {
    // Pass all three arguments
    return this.budgetsService.update(id, updateBudgetDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget by ID (User-Scoped)' })
  remove(
    @Param('id', MongoIdPipe) id: string,
    @User() user: ReqUser, // Inject user
  ) {
    // Pass id and user.userId
    return this.budgetsService.remove(id, user.userId);
  }
}