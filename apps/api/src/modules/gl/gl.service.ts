import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GlService {
  constructor(private prisma: PrismaService) {}

  async getChartOfAccounts() {
    const accounts = await this.prisma.account.findMany({
      include: { children: true },
      where: { parentId: null },
      orderBy: { code: 'asc' },
    });
    return accounts;
  }

  async getAllAccounts(query: any) {
    const { type, search } = query;
    const where: any = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.account.findMany({ where, orderBy: { code: 'asc' } });
  }

  async createAccount(dto: any) {
    return this.prisma.account.create({ data: dto });
  }

  async getJournalEntries(query: any) {
    const { page = 1, limit = 20, transactionType, startDate, endDate } = query;
    const where: any = {};
    if (transactionType) where.transactionType = transactionType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    const [data, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where, skip: (page - 1) * limit, take: +limit,
        include: {
          postedBy: { select: { firstName: true, lastName: true } },
          lines: { include: { debitAccount: true, creditAccount: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.journalEntry.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit, pages: Math.ceil(total / limit) };
  }

  async createJournalEntry(dto: any, userId: string) {
    const { lines, ...entryData } = dto;
    const totalDebit = lines.filter((l: any) => l.debitAccountId).reduce((s: number, l: any) => s + l.amount, 0);
    const totalCredit = lines.filter((l: any) => l.creditAccountId).reduce((s: number, l: any) => s + l.amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException('Journal entry must balance: total debits must equal total credits');
    }

    const count = await this.prisma.journalEntry.count();
    return this.prisma.journalEntry.create({
      data: {
        ...entryData,
        entryNumber: `JE-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`,
        postedById: userId,
        lines: { create: lines },
      },
      include: { lines: { include: { debitAccount: true, creditAccount: true } } },
    });
  }

  async getTrialBalance() {
    const accounts = await this.prisma.account.findMany({
      include: {
        debitLines: true,
        creditLines: true,
      },
      orderBy: { code: 'asc' },
    });

    return accounts.map(account => {
      const totalDebits = account.debitLines.reduce((sum, line) => sum + +line.amount, 0);
      const totalCredits = account.creditLines.reduce((sum, line) => sum + +line.amount, 0);
      const balance = account.normalBalance === 'DEBIT'
        ? totalDebits - totalCredits
        : totalCredits - totalDebits;

      return {
        code: account.code,
        name: account.name,
        type: account.type,
        normalBalance: account.normalBalance,
        debitTotal: totalDebits,
        creditTotal: totalCredits,
        balance,
      };
    }).filter(a => a.balance !== 0 || a.debitTotal !== 0);
  }

  async getProfitAndLoss(startDate?: string, endDate?: string) {
    const where: any = { isPosted: true };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const incomeAccounts = await this.prisma.account.findMany({
      where: { type: 'INCOME' },
      include: { creditLines: { where: { journalEntry: where } } },
    });
    const expenseAccounts = await this.prisma.account.findMany({
      where: { type: 'EXPENSE' },
      include: { debitLines: { where: { journalEntry: where } } },
    });

    const income = incomeAccounts.map(a => ({
      code: a.code, name: a.name,
      amount: a.creditLines.reduce((s, l) => s + +l.amount, 0),
    }));
    const expenses = expenseAccounts.map(a => ({
      code: a.code, name: a.name,
      amount: a.debitLines.reduce((s, l) => s + +l.amount, 0),
    }));

    const totalIncome = income.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    return { income, expenses, totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses };
  }

  async getBalanceSheet() {
    const trialBalance = await this.getTrialBalance();
    const byType = (type: string) => trialBalance
      .filter(a => a.type === type)
      .reduce((s, a) => s + a.balance, 0);

    return {
      assets: trialBalance.filter(a => a.type === 'ASSET'),
      liabilities: trialBalance.filter(a => a.type === 'LIABILITY'),
      equity: trialBalance.filter(a => a.type === 'EQUITY'),
      totalAssets: byType('ASSET'),
      totalLiabilities: byType('LIABILITY'),
      totalEquity: byType('EQUITY'),
    };
  }
}
