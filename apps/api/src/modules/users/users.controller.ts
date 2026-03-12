import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get() @Roles('ADMIN', 'BRANCH_MANAGER') findAll(@Query() q: any) { return this.usersService.findAll(q); }
  @Post() @Roles('ADMIN') create(@Body() dto: any) { return this.usersService.create(dto); }
  @Patch(':id') @Roles('ADMIN') update(@Param('id') id: string, @Body() dto: any) { return this.usersService.update(id, dto); }
}
