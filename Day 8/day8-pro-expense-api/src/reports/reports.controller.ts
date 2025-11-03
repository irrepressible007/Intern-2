import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiOperation, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User, type ReqUser } from 'src/auth/user.decorator';
import { TrendQueryDto } from './dto/trend-query.dto'; // <-- 1. Import new DTO

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get monthly expense summary (User-Scoped)' })
  @ApiQuery({ name: 'month', required: true, type: String, example: '2025-10' })
  getMonthlySummary(
    @Query() queryDto: ReportQueryDto,
    @User() user: ReqUser,
  ) {
    return this.reportsService.getMonthlySummary(queryDto, user.userId);
  }

  // --- 2. ADD NEW ENDPOINT ---
  @Get('trend')
  @ApiOperation({ summary: 'Get monthly expense trend over a date range (User-Scoped)' })
  @ApiQuery({ name: 'from', required: true, type: String, example: '2025-01' })
  @ApiQuery({ name: 'to', required: true, type: String, example: '2025-10' })
  getMonthlyTrend(
    @Query() queryDto: TrendQueryDto,
    @User() user: ReqUser,
  ) {
    return this.reportsService.getMonthlyTrend(queryDto, user.userId);
  }
  // -------------------------
}