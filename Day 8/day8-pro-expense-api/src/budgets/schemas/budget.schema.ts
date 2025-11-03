import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Category } from 'src/categories/schemas/category.schema';

export type BudgetDocument = HydratedDocument<Budget>;

@Schema({ timestamps: true })
export class Budget {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: User;

  @Prop({
    required: true,
    // Store as 'YYYY-MM' string, DTO will validate format
    match: /^\d{4}-(0[1-9]|1[0-2])$/,
  })
  month: string; // Stored as "2025-10"

  @Prop({ required: true, min: 0 })
  limit: number; // The budget amount

  // This is optional.
  // If null, it's an "Overall" budget for the month.
  // If set, it's a budget for a specific category.
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
    default: null,
  })
  categoryId: Category | null;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);

// Task 4: Unique per (userId, month, categoryId)
// A user can't have two budgets for "Groceries" in "2025-10".
// A user can't have two "Overall" (null) budgets for "2025-10".
BudgetSchema.index({ userId: 1, month: 1, categoryId: 1 }, { unique: true });

// Hide __v
BudgetSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});
BudgetSchema.set('toObject', {
  transform: (doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});