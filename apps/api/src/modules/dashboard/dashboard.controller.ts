import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('kpis') getKpis() { return this.dashboardService.getKpis(); }
  @Get('monthly-collections') getMonthlyCollections() { return this.dashboardService.getMonthlyCollectionTrend(); }
  @Get('loan-portfolio') getLoanPortfolio() { return this.dashboardService.getLoanPortfolioByStatus(); }
  @Get('branch-performance') getBranchPerformance() { return this.dashboardService.getBranchPerformance(); }
  @Get('overdue-aging') getOverdueAging() { return this.dashboardService.getOverdueAging(); }
  @Get('recovery-performance') getRecoveryPerformance() { return this.dashboardService.getRecoveryPerformance(); }
}
