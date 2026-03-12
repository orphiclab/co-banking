import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 20, role, branchId } = query;
    const where: any = {};
    if (role) where.role = role;
    if (branchId) where.branchId = branchId;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip: (page - 1) * limit, take: +limit,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, lastLogin: true, branch: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit };
  }

  async create(dto: any) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already exists');
    const password = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { ...dto, password },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    });
  }

  async update(id: string, dto: any) {
    const { password, ...rest } = dto;
    const data: any = { ...rest };
    if (password) data.password = await bcrypt.hash(password, 10);
    return this.prisma.user.update({
      where: { id }, data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    });
  }
}
