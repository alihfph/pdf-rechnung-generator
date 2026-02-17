import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
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

  async create(email: string, password: string): Promise<{ id: string; email: string }> {
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
    };
    await this.redis.set(this.userKey(normalized), JSON.stringify(user));
    await this.redis.set(`${EMAIL_TO_ID_PREFIX}${id}`, normalized);
    return { id, email: normalized };
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  /** Create admin user from env (ADMIN_EMAIL, ADMIN_PASSWORD) if not exists. */
  async ensureAdminUser(email: string, password: string): Promise<void> {
    if (!email?.trim() || !password) return;
    const normalized = email.toLowerCase().trim();
    const existing = await this.findByEmail(normalized);
    if (existing) return;
    await this.create(normalized, password);
  }
}
