import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string; 

  @Prop({ default: false, select: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null, select: false })
  deletedAt: Date | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Hide __v
CategorySchema.set('toJSON', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });
CategorySchema.set('toObject', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });