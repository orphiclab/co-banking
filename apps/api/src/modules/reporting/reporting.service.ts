import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  async getLoanPortfolioReport(query: any) {
    const { branchId, status, startDate, endDate } = query;
    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const loans = await this.prisma.loan.findMany({
      where,
      include: {
        customer: { select: { firstName: true, lastName:true, customerNumber: true } },
        branch: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      total: loans.length,
      totalPrincipal: loans.reduce((s, l) => s + +l.principalAmount, 0),
      totalOutstanding: loans.reduce((s, l) => s + +l.outstandingBalance, 0),
      totalCollected: loans.reduce((s, l) => s + +l.totalPaid, 0),
      byStatus: {} as Record<string, { count: number; amount: number }>,
    };

    loans.forEach(l => {
      if (!summary.byStatus[l.status]) summary.byStatus[l.status] = { count: 0, amount: 0 };
      summary.byStatus[l.status].count++;
      summary.byStatus[l.status].amount += +l.outstandingBalance;
    });

    return { summary, data: loans };
  }

  async getOverdueAgingReport() {
    const today = new Date();
    const overdueInstallments = await this.prisma.loanInstallment.findMany({
      where: { status: 'OVERDUE' },
      include: {
        loan: {
          include: {
            customer: { select: { firstName: true, lastName: true, phone: true, customerNumber: true } },
            branch: { select: { name: true } },
          },
        },
      },
    });

    const aged = overdueInstallments.map(inst => {
      const days = Math.floor((today.getTime() - inst.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const bucket = days <= 30 ? '1-30' : days <= 60 ? '31-60' : days <= 90 ? '61-90' : days <= 120 ? '91-120' : '120+';
      return { ...inst, overdueDays: days, agingBucket: bucket };
    });

    return aged.sort((a, b) => b.overdueDays - a.overdueDays);
  }

  async getBranchPerformanceReport() {
    const branches = await this.prisma.branch.findMany({
      include: {
        loans: { select: { status: true, principalAmount: true, totalPaid: true, outstandingBalance: true } },
        fds: { select: { status: true, principalAmount: true } },
        customers: { select: { id: true, kycStatus: true } },
      },
    });

    return branches.map(b => {
      const activeLoans = b.loans.filter(l => l.status === 'ACTIVE');
      const collectionRate = b.loans.length > 0
        ? (b.loans.reduce((s, l) => s + +l.totalPaid, 0) / b.loans.reduce((s, l) => s + +l.principalAmount, 0)) * 100
        : 0;

      return {
        id: b.id, name: b.name, code: b.code,
        totalCustomers: b.customers.length,
        kycVerified: b.customers.filter(c => c.kycStatus === 'VERIFIED').length,
        totalLoans: b.loans.length,
        activeLoans: activeLoans.length,
        totalDisbursed: b.loans.reduce((s, l) => s + +l.principalAmount, 0),
        totalCollected: b.loans.reduce((s, l) => s + +l.totalPaid, 0),
        outstanding: b.loans.reduce((s, l) => s + +l.outstandingBalance, 0),
        collectionRate: +collectionRate.toFixed(2),
        fdPortfolio: b.fds.filter(f => f.status === 'ACTIVE').reduce((s, f) => s + +f.principalAmount, 0),
      };
    });
  }

  async getRecoveryReport() {
    const cases = await this.prisma.recoveryCase.findMany({
      include: {
        loan: {
          include: {
            customer: { select: { firstName: true, lastName: true, customerNumber: true, phone: true } },
          },
        },
        actions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { overdueDays: 'desc' },
    });

    const summary = {
      totalCases: cases.length,
      totalOverdueAmount: cases.reduce((s, c) => s + +c.overdueAmount, 0),
      totalRecovered: cases.reduce((s, c) => s + +c.recoveredAmount, 0),
      recoveryRate: 0,
    };

    if (summary.totalOverdueAmount > 0) {
      summary.recoveryRate = +((summary.totalRecovered / summary.totalOverdueAmount) * 100).toFixed(2);
    }

    return { summary, data: cases };
  }
}
