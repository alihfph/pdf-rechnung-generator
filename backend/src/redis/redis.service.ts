import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private config: ConfigService) {
    const url =
      this.config.get<string>('REDIS_URL') ||
      this.config.get<string>('REDIS_PRIVATE_URL') ||
      'redis://localhost:6379';
    const hasConfiguredUrl = !!(this.config.get<string>('REDIS_URL') || this.config.get<string>('REDIS_PRIVATE_URL'));
    this.logger.log(hasConfiguredUrl ? 'Redis: REDIS_URL is set' : 'Redis: REDIS_URL not set, using default localhost');
    const isTls = url.startsWith('rediss://');
    this.client = new Redis(url, {
      maxRetriesPerRequest: 5,
      retryStrategy: (times) => (times <= 5 ? 2000 : null),
      lazyConnect: true,
      ...(isTls && { tls: { rejectUnauthorized: false } }),
    });
    this.client.on('error', (err: any) =>
      this.logger.warn(`Redis: ${err?.message || err?.code || 'connection problem'}`),
    );
    this.client.on('connect', () => this.logger.log('Redis connected'));
  }

  async onModuleInit() {
    try {
      await this.client.ping();
    } catch (err: any) {
      this.logger.error(
        `Redis connection failed. Set REDIS_URL (or REDIS_PRIVATE_URL) in your backend service to the exact URL from the Redis service (Variables tab). Use the private/internal URL if available. Error: ${err?.message || err}`,
      );
      throw err;
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
