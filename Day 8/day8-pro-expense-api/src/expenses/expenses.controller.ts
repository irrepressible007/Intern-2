import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
  Put, // <-- Import PUT
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { AttachReceiptDto } from './dto/attach-receipt.dto'; // <-- 1. Import new DTO
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User, type ReqUser } from 'src/auth/user.decorator'; 
import type { Response } from 'express'; 

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @User() user: ReqUser,
  ) {
    return this.expensesService.create(createExpenseDto, user.userId);
  }

  /**
   * Task 7: PUT /expenses/:id/receipt
   */
  @Put(':id/receipt')
  @ApiOperation({ summary: 'Attach or remove receipt metadata to/from an expense (User-Scoped)' })
  @ApiBody({ type: AttachReceiptDto, description: 'Attach metadata by sending the object, or remove by sending { "receipt": null }' })
  attachReceipt(
    @Param('id', MongoIdPipe) id: string,
    @Body() attachReceiptDto: AttachReceiptDto, // <-- 2. Use the new DTO
    @User() user: ReqUser,
  ) {
    return this.expensesService.attachReceipt(id, user.userId, attachReceiptDto);
  }


  // --- GET and other CRUD endpoints below ---
  @Get('export')
  @ApiOperation({ summary: 'Export filtered expenses as JSON stream' })
  @ApiQuery({ name: 'month', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search by title or note' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number })
  @ApiQuery({ name: 'paymentMethod', required: false, type: String })
  async export(
    @Query() queryDto: QueryExpenseDto,
    @User() user: ReqUser,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="expenses_export_${new Date().toISOString()}.json"`);
    
    const expenseStream = this.expensesService.exportExpenses(queryDto, user.userId);
    
    res.write('[');
    let isFirst = true;

    expenseStream.on('data', (doc) => {
      if (!isFirst) {
        res.write(',\n');
      }
      res.write(JSON.stringify(doc));
      isFirst = false;
    });

    expenseStream.on('end', () => {
      res.write(']');
      res.end();
    });

    expenseStream.on('error', (err) => {
      console.error('Stream Error:', err);
      res.status(500).json({ success: false, message: 'Export stream failed.' });
    });
  }


  @Get()
  @ApiOperation({ summary: 'Get all expenses (User-Scoped) with advanced filters and pagination' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search by title or note' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number })
  @ApiQuery({ name: 'paymentMethod', required: false, type: String, description: 'e.g., cash, card' })
  @ApiQuery({ name: 'month', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  findAll(
    @Query() queryDto: QueryExpenseDto,
    @User() user: ReqUser,
  ) { 
    return this.expensesService.findAll(queryDto, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single expense by ID (User-Scoped)' })
  findOne(
    @Param('id', MongoIdPipe) id: string,
    @User() user: ReqUser,
  ) {
    return this.expensesService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense by ID (User-Scoped)' })
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @User() user: ReqUser,
  ) {
    return this.expensesService.update(id, updateExpenseDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an expense by ID (User-Scoped)' })
  remove(
    @Param('id', MongoIdPipe) id: string,
    @User() user: ReqUser,
  ) {
    return this.expensesService.remove(id, user.userId);
  }
}