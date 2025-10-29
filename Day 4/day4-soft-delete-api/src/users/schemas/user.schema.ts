import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

// Task 5: Adds createdAt and updatedAt
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  // Task 5: email(unique)
  @Prop({ required: true, unique: true })
  email: string;

  // Task 5: age
  @Prop({ required: true })
  age: number;

  // Task 6: Soft Delete fields
  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);