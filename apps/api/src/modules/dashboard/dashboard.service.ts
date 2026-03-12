import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis() {
    const [
      totalCustomers, totalLoans, totalLeases, totalFds,
      activeLoanPortfolio, activeFdPortfolio,
      overdueLoans, defaultedLoans,
      monthlyColl, recoveryCases
    ] = await Promise.all([
      this.prisma.customer.count({ where: { isActive: true } }),
      this.prisma.loan.count({ where: { status: 'ACTIVE' } }),
      this.prisma.lease.count({ where: { status: 'ACTIVE' } }),
      this.prisma.fixedDeposit.count({ where: { status: 'ACTIVE' } }),
      this.prisma.loan.aggregate({ where: { status: 'ACTIVE' }, _sum: { outstandingBalance: true } }),
      this.prisma.fixedDeposit.aggregate({ where: { status: 'ACTIVE' }, _sum: { principalAmount: true } }),
      this.prisma.loanInstallment.count({ where: { status: 'OVERDUE' } }),
      this.prisma.loan.count({ where: { status: 'DEFAULTED' } }),
      this.prisma.loanRepayment.aggregate({
        where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
        _sum: { amount: true },
      }),
      this.prisma.recoveryCase.count({ where: { status: { not: 'SETTLED' } } }),
    ]);

    return {
      totalCustomers,
      totalActiveLoans: totalLoans,
      totalActiveLeases: totalLeases,
      totalActiveFDs: totalFds,
      loanPortfolioValue: activeLoanPortfolio._sum.outstandingBalance || 0,
      fdTotalValue: activeFdPortfolio._sum.principalAmount || 0,
      overdueInstallments: overdueLoans,
      defaultedLoans,
      monthlyCollections: monthlyColl._sum.amount || 0,
      openRecoveryCases: recoveryCases,
    };
  }

  async getMonthlyCollectionTrend() {
    const months: { month: string; collections: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const result = await this.prisma.loanRepayment.aggregate({
        where: { createdAt: { gte: start, lt: end } },
        _sum: { amount: true },
      });

      months.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        collections: +(result._sum.amount || 0),
      });
    }
    return months;
  }

  async getLoanPortfolioByStatus() {
    const statuses = ['ACTIVE', 'CLOSED', 'DEFAULTED', 'WRITTEN_OFF', 'SUBMITTED', 'APPROVED'];
    const data = await Promise.all(
      statuses.map(async (status) => {
        const count = await this.prisma.loan.count({ where: { status: status as any } });
        const agg = await this.prisma.loan.aggregate({ where: { status: status as any }, _sum: { outstandingBalance: true } });
        return { status, count, value: +(agg._sum.outstandingBalance || 0) };
      })
    );
    return data.filter(d => d.count > 0);
  }

  async getBranchPerformance() {
    const branches = await this.prisma.branch.findMany({
      include: {
        loans: { select: { outstandingBalance: true, status: true } },
        fds: { select: { principalAmount: true, status: true } },
        customers: { select: { id: true } },
      },
    });

    return branches.map(b => ({
      id: b.id,
      name: b.name,
      code: b.code,
      totalCustomers: b.customers.length,
      totalLoans: b.loans.length,
      activeLoans: b.loans.filter(l => l.status === 'ACTIVE').length,
      loanPortfolio: b.loans.reduce((s, l) => s + +(l.outstandingBalance || 0), 0),
      fdPortfolio: b.fds.filter(f => f.status === 'ACTIVE').reduce((s, f) => s + +f.principalAmount, 0),
    }));
  }

  async getOverdueAging() {
    const buckets = [
      { label: '1-30 days', min: 0, max: 30 },
      { label: '31-60 days', min: 30, max: 60 },
      { label: '61-90 days', min: 60, max: 90 },
      { label: '91-120 days', min: 90, max: 120 },
      { label: '120+ days', min: 120, max: 9999 },
    ];

    const today = new Date();
    return Promise.all(buckets.map(async (bucket) => {
      const minDate = new Date(today);
      minDate.setDate(minDate.getDate() - bucket.max);
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() - bucket.min);

      const agg = await this.prisma.loanInstallment.aggregate({
        where: {
          status: 'OVERDUE',
          dueDate: { gte: minDate, lt: maxDate },
        },
        _count: { id: true },
        _sum: { remainingAmount: true },
      });

      return {
        label: bucket.label,
        count: agg._count.id,
        amount: +(agg._sum.remainingAmount || 0),
      };
    }));
  }

  async getRecoveryPerformance() {
    const [total, open, escalated, settled, writtenOff] = await Promise.all([
      this.prisma.recoveryCase.count(),
      this.prisma.recoveryCase.count({ where: { status: 'OPEN' } }),
      this.prisma.recoveryCase.count({ where: { status: 'ESCALATED' } }),
      this.prisma.recoveryCase.count({ where: { status: 'SETTLED' } }),
      this.prisma.recoveryCase.count({ where: { status: 'WRITTEN_OFF' } }),
    ]);

    const recoveredAgg = await this.prisma.recoveryCase.aggregate({
      where: { status: 'SETTLED' },
      _sum: { recoveredAmount: true },
    });

    const overdueAgg = await this.prisma.recoveryCase.aggregate({
      _sum: { overdueAmount: true },
    });

    const recoveryRate = overdueAgg._sum.overdueAmount
      ? (+recoveredAgg._sum.recoveredAmount! / +overdueAgg._sum.overdueAmount!) * 100
      : 0;

    return { total, open, escalated, settled, writtenOff, recoveryRate: +recoveryRate.toFixed(2) };
  }
}
