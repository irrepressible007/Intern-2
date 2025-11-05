import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  Logger, // Import Logger
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// Import 'type' for the interface
import { User, type ReqUser } from 'src/auth/user.decorator'; 
import { existsSync, mkdirSync } from 'fs'; // Import fs utilities

// --- Multer Storage Configuration ---
const storage = diskStorage({
  // Destination folder
  destination: (req, file, cb) => {
    const uploadPath = './uploads';
    // Ensure 'uploads' directory exists
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  // File naming
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = extname(file.originalname);
    // Use the user's ID in the filename to help organize
    const userId = (req.user as ReqUser)?.userId || 'unknown';
    cb(null, `receipt-${userId}-${uniqueSuffix}${extension}`);
  },
});
// ---------------------------------

// Type for the successful upload response
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
  private readonly logger = new Logger(UploadsController.name);

  /**
   * API: POST /uploads/receipt
   * Handles single file upload and returns metadata.
   */
  @Post('receipt')
  @UseInterceptors(FileInterceptor('receipt', { storage })) // 'receipt' is the field name
  @ApiConsumes('multipart/form-data') // Tell Swagger it's a file upload
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        receipt: { // This must match the FileInterceptor field name
          type: 'string',
          format: 'binary',
          description: 'Receipt image (PNG, JPG) or PDF (Max 3MB)',
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
          new MaxFileSizeValidator({ maxSize: 3 * 1024 * 1024 }), // 3 MB
          // Task 7: Validate mime type (images or PDF)
          new FileTypeValidator({ fileType: 'image/(jpeg|png|gif)|application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File, // TypeScript type for uploaded file
    @User() user: ReqUser,
  ): FileUploadResponse {
    this.logger.log(`User ${user.email} uploaded file: ${file.filename}`);

    // In a production app, 'url' would be a signed S3/GCP URL.
    // For local dev, we return the static path we will create.
    return {
      fileId: file.filename,
      url: `/uploads/${file.filename}`, // This is the path to the file
      mime: file.mimetype,
      size: file.size,
    };
  }
}