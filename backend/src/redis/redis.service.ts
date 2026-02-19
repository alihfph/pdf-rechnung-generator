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
    const maxAttempts = 5;
    const delayMs = 3000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.log(`Redis connect attempt ${attempt}/${maxAttempts}...`);
        await this.client.ping();
        this.logger.log('Redis ready.');
        return;
      } catch (err: any) {
        const msg = err?.message || String(err);
        this.logger.warn(`Attempt ${attempt} failed: ${msg}`);
        if (attempt === maxAttempts) {
          const hasUrl = !!(this.config.get<string>('REDIS_URL') || this.config.get<string>('REDIS_PRIVATE_URL'));
          this.logger.error(
            hasUrl
              ? `Redis connection failed after ${maxAttempts} attempts. Check that REDIS_URL is the correct URL from your Redis provider (Railway Redis or Upstash). Error: ${msg}`
              : `REDIS_URL is not set. In Railway → Backend service → Variables → add REDIS_URL with the Redis URL (from Railway Redis Variables tab, or from https://console.upstash.com). Then redeploy.`,
          );
          throw err;
        }
        await new Promise((r) => setTimeout(r, delayMs));
      }
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

  /** Return keys matching pattern (e.g. 'user:*'). */
  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
