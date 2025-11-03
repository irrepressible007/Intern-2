import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { RecurringExpensesService } from './recurring-expenses.service';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User, type ReqUser } from 'src/auth/user.decorator';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';

@ApiTags('recurring-expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recurring-expenses')
export class RecurringExpensesController {
  constructor(private readonly recurringExpensesService: RecurringExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recurring expense template (User-Scoped)' })
  create(
    @Body() createRecurringExpenseDto: CreateRecurringExpenseDto,
    @User() user: ReqUser,
  ) {
    return this.recurringExpensesService.create(createRecurringExpenseDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active recurring expense templates (User-Scoped)' })
  findAll(@User() user: ReqUser) {
    return this.recurringExpensesService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single recurring expense template (User-Scoped)' })
  findOne(
    @Param('id', MongoIdPipe) id: string,
    @User() user: ReqUser,
  ) {
    return this.recurringExpensesService.findOne(id, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a recurring expense template (User-Scoped)' })
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateRecurringExpenseDto: UpdateRecurringExpenseDto,
    @User() user: ReqUser,
  ) {
    return this.recurringExpensesService.update(id, updateRecurringExpenseDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a recurring expense template (User-Scoped)' })
  remove(
    @Param('id', MongoIdPipe) id: string,
    @User() user: ReqUser,
  ) {
    return this.recurringExpensesService.remove(id, user.userId);
  }
}