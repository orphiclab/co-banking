import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    const count = await this.prisma.customer.count();
    const customerNumber = `CUS-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    return this.prisma.customer.create({
      data: { ...dto, customerNumber },
      include: { branch: true },
    });
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, search, kycStatus, riskLevel, branchId } = query;
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { customerNumber: { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (kycStatus) where.kycStatus = kycStatus;
    if (riskLevel) where.riskLevel = riskLevel;
    if (branchId) where.branchId = branchId;

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where, skip: (page - 1) * limit, take: +limit,
        include: { branch: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        branch: true,
        loans: { orderBy: { createdAt: 'desc' }, take: 5 },
        leases: { orderBy: { createdAt: 'desc' }, take: 5 },
        fds: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    return this.prisma.customer.update({ where: { id }, data: dto, include: { branch: true } });
  }

  async updateKyc(id: string, kycStatus: string) {
    return this.prisma.customer.update({ where: { id }, data: { kycStatus: kycStatus as any } });
  }

  async updateRiskScore(id: string, score: number) {
    const riskLevel = score >= 70 ? 'LOW' : score >= 50 ? 'MEDIUM' : score >= 30 ? 'HIGH' : 'VERY_HIGH';
    return this.prisma.customer.update({
      where: { id },
      data: { riskScore: score, riskLevel: riskLevel as any },
    });
  }

  async getStats() {
    const [total, verified, pending, rejected] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { kycStatus: 'VERIFIED' } }),
      this.prisma.customer.count({ where: { kycStatus: 'PENDING' } }),
      this.prisma.customer.count({ where: { kycStatus: 'REJECTED' } }),
    ]);
    return { total, verified, pending, rejected };
  }
}
