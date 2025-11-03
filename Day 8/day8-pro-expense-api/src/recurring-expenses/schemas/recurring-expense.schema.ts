import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Category } from 'src/categories/schemas/category.schema';

export type RecurringExpenseDocument = HydratedDocument<RecurringExpense>;

// Define the allowed cadences as a type
export enum Cadence {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Schema({ timestamps: true })
export class RecurringExpense {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true, index: true })
  categoryId: Category;

  @Prop({ 
    required: true,
    enum: Object.values(Cadence),
  })
  cadence: Cadence;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({ required: true, index: true })
  nextRunDate: Date;
  
  // We'll add a simple soft delete for this module too
  @Prop({ default: false, select: false })
  isDeleted: boolean;
}

export const RecurringExpenseSchema = SchemaFactory.createForClass(RecurringExpense);

// Compound index to help the worker find tasks efficiently
// FIX: Changed 'isDeleted: 0' to 'isDeleted: 1'
RecurringExpenseSchema.index({ nextRunDate: 1, isDeleted: 1 }); 

// Compound index for user-specific queries
// FIX: Changed 'isDeleted: 0' to 'isDeleted: 1'
RecurringExpenseSchema.index({ userId: 1, isDeleted: 1 }); 

// Hide __v
RecurringExpenseSchema.set('toJSON', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });
RecurringExpenseSchema.set('toObject', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });