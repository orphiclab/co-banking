import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RecoveryService } from './recovery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Recovery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recovery')
export class RecoveryController {
  constructor(private recoveryService: RecoveryService) {}

  @Get() findAll(@Query() query: any) { return this.recoveryService.findAll(query); }
  @Get('stats') getStats() { return this.recoveryService.getStats(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.recoveryService.findOne(id); }

  @Post(':id/action') @Roles('ADMIN', 'BRANCH_MANAGER', 'RECOVERY_OFFICER')
  addAction(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.recoveryService.addAction(id, req.user.id, body.actionType, body.description, body.amount);
  }

  @Patch(':id/settle') @Roles('ADMIN', 'BRANCH_MANAGER')
  settle(@Param('id') id: string, @Body() body: { settlementAmount: number }) {
    return this.recoveryService.settle(id, body.settlementAmount);
  }

  @Patch(':id/write-off') @Roles('ADMIN')
  writeOff(@Param('id') id: string) { return this.recoveryService.writeOff(id); }
}
