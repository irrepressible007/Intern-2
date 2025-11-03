import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  Put, // Import Put for the PUT /expenses/:id/receipt route
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// FIX: Use 'import type' for the ReqUser interface to fix TS1272
import { User, type ReqUser } from 'src/auth/user.decorator'; 
import { ExpensesService } from 'src/expenses/expenses.service'; // Import service
import { AttachReceiptDto } from 'src/expenses/dto/attach-receipt.dto'; // Import DTO

// Destination storage configuration for Multer
const storage = diskStorage({
  destination: './uploads', // Files will be saved here in the project root
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

// Type definition for the successful upload response
interface FileUploadResponse {
  fileId: string;
  url: string;
  mime: string;
  size: number;
}

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly expensesService: ExpensesService) {} // Inject ExpensesService

  /**
   * API: POST /uploads/receipt
   * Handles single file upload and returns metadata.
   */
  @Post('receipt')
  @UseInterceptors(FileInterceptor('receipt', { storage })) // 'receipt' is the field name
  @ApiConsumes('multipart/form-data') // Swagger documentation for file upload
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        receipt: {
          type: 'string',
          format: 'binary',
          description: 'Receipt image (PNG, JPG) or PDF',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a receipt (image or PDF, max 3MB)' })
  uploadReceipt(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Task 7: Validate file size (max 3MB)
          new MaxFileSizeValidator({ maxSize: 3 * 1024 * 1024 }),
          // Task 7: Validate mime type (images or PDF)
          new FileTypeValidator({ fileType: 'image/(jpeg|png|gif)|application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File, // TypeScript type for uploaded file
    @User() user: ReqUser, // Now correctly imported
  ): FileUploadResponse {
    // Return the metadata required for the AttachReceiptDto
    return {
      fileId: file.filename,
      url: `/uploads/${file.filename}`, // Placeholder URL path
      mime: file.mimetype,
      size: file.size,
    };
  }
  
  // Note: We don't expose PUT /expenses/:id/receipt here, as that is in ExpensesController
}