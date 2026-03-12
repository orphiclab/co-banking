import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GlService } from './gl.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('General Ledger')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gl')
export class GlController {
  constructor(private glService: GlService) {}

  @Get('accounts') getAllAccounts(@Query() query: any) { return this.glService.getAllAccounts(query); }
  @Get('accounts/tree') getChartOfAccounts() { return this.glService.getChartOfAccounts(); }
  @Post('accounts') @Roles('ADMIN') createAccount(@Body() dto: any) { return this.glService.createAccount(dto); }
  @Get('journal-entries') getJournalEntries(@Query() query: any) { return this.glService.getJournalEntries(query); }
  @Post('journal-entries') @Roles('ADMIN', 'BRANCH_MANAGER')
  createJournalEntry(@Body() dto: any, @Request() req: any) { return this.glService.createJournalEntry(dto, req.user.id); }
  @Get('trial-balance') getTrialBalance() { return this.glService.getTrialBalance(); }
  @Get('profit-and-loss') getProfitAndLoss(@Query() q: any) { return this.glService.getProfitAndLoss(q.startDate, q.endDate); }
  @Get('balance-sheet') getBalanceSheet() { return this.glService.getBalanceSheet(); }
}
