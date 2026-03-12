import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LoansModule } from './modules/loans/loans.module';
import { LeasesModule } from './modules/leases/leases.module';
import { FixedDepositsModule } from './modules/fixed-deposits/fixed-deposits.module';
import { GlModule } from './modules/gl/gl.module';
import { RecoveryModule } from './modules/recovery/recovery.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    LoansModule,
    LeasesModule,
    FixedDepositsModule,
    GlModule,
    RecoveryModule,
    NotificationsModule,
    ReportingModule,
    DashboardModule,
  ],
})
export class AppModule {}
