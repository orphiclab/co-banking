import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post() create(@Body() dto: CreateCustomerDto) { return this.customersService.create(dto); }
  @Get() findAll(@Query() query: any) { return this.customersService.findAll(query); }
  @Get('stats') getStats() { return this.customersService.getStats(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.customersService.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) { return this.customersService.update(id, dto); }
  @Patch(':id/kyc') updateKyc(@Param('id') id: string, @Body() body: { kycStatus: string }) {
    return this.customersService.updateKyc(id, body.kycStatus);
  }
  @Patch(':id/risk-score') updateRiskScore(@Param('id') id: string, @Body() body: { score: number }) {
    return this.customersService.updateRiskScore(id, body.score);
  }
}
