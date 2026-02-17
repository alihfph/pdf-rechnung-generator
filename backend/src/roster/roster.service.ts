import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

const ROSTER_PREFIX = 'roster:';

export interface RosterData {
  employees: Array<{ id: string; name: string }>;
  shifts: Array<{
    id: string;
    employeeId: string;
    date: string;
    start: string;
    end: string;
  }>;
}

@Injectable()
export class RosterService {
  constructor(private redis: RedisService) {}

  private key(userId: string): string {
    return `${ROSTER_PREFIX}${userId}`;
  }

  async get(userId: string): Promise<RosterData> {
    const raw = await this.redis.get(this.key(userId));
    if (!raw) return { employees: [], shifts: [] };
    try {
      const data = JSON.parse(raw);
      return {
        employees: Array.isArray(data.employees) ? data.employees : [],
        shifts: Array.isArray(data.shifts) ? data.shifts : [],
      };
    } catch {
      return { employees: [], shifts: [] };
    }
  }

  async set(userId: string, data: RosterData): Promise<void> {
    await this.redis.set(this.key(userId), JSON.stringify(data));
  }
}
