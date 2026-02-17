import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OrdersService, OrderItem } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: CreateOrderDto,
  ) {
    const items: OrderItem[] = dto.items.map((i) => ({
      menuId: i.menuId,
      name: i.name,
      price: Number(i.price),
      quantity: Number(i.quantity),
    }));
    return this.orders.create(user.id, user.email, items);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async mine(@CurrentUser() user: { id: string }) {
    return this.orders.findByCustomer(user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async list() {
    return this.orders.findAll();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }
}
