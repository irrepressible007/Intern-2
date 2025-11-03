import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportQueryDto } from './dto/report-query.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get monthly expense summary (total & by category)' })
  @ApiQuery({ name: 'month', required: true, type: String, description: 'Month (YYYY-MM)', example: '2025-10' })
  getMonthlySummary(@Query() queryDto: ReportQueryDto) {
    // ValidationPipe runs automatically on queryDto
    return this.reportsService.getMonthlySummary(queryDto);
  }
}