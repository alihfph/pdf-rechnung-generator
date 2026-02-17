import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

const ORDERS_KEY = 'orders:list';

export interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
}

@Injectable()
export class OrdersService {
  constructor(private redis: RedisService) {}

  private async getAll(): Promise<Order[]> {
    const raw = await this.redis.get(ORDERS_KEY);
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  private async setAll(orders: Order[]): Promise<void> {
    await this.redis.set(ORDERS_KEY, JSON.stringify(orders));
  }

  async create(customerId: string, customerEmail: string, items: OrderItem[]): Promise<Order> {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order: Order = {
      id: uuidv4(),
      customerId,
      customerEmail,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const orders = await this.getAll();
    orders.unshift(order);
    await this.setAll(orders);
    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.getAll();
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    const orders = await this.getAll();
    return orders.filter((o) => o.customerId === customerId);
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order | null> {
    const orders = await this.getAll();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    orders[idx].status = status;
    await this.setAll(orders);
    return orders[idx];
  }
}
