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
    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => (times <= 3 ? 1000 : null),
      lazyConnect: true,
    });
    this.client.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));
    this.client.on('connect', () => this.logger.log('Redis connected'));
  }

  async onModuleInit() {
    try {
      await this.client.ping();
    } catch (err: any) {
      this.logger.error(
        `Redis connection failed. In Railway: add a Redis service, then in your backend service Variables set REDIS_URL (or REDIS_PRIVATE_URL) to the Redis connection URL. Error: ${err?.message || err}`,
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
