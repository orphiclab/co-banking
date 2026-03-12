import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notifService: NotificationsService) {}

  @Post() send(@Body() dto: any, @Request() req: any) {
    return this.notifService.sendNotification({ ...dto, createdById: req.user.id });
  }
  @Get() findAll(@Query() query: any) { return this.notifService.findAll(query); }
  @Get('unread') getUnread(@Request() req: any) { return this.notifService.getUnread(req.user.id); }
  @Get('stats') getStats() { return this.notifService.getStats(); }
}
