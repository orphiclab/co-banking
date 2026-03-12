import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  // Calculates EMI using reducing balance method
  calculateEmi(principal: number, annualRate: number, termMonths: number): number {
    const r = annualRate / 12;
    if (r === 0) return principal / termMonths;
    return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
  }

  // Generates full amortization schedule
  generateSchedule(principal: number, annualRate: number, termMonths: number, startDate: Date) {
    const emi = this.calculateEmi(principal, annualRate, termMonths);
    const schedule: any[] = [];
    let balance = principal;

    for (let i = 1; i <= termMonths; i++) {
      const interestAmount = balance * (annualRate / 12);
      const principalAmount = emi - interestAmount;
      balance -= principalAmount;

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        installmentNo: i,
        dueDate,
        principalAmount: +principalAmount.toFixed(2),
        interestAmount: +interestAmount.toFixed(2),
        totalDue: +emi.toFixed(2),
        remainingAmount: +emi.toFixed(2),
        paidAmount: 0,
        status: 'PENDING',
      });
    }
    return schedule;
  }

  async create(dto: CreateLoanDto) {
    const count = await this.prisma.loan.count();
    const loanNumber = `LN-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const emi = this.calculateEmi(dto.principalAmount, dto.interestRate, dto.termMonths);
    const totalPayable = +(emi * dto.termMonths).toFixed(2);

    return this.prisma.loan.create({
      data: {
        ...dto,
        loanNumber,
        emiAmount: emi,
        totalPayable,
        outstandingBalance: dto.principalAmount,
        status: 'SUBMITTED',
      },
      include: { customer: true, branch: true },
    });
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, search, status, branchId, customerId } = query;
    const where: any = {};
    if (search) {
      where.OR = [
        { loanNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) where.status = status;
    if (branchId) where.branchId = branchId;
    if (customerId) where.customerId = customerId;

    const [data, total] = await Promise.all([
      this.prisma.loan.findMany({
        where, skip: (page - 1) * limit, take: +limit,
        include: { customer: { select: { firstName: true, lastName: true, customerNumber: true } }, branch: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loan.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        customer: true, branch: true, loanOfficer: { select: { firstName: true, lastName: true } },
        approvedBy: { select: { firstName: true, lastName: true } },
        installments: { orderBy: { installmentNo: 'asc' } },
        repayments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!loan) throw new NotFoundException('Loan not found');
    return loan;
  }

  async approve(id: string, userId: string) {
    const loan = await this.findOne(id);
    if (loan.status !== 'SUBMITTED' && loan.status !== 'UNDER_REVIEW') {
      throw new BadRequestException('Loan cannot be approved in current status');
    }
    return this.prisma.loan.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: userId, approvedAt: new Date() },
    });
  }

  async disburse(id: string, userId: string) {
    const loan = await this.findOne(id);
    if (loan.status !== 'APPROVED') {
      throw new BadRequestException('Only approved loans can be disbursed');
    }

    const disbursedAt = new Date();
    const schedule = this.generateSchedule(
      +loan.principalAmount, +loan.interestRate, loan.termMonths, disbursedAt
    );

    await this.prisma.loan.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        disbursedAmount: loan.principalAmount,
        disbursedAt,
        outstandingBalance: loan.principalAmount,
        maturityDate: schedule[schedule.length - 1].dueDate,
        installments: { createMany: { data: schedule } },
      },
    });

    // GL posting: Dr Loans Receivable / Cr Cash
    await this.postDisbursementJournal(id, +loan.principalAmount, userId, loan.loanNumber);
    return this.findOne(id);
  }

  async processRepayment(loanId: string, amount: number, userId: string, paymentMethod = 'CASH') {
    const loan = await this.findOne(loanId);
    if (loan.status !== 'ACTIVE') throw new BadRequestException('Loan is not active');

    // Find earliest unpaid installment
    const unpaidInstallment = loan.installments.find(i => i.status !== 'PAID' && i.status !== 'WAIVED');
    let remaining = amount;
    let principalPaid = 0, interestPaid = 0, penaltyPaid = 0;

    if (unpaidInstallment) {
      penaltyPaid = Math.min(remaining, +unpaidInstallment.penaltyAmount);
      remaining -= penaltyPaid;
      interestPaid = Math.min(remaining, +unpaidInstallment.interestAmount);
      remaining -= interestPaid;
      principalPaid = Math.min(remaining, +unpaidInstallment.principalAmount);

      const newPaid = +unpaidInstallment.paidAmount + amount;
      const newStatus = newPaid >= +unpaidInstallment.totalDue ? 'PAID' :
        newPaid > 0 ? 'PARTIAL' : unpaidInstallment.status;

      await this.prisma.loanInstallment.update({
        where: { id: unpaidInstallment.id },
        data: {
          paidAmount: newPaid,
          remainingAmount: Math.max(0, +unpaidInstallment.totalDue - newPaid),
          status: newStatus as any,
          paidAt: newStatus === 'PAID' ? new Date() : undefined,
        },
      });
    }

    const repayment = await this.prisma.loanRepayment.create({
      data: {
        loanId,
        installmentId: unpaidInstallment?.id,
        amount,
        principalPaid: principalPaid || amount * 0.8,
        interestPaid: interestPaid || amount * 0.2,
        penaltyPaid,
        paymentMethod,
      },
    });

    const newPaidTotal = +loan.totalPaid + amount;
    const newBalance = Math.max(0, +loan.outstandingBalance - (principalPaid || amount * 0.8));

    await this.prisma.loan.update({
      where: { id: loanId },
      data: {
        totalPaid: newPaidTotal,
        outstandingBalance: newBalance,
        status: newBalance <= 0 ? 'CLOSED' : 'ACTIVE',
        closedAt: newBalance <= 0 ? new Date() : undefined,
      },
    });

    return repayment;
  }

  async getStats() {
    const [total, active, disbursed, defaulted, closed] = await Promise.all([
      this.prisma.loan.count(),
      this.prisma.loan.count({ where: { status: 'ACTIVE' } }),
      this.prisma.loan.aggregate({ where: { status: { in: ['ACTIVE', 'CLOSED'] } }, _sum: { disbursedAmount: true } }),
      this.prisma.loan.count({ where: { status: 'DEFAULTED' } }),
      this.prisma.loan.count({ where: { status: 'CLOSED' } }),
    ]);
    return { total, active, disbursed: disbursed._sum.disbursedAmount, defaulted, closed };
  }

  private async postDisbursementJournal(loanId: string, amount: number, userId: string, ref: string) {
    const loansReceivable = await this.prisma.account.findUnique({ where: { code: '1100' } });
    const cash = await this.prisma.account.findUnique({ where: { code: '1001' } });
    if (!loansReceivable || !cash) return;

    const count = await this.prisma.journalEntry.count();
    await this.prisma.journalEntry.create({
      data: {
        entryNumber: `JE-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`,
        description: `Loan disbursement - ${ref}`,
        transactionType: 'LOAN_DISBURSEMENT',
        reference: ref,
        amount,
        loanId,
        postedById: userId,
        lines: {
          create: [
            { debitAccountId: loansReceivable.id, amount, description: 'Loan principal disbursed' },
            { creditAccountId: cash.id, amount, description: 'Cash paid out' },
          ],
        },
      },
    });
  }
}
