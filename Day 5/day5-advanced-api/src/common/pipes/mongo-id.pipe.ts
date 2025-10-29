import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class MongoIdPipe implements PipeTransform<string> {
  transform(value: string): string {
    // Check if the incoming 'value' is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException('Invalid MongoDB ID');
    }
    // If it's valid, return it unchanged
    return value;
  }
}