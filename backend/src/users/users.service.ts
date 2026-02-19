import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  role?: 'admin' | 'customer';
}

const USER_PREFIX = 'user:';
const EMAIL_TO_ID_PREFIX = 'email_to_id:';

@Injectable()
export class UsersService {
  constructor(private redis: RedisService) {}

  private userKey(email: string): string {
    return `${USER_PREFIX}${email.toLowerCase()}`;
  }

  async findByEmail(email: string): Promise<User | null> {
    const key = this.userKey(email);
    const raw = await this.redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  }

  async findById(id: string): Promise<User | null> {
    const emailKey = `${EMAIL_TO_ID_PREFIX}${id}`;
    const email = await this.redis.get(emailKey);
    if (!email) return null;
    return this.findByEmail(email);
  }

  async create(
    email: string,
    password: string,
    role: 'admin' | 'customer' = 'customer',
  ): Promise<{ id: string; email: string; role: 'admin' | 'customer' }> {
    const normalized = email.toLowerCase().trim();
    const existing = await this.findByEmail(normalized);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      id,
      email: normalized,
      passwordHash,
      createdAt: new Date().toISOString(),
      role,
    };
    await this.redis.set(this.userKey(normalized), JSON.stringify(user));
    await this.redis.set(`${EMAIL_TO_ID_PREFIX}${id}`, normalized);
    return { id, email: normalized, role };
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  /** Create admin user from env (ADMIN_EMAIL, ADMIN_PASSWORD) if not exists. */
  async ensureAdminUser(email: string, password: string): Promise<void> {
    if (!email?.trim() || !password) return;
    const normalized = email.toLowerCase().trim();
    const existing = await this.findByEmail(normalized);
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await this.redis.set(this.userKey(normalized), JSON.stringify(existing));
      }
      return;
    }
    await this.create(normalized, password, 'admin');
  }

  /** List all admin users (id, email, createdAt). Admin only. */
  async listAdmins(): Promise<{ id: string; email: string; createdAt: string }[]> {
    const keys = await this.redis.keys(`${USER_PREFIX}*`);
    const admins: { id: string; email: string; createdAt: string }[] = [];
    for (const key of keys) {
      const raw = await this.redis.get(key);
      if (!raw) continue;
      const user = JSON.parse(raw) as User;
      if (user.role === 'admin') {
        admins.push({ id: user.id, email: user.email, createdAt: user.createdAt });
      }
    }
    return admins.sort((a, b) => a.email.localeCompare(b.email));
  }

  /** Create a new admin user. Caller must be admin. */
  async createAdmin(email: string, password: string): Promise<{ id: string; email: string }> {
    const result = await this.create(email, password, 'admin');
    return { id: result.id, email: result.email };
  }
}
