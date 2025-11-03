import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ _id: false }) // This tells Mongoose not to create a separate _id for this embedded document
export class Receipt {
  @ApiProperty()
  @Prop({ required: true })
  fileId: string; 

  @ApiProperty()
  @Prop({ required: true })
  url: string; // The URL returned by the upload API

  @ApiProperty()
  @Prop({ required: true })
  mime: string; 

  @ApiProperty()
  @Prop({ required: true })
  size: number;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);