import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import slugify from 'slugify';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  // Task 1: Case-insensitive unique slug
  // We will manually generate this in the service
  @Prop({ required: true, unique: true })
  slug: string;

  // Task 5: Soft-Delete Audit Fields
  @Prop({ default: false, select: false }) // select: false hides it from default queries
  isDeleted: boolean;

  @Prop({ type: Date, default: null, select: false })
  deletedAt: Date | null;

  // In a real app, you'd get the userId from an @User() decorator
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null, select: false })
  deletedBy: MongooseSchema.Types.ObjectId | null; 

  @Prop({ type: String, default: null, select: false })
  deleteReason: string | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Task 1: Case-insensitive unique index on 'slug'
// While our service logic creates a lowercase slug, this adds database-level protection
// This is an alternative to a 'lowerEmail' field from your task list
CategorySchema.index({ slug: 1 }, { 
  unique: true, 
  collation: { locale: 'en', strength: 2 } // strength: 2 = case-insensitive
});

// Hide __v from responses
CategorySchema.set('toJSON', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });
CategorySchema.set('toObject', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });