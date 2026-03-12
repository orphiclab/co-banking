import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notifQueue: Queue,
  ) {}

  async sendNotification(dto: {
    customerId?: string;
    type: 'SMS' | 'EMAIL' | 'IN_APP';
    trigger: string;
    recipient: string;
    subject?: string;
    message: string;
    createdById?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        customerId: dto.customerId,
        type: dto.type as any,
        trigger: dto.trigger as any,
        status: 'PENDING',
        recipient: dto.recipient,
        subject: dto.subject,
        message: dto.message,
        createdById: dto.createdById,
      },
    });

    await this.notifQueue.add('send', { notificationId: notification.id, ...dto });
    return notification;
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, type, status, customerId } = query;
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where, skip: (page - 1) * limit, take: +limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit, pages: Math.ceil(total / limit) };
  }

  async getUnread(userId: string) {
    return this.prisma.notification.findMany({
      where: { status: 'PENDING', type: 'IN_APP' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async getStats() {
    const [total, pending, sent, failed] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { status: 'PENDING' } }),
      this.prisma.notification.count({ where: { status: 'SENT' } }),
      this.prisma.notification.count({ where: { status: 'FAILED' } }),
    ]);
    return { total, pending, sent, failed };
  }
}
