import { Module } from '@nestjs/common';
import { FixedDepositsService } from './fixed-deposits.service';
import { FixedDepositsController } from './fixed-deposits.controller';

@Module({ controllers: [FixedDepositsController], providers: [FixedDepositsService], exports: [FixedDepositsService] })
export class FixedDepositsModule {}
