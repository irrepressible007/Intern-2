import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import slugify from 'slugify';
import { User } from 'src/users/schemas/user.schema'; // Import User for ref

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User; // <-- 1. ADDED userId field

  @Prop({ required: true })
  name: string;

  @Prop({ required: true }) // <-- 2. REMOVED unique:true from here
  slug: string;

  // --- Soft Delete Fields ---
  @Prop({ default: false, select: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null, select: false })
  deletedAt: Date | null;

  // Task 5: Soft-Delete Audit Fields
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null, select: false })
  deletedBy: MongooseSchema.Types.ObjectId | null; 
  
  @Prop({ type: String, default: null, select: false })
  deleteReason: string | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Task 2: Compound unique index for (userId, slug)
// A user cannot have two categories with the same slug.
CategorySchema.index({ userId: 1, slug: 1 }, { unique: true });

// Hide __v from responses
CategorySchema.set('toJSON', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });
CategorySchema.set('toObject', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });