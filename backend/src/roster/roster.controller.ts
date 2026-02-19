import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RosterService, RosterData } from './roster.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('roster')
@UseGuards(JwtAuthGuard, AdminGuard)
export class RosterController {
  constructor(private roster: RosterService) {}

  @Get()
  async get(@CurrentUser() user: { id: string }) {
    return this.roster.get(user.id);
  }

  @Post()
  async save(
    @CurrentUser() user: { id: string },
    @Body() body: RosterData,
  ) {
    const data: RosterData = {
      employees: Array.isArray(body.employees) ? body.employees : [],
      shifts: Array.isArray(body.shifts) ? body.shifts : [],
    };
    await this.roster.set(user.id, data);
    return data;
  }
}
