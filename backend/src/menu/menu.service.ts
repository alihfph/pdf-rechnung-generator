import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

const MENU_KEY = 'menu:items';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
}

@Injectable()
export class MenuService {
  constructor(private redis: RedisService) {}

  async findAll(): Promise<MenuItem[]> {
    const raw = await this.redis.get(MENU_KEY);
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  async create(dto: { name: string; price: number; description?: string; category?: string }): Promise<MenuItem> {
    const items = await this.findAll();
    const item: MenuItem = {
      id: uuidv4(),
      name: dto.name.trim(),
      price: Number(dto.price) || 0,
      description: dto.description?.trim(),
      category: dto.category?.trim(),
    };
    items.push(item);
    await this.redis.set(MENU_KEY, JSON.stringify(items));
    return item;
  }

  async update(id: string, dto: Partial<{ name: string; price: number; description: string; category: string }>): Promise<MenuItem | null> {
    const items = await this.findAll();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    if (dto.name !== undefined) items[idx].name = dto.name.trim();
    if (dto.price !== undefined) items[idx].price = Number(dto.price) || 0;
    if (dto.description !== undefined) items[idx].description = dto.description?.trim();
    if (dto.category !== undefined) items[idx].category = dto.category?.trim();
    await this.redis.set(MENU_KEY, JSON.stringify(items));
    return items[idx];
  }

  async remove(id: string): Promise<boolean> {
    const items = await this.findAll();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    await this.redis.set(MENU_KEY, JSON.stringify(filtered));
    return true;
  }
}
