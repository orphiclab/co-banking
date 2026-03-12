import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FixedDepositsService {
  constructor(private prisma: PrismaService) {}

  calculateMaturityAmount(principal: number, annualRate: number, termMonths: number) {
    return +(principal * (1 + annualRate * (termMonths / 12))).toFixed(2);
  }

  calculateDailyAccrual(principal: number, annualRate: number) {
    return +(principal * annualRate / 365).toFixed(2);
  }

  async create(dto: any) {
    const count = await this.prisma.fixedDeposit.count();
    const fdNumber = `FD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const startDate = new Date();
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + dto.termMonths);
    const maturityAmount = this.calculateMaturityAmount(dto.principalAmount, dto.interestRate, dto.termMonths);

    // GL Posting
    await this.postFdJournal(dto.principalAmount, fdNumber);

    return this.prisma.fixedDeposit.create({
      data: { ...dto, fdNumber, startDate, maturityDate, maturityAmount, status: 'ACTIVE' },
      include: { customer: true, branch: true },
    });
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, search, status } = query;
    const where: any = {};
    if (status) where.status = status;
    if (search) where.OR = [
      { fdNumber: { contains: search, mode: 'insensitive' } },
      { customer: { firstName: { contains: search, mode: 'insensitive' } } },
    ];
    const [data, total] = await Promise.all([
      this.prisma.fixedDeposit.findMany({
        where, skip: (page - 1) * limit, take: +limit,
        include: { customer: { select: { firstName: true, lastName: true, customerNumber: true } }, branch: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.fixedDeposit.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const fd = await this.prisma.fixedDeposit.findUnique({
      where: { id },
      include: { customer: true, branch: true },
    });
    if (!fd) throw new NotFoundException('Fixed Deposit not found');
    return fd;
  }

  async accrueInterest(id: string) {
    const fd = await this.findOne(id);
    if (fd.status !== 'ACTIVE') throw new BadRequestException('FD is not active');
    const daily = this.calculateDailyAccrual(+fd.principalAmount, +fd.interestRate);
    return this.prisma.fixedDeposit.update({
      where: { id },
      data: { interestAccrued: { increment: daily } },
    });
  }

  async mature(id: string) {
    const fd = await this.findOne(id);
    if (fd.autoRenew) return this.renew(id);
    return this.prisma.fixedDeposit.update({
      where: { id },
      data: { status: 'MATURED', maturedAt: new Date() },
    });
  }

  async renew(id: string) {
    const fd = await this.findOne(id);
    await this.prisma.fixedDeposit.update({ where: { id }, data: { status: 'RENEWED', renewedAt: new Date() } });

    const count = await this.prisma.fixedDeposit.count();
    const newFd = await this.create({
      customerId: fd.customerId,
      branchId: fd.branchId,
      principalAmount: +fd.maturityAmount,
      interestRate: +fd.interestRate,
      termMonths: fd.termMonths,
      autoRenew: fd.autoRenew,
      parentFdId: fd.id,
    });
    return newFd;
  }

  async withdraw(id: string) {
    const fd = await this.findOne(id);
    if (fd.status !== 'ACTIVE') throw new BadRequestException('FD is not active');
    const today = new Date();
    const monthsElapsed = (today.getFullYear() - fd.startDate.getFullYear()) * 12
      + (today.getMonth() - fd.startDate.getMonth());
    const isPremature = monthsElapsed < fd.termMonths;
    const penalty = isPremature ? +fd.principalAmount * +fd.penaltyRate : 0;
    const withdrawalAmount = (+fd.maturityAmount) - penalty;

    return this.prisma.fixedDeposit.update({
      where: { id },
      data: { status: 'WITHDRAWN', withdrawnAt: today },
    });
  }

  async getStats() {
    const [total, active, matured, totalValue] = await Promise.all([
      this.prisma.fixedDeposit.count(),
      this.prisma.fixedDeposit.count({ where: { status: 'ACTIVE' } }),
      this.prisma.fixedDeposit.count({ where: { status: 'MATURED' } }),
      this.prisma.fixedDeposit.aggregate({ where: { status: 'ACTIVE' }, _sum: { principalAmount: true } }),
    ]);
    return { total, active, matured, totalValue: totalValue._sum.principalAmount || 0 };
  }

  private async postFdJournal(amount: number, fdNumber: string) {
    const cash = await this.prisma.account.findUnique({ where: { code: '1001' } });
    const fdLiability = await this.prisma.account.findUnique({ where: { code: '2001' } });
    if (!cash || !fdLiability) return;

    const count = await this.prisma.journalEntry.count();
    const systemUser = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!systemUser) return;

    await this.prisma.journalEntry.create({
      data: {
        entryNumber: `JE-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`,
        description: `FD creation - ${fdNumber}`,
        transactionType: 'FD_CREATION',
        reference: fdNumber, amount,
        postedById: systemUser.id,
        lines: {
          create: [
            { debitAccountId: cash.id, amount, description: 'FD funds received' },
            { creditAccountId: fdLiability.id, amount, description: 'FD liability recorded' },
          ],
        },
      },
    });
  }
}
