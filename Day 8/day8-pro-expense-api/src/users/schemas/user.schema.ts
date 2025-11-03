import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true, select: false }) // select: false hides password from queries
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// --- Mongoose Pre-save Hook to Hash Password ---
UserSchema.pre<UserDocument>('save', async function (next) {
  // 'this' refers to the document being saved
  
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password with 10 salt rounds
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error); // Pass error to the next middleware
  }
});
// ----------------------------------------------

// Hide __v from responses
UserSchema.set('toJSON', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });
UserSchema.set('toObject', { transform: (doc, ret) => { delete (ret as any).__v; return ret; } });