import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ _id: false }) // _id: false = this is an embedded document
export class Receipt {
  @ApiProperty()
  @Prop({ required: true })
  fileId: string; // The filename (e.g., receipt-12345.png)

  @ApiProperty()
  @Prop({ required: true })
  url: string; // The public URL (e.g., /uploads/receipt-12345.png)

  @ApiProperty()
  @Prop({ required: true })
  mime: string; // e.g., 'image/png'

  @ApiProperty()
  @Prop({ required: true })
  size: number; // Size in bytes
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);