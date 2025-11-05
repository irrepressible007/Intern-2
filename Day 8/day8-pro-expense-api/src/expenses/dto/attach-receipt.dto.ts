import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

// DTO representing the receipt data structure (must match receipt.schema.ts)
class ReceiptDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileId: string; 

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mime: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  size: number;
}

// DTO for the body of the PUT request
export class AttachReceiptDto {
    // This allows the client to send either the full object OR null (to remove the receipt)
    @ApiPropertyOptional({ 
        type: ReceiptDto, 
        description: 'Receipt metadata object. Send { "receipt": null } to remove.' 
    })
    @IsOptional()
    @ValidateNested() // Tell the validator to check the nested object
    @Type(() => ReceiptDto) // Tell the transformer what type to create
    receipt: ReceiptDto | null;
}