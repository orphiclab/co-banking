import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Leases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leases')
export class LeasesController {
  constructor(private leasesService: LeasesService) {}

  @Post() @Roles('ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER')
  create(@Body() dto: any) { return this.leasesService.create(dto); }

  @Get() findAll(@Query() query: any) { return this.leasesService.findAll(query); }
  @Get('stats') getStats() { return this.leasesService.getStats(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.leasesService.findOne(id); }

  @Patch(':id/activate') @Roles('ADMIN', 'BRANCH_MANAGER')
  activate(@Param('id') id: string) { return this.leasesService.activate(id); }

  @Post(':id/payment') @Roles('ADMIN', 'BRANCH_MANAGER', 'TELLER')
  processPayment(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.leasesService.processPayment(id, body.amount);
  }
}
