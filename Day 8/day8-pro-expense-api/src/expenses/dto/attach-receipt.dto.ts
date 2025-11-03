import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

// DTO representing the receipt data structure (must match receipt.schema.ts)
export class ReceiptDto {
  @ApiProperty({ description: 'Unique file ID returned by the upload endpoint', example: 'receipt-169803e5d0a66c659621f86.pdf' })
  @IsString()
  @IsNotEmpty()
  fileId: string; 

  @ApiProperty({ description: 'Public URL to access the file', example: '/uploads/receipt-169803e5d0a66c659621f86.pdf' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'MIME type (e.g., application/pdf)', example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mime: string;

  @ApiProperty({ description: 'File size in bytes', example: 125000 })
  @IsNumber()
  @IsNotEmpty()
  size: number;
}

// DTO for the body of the PUT request
export class AttachReceiptDto {
    @ApiPropertyOptional({ 
        type: ReceiptDto, 
        description: 'Receipt metadata object. Send null to remove the receipt.' 
    })
    @IsOptional()
    @ValidateNested() 
    @Type(() => ReceiptDto) 
    receipt: ReceiptDto | null;
}