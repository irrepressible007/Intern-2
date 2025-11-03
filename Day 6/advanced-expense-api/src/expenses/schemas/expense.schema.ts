import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Category } from 'src/categories/schemas/category.schema'; // Import Category for relationship

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  amount: number;

  // This is the link to the Category collection
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Category', // This MUST match the name given in CategoryModule
    required: true, 
    index: true // Index for faster filtering by category
  })
  categoryId: Category; // Use the Category class for type-hinting

  @Prop({ 
    required: true, 
    default: Date.now, 
    index: true // Index for faster filtering by date/month
  })
  date: Date;

  @Prop() // Optional field
  note?: string;

  // --- Soft Delete Fields ---
  @Prop({ default: false, select: false }) // select: false hides it
  isDeleted: boolean;

  @Prop({ type: Date, default: null, select: false })
  deletedAt: Date | null;

  // We can also add the 'deletedBy' fields from your advanced list
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null, select: false })
  deletedBy: MongooseSchema.Types.ObjectId | null; 

  @Prop({ type: String, default: null, select: false })
  deleteReason: string | null;
  // ----------------------------
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

// Hide __v
ExpenseSchema.set('toJSON', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });
ExpenseSchema.set('toObject', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });