import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RecoveryService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async detectOverdueAccounts() {
    const today = new Date();
    const overdueInstallments = await this.prisma.loanInstallment.findMany({
      where: { status: 'PENDING', dueDate: { lt: today } },
      include: { loan: true },
    });

    for (const installment of overdueInstallments) {
      await this.prisma.loanInstallment.update({
        where: { id: installment.id },
        data: { status: 'OVERDUE' },
      });

      const existingCase = await this.prisma.recoveryCase.findUnique({
        where: { loanId: installment.loanId },
      });
      if (!existingCase) {
        const count = await this.prisma.recoveryCase.count();
        const overdueDays = Math.floor((today.getTime() - installment.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        await this.prisma.recoveryCase.create({
          data: {
            caseNumber: `RC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`,
            loanId: installment.loanId,
            overdueAmount: installment.remainingAmount,
            overdueDays,
            status: 'OPEN',
          },
        });
      }
    }
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, status } = query;
    const where: any = {};
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.recoveryCase.findMany({
        where, skip: (page - 1) * limit, take: +limit,
        include: {
          loan: { include: { customer: { select: { firstName: true, lastName: true, phone: true } } } },
          actions: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.recoveryCase.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    return this.prisma.recoveryCase.findUnique({
      where: { id },
      include: {
        loan: { include: { customer: true } },
        actions: { include: { performedBy: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async addAction(caseId: string, userId: string, actionType: string, description: string, amount?: number) {
    const recoveryCase = await this.prisma.recoveryCase.findUnique({ where: { id: caseId } });
    let newStatus = recoveryCase?.status;
    if (actionType === 'LEGAL_NOTICE') newStatus = 'LEGAL';
    else if (actionType === 'REMINDER' && recoveryCase?.status === 'OPEN') newStatus = 'REMINDED';
    else if (actionType === 'VISIT' && recoveryCase?.status === 'REMINDED') newStatus = 'ESCALATED';

    await this.prisma.recoveryAction.create({
      data: { caseId, performedById: userId, actionType, description, amount },
    });
    return this.prisma.recoveryCase.update({
      where: { id: caseId },
      data: { status: newStatus as any },
    });
  }

  async settle(caseId: string, settlementAmount: number) {
    return this.prisma.recoveryCase.update({
      where: { id: caseId },
      data: { status: 'SETTLED', settlementAmount, recoveredAmount: settlementAmount, closedAt: new Date() },
    });
  }

  async writeOff(caseId: string) {
    return this.prisma.recoveryCase.update({
      where: { id: caseId },
      data: { status: 'WRITTEN_OFF', closedAt: new Date() },
    });
  }

  async getStats() {
    const [total, open, escalated, settled, writtenOff] = await Promise.all([
      this.prisma.recoveryCase.count(),
      this.prisma.recoveryCase.count({ where: { status: 'OPEN' } }),
      this.prisma.recoveryCase.count({ where: { status: 'ESCALATED' } }),
      this.prisma.recoveryCase.count({ where: { status: 'SETTLED' } }),
      this.prisma.recoveryCase.count({ where: { status: 'WRITTEN_OFF' } }),
    ]);
    return { total, open, escalated, settled, writtenOff };
  }
}
