import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loans')
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Post()
  @Roles('ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER')
  create(@Body() dto: CreateLoanDto) { return this.loansService.create(dto); }

  @Get()
  findAll(@Query() query: any) { return this.loansService.findAll(query); }

  @Get('stats')
  getStats() { return this.loansService.getStats(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.loansService.findOne(id); }

  @Patch(':id/approve')
  @Roles('ADMIN', 'BRANCH_MANAGER')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.loansService.approve(id, req.user.id);
  }

  @Patch(':id/disburse')
  @Roles('ADMIN', 'BRANCH_MANAGER', 'TELLER')
  disburse(@Param('id') id: string, @Request() req: any) {
    return this.loansService.disburse(id, req.user.id);
  }

  @Post(':id/repayment')
  @Roles('ADMIN', 'BRANCH_MANAGER', 'TELLER')
  processRepayment(
    @Param('id') id: string,
    @Body() body: { amount: number; paymentMethod?: string },
    @Request() req: any,
  ) {
    return this.loansService.processRepayment(id, body.amount, req.user.id, body.paymentMethod);
  }
}
