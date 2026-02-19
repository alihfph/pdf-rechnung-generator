import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UsersService } from './users.service';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('admins')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async listAdmins() {
    return this.users.listAdmins();
  }

  @Post('admins')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createAdmin(@Body() dto: CreateAdminDto) {
    const normalized = dto.email.toLowerCase().trim();
    return this.users.createAdmin(normalized, dto.password);
  }
}
