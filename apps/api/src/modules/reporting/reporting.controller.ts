import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reporting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reporting')
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  @Get('loan-portfolio') getLoanPortfolio(@Query() q: any) { return this.reportingService.getLoanPortfolioReport(q); }
  @Get('overdue-aging') getOverdueAging() { return this.reportingService.getOverdueAgingReport(); }
  @Get('branch-performance') getBranchPerformance() { return this.reportingService.getBranchPerformanceReport(); }
  @Get('recovery') getRecovery() { return this.reportingService.getRecoveryReport(); }
}
