import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true }) // Task 5: adds createdAt, updatedAt
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  age: number;

  // Task 6: Soft Delete fields
  // select: false hides this field from query results by default
  @Prop({ default: false, select: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null, select: false })
  deletedAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

// --- Task 6: Hide __v from JSON responses ---
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    // This is the fix: cast 'ret' to 'any' to allow 'delete'
    delete (ret as any).__v;
    return ret;
  },
});

UserSchema.set('toObject', {
  transform: (doc, ret) => {
    // This is the fix: cast 'ret' to 'any' to allow 'delete'
    delete (ret as any).__v;
    return ret;
  },
});