import { BadRequestException, Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OrdersService, OrderItem } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async create(
    @CurrentUser() user: { id: string; email: string } | undefined,
    @Body() dto: CreateOrderDto,
  ) {
    const items: OrderItem[] = dto.items.map((i) => ({
      menuId: i.menuId,
      name: i.name,
      price: Number(i.price),
      quantity: Number(i.quantity),
    }));
    const customerId = user ? user.id : (dto.guestEmail ? `guest:${dto.guestEmail.toLowerCase().trim()}` : null);
    const customerEmail = user ? user.email : (dto.guestEmail?.trim() || null);
    if (!customerId || !customerEmail) {
      throw new BadRequestException('Log in or provide guest email to place an order');
    }
    return this.orders.create(customerId, customerEmail, items);
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
