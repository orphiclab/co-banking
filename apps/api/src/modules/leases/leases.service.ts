import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeasesService {
  constructor(private prisma: PrismaService) {}

  calculateInstallment(leaseAmount: number, downPayment: number, annualRate: number, termMonths: number) {
    const financed = leaseAmount - downPayment;
    const r = annualRate / 12;
    if (r === 0) return financed / termMonths;
    return (financed * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
  }

  generateSchedule(financed: number, annualRate: number, termMonths: number, startDate: Date) {
    const emi = this.calculateInstallment(financed + 0, 0, annualRate, termMonths);
    const schedule: any[] = [];
    let balance = financed;
    for (let i = 1; i <= termMonths; i++) {
      const interest = balance * (annualRate / 12);
      const principal = emi - interest;
      balance -= principal;
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      schedule.push({
        installmentNo: i, dueDate,
        principalAmount: +principal.toFixed(2),
        interestAmount: +interest.toFixed(2),
        totalDue: +emi.toFixed(2),
        paidAmount: 0, status: 'PENDING',
      });
    }
    return schedule;
  }

  async create(dto: any) {
    const count = await this.prisma.lease.count();
    const leaseNumber = `LS-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const monthly = this.calculateInstallment(dto.leaseAmount, dto.downPayment || 0, dto.interestRate, dto.termMonths);
    const totalPayable = monthly * dto.termMonths + (dto.downPayment || 0);

    return this.prisma.lease.create({
      data: {
        ...dto, leaseNumber, monthlyInstallment: monthly,
        totalPayable, outstandingBalance: dto.leaseAmount - (dto.downPayment || 0),
        status: 'DRAFT',
      },
      include: { customer: true, asset: true },
    });
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, search, status } = query;
    const where: any = {};
    if (status) where.status = status;
    if (search) where.OR = [
      { leaseNumber: { contains: search, mode: 'insensitive' } },
      { customer: { firstName: { contains: search, mode: 'insensitive' } } },
    ];
    const [data, total] = await Promise.all([
      this.prisma.lease.findMany({
        where, skip: (page - 1) * limit, take: +limit,
        include: { customer: { select: { firstName: true, lastName: true, customerNumber: true } }, asset: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lease.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const lease = await this.prisma.lease.findUnique({
      where: { id },
      include: { customer: true, asset: true, installments: { orderBy: { installmentNo: 'asc' } } },
    });
    if (!lease) throw new NotFoundException('Lease not found');
    return lease;
  }

  async activate(id: string) {
    const lease = await this.findOne(id);
    if (lease.status !== 'DRAFT') throw new BadRequestException('Lease already activated');
    const startDate = new Date();
    const financed = +lease.leaseAmount - +lease.downPayment;
    const schedule = this.generateSchedule(financed, +lease.interestRate, lease.termMonths, startDate);

    return this.prisma.lease.update({
      where: { id },
      data: {
        status: 'ACTIVE', startDate,
        endDate: schedule[schedule.length - 1].dueDate,
        installments: { createMany: { data: schedule } },
      },
    });
  }

  async processPayment(id: string, amount: number) {
    const lease = await this.findOne(id);
    if (lease.status !== 'ACTIVE') throw new BadRequestException('Lease is not active');
    const unpaid = lease.installments.find(i => i.status !== 'PAID');
    if (unpaid) {
      await this.prisma.leaseInstallment.update({
        where: { id: unpaid.id },
        data: { paidAmount: amount, status: 'PAID', paidAt: new Date() },
      });
    }
    return this.prisma.lease.update({
      where: { id },
      data: { totalPaid: { increment: amount }, outstandingBalance: { decrement: amount } },
    });
  }

  async getStats() {
    const [total, active, totalPortfolio] = await Promise.all([
      this.prisma.lease.count(),
      this.prisma.lease.count({ where: { status: 'ACTIVE' } }),
      this.prisma.lease.aggregate({ where: { status: 'ACTIVE' }, _sum: { outstandingBalance: true } }),
    ]);
    return { total, active, totalPortfolio: totalPortfolio._sum.outstandingBalance || 0 };
  }
}
