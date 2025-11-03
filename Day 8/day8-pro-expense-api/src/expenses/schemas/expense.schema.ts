import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Category } from 'src/categories/schemas/category.schema';
import { User } from 'src/users/schemas/user.schema';
import { RecurringExpense } from 'src/recurring-expenses/schemas/recurring-expense.schema';
import { PaymentMethod } from './payment-method.enum';
import { Receipt, ReceiptSchema } from './receipt.schema'; // <-- 1. Import Receipt Schema

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Category',
    required: true, 
    index: true 
  })
  categoryId: Category;

  @Prop({ 
    required: true, 
    default: Date.now, 
    index: true 
  })
  date: Date;

  @Prop()
  note?: string;
  
  @Prop({ 
    type: String, 
    enum: Object.values(PaymentMethod), 
    default: PaymentMethod.OTHER,
    index: true,
  })
  paymentMethod: PaymentMethod;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];
  
  // --- Task 7: Receipt Field ---
  @Prop({ type: ReceiptSchema, default: null }) // <-- 2. Add embedded Receipt
  receipt: Receipt | null;
  // -------------------------

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'RecurringExpense', 
    default: null,
    index: true 
  })
  recurringExpenseId: RecurringExpense | null;

  // ... (Soft Delete Fields)
  @Prop({ default: false, select: false })
  isDeleted: boolean;
  @Prop({ type: Date, default: null, select: false })
  deletedAt: Date | null;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null, select: false })
  deletedBy: MongooseSchema.Types.ObjectId | null; 
  @Prop({ type: String, default: null, select: false })
  deleteReason: string | null;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

// Indexes 
ExpenseSchema.index({ recurringExpenseId: 1, date: 1 }, { unique: true, sparse: true });
ExpenseSchema.index({ userId: 1, date: -1 });

// Hide __v
ExpenseSchema.set('toJSON', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });
ExpenseSchema.set('toObject', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });