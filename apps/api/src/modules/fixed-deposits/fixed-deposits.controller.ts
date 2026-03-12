import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FixedDepositsService } from './fixed-deposits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Fixed Deposits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fixed-deposits')
export class FixedDepositsController {
  constructor(private fdService: FixedDepositsService) {}

  @Post() @Roles('ADMIN', 'BRANCH_MANAGER', 'TELLER')
  create(@Body() dto: any) { return this.fdService.create(dto); }

  @Get() findAll(@Query() query: any) { return this.fdService.findAll(query); }
  @Get('stats') getStats() { return this.fdService.getStats(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.fdService.findOne(id); }
  @Patch(':id/accrue') accrueInterest(@Param('id') id: string) { return this.fdService.accrueInterest(id); }
  @Patch(':id/mature') @Roles('ADMIN', 'BRANCH_MANAGER') mature(@Param('id') id: string) { return this.fdService.mature(id); }
  @Patch(':id/renew') @Roles('ADMIN', 'BRANCH_MANAGER') renew(@Param('id') id: string) { return this.fdService.renew(id); }
  @Patch(':id/withdraw') @Roles('ADMIN', 'BRANCH_MANAGER', 'TELLER') withdraw(@Param('id') id: string) { return this.fdService.withdraw(id); }
}
