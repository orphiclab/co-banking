import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('notifications')
export class NotificationsProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('send')
  async handleSend(job: Job<any>) {
    const { notificationId, type, recipient, subject, message } = job.data;
    try {
      // In production, integrate with SMS/Email providers
      if (type === 'EMAIL') {
        console.log(`📧 Email to ${recipient}: ${subject} - ${message}`);
        // await this.emailService.send(recipient, subject, message);
      } else if (type === 'SMS') {
        console.log(`📱 SMS to ${recipient}: ${message}`);
        // await this.smsService.send(recipient, message);
      } else {
        console.log(`🔔 In-app notification: ${message}`);
      }

      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'SENT', sentAt: new Date() },
      });
    } catch (error) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'FAILED', failureReason: error.message },
      });
    }
  }
}
