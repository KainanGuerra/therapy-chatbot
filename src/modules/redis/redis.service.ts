import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ChatContext } from '../../common/interfaces';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisConfig = this.configService.get('redis');
    this.client = new Redis(redisConfig);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async setChatContext(userId: string, sessionId: string, context: ChatContext): Promise<void> {
    const key = `chat:${userId}:${sessionId}`;
    await this.client.setex(key, 3600, JSON.stringify(context)); // 1 hour expiry
  }

  async getChatContext(userId: string, sessionId: string): Promise<ChatContext | null> {
    const key = `chat:${userId}:${sessionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteChatContext(userId: string, sessionId: string): Promise<void> {
    const key = `chat:${userId}:${sessionId}`;
    await this.client.del(key);
  }

  async setUserSession(userId: string, sessionData: any): Promise<void> {
    const key = `user:${userId}:session`;
    await this.client.setex(key, 86400, JSON.stringify(sessionData)); // 24 hours expiry
  }

  async getUserSession(userId: string): Promise<any> {
    const key = `user:${userId}:session`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async cacheData(key: string, data: any, ttl: number = 3600): Promise<void> {
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  async getCachedData(key: string): Promise<any> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteCache(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incrementCounter(key: string, ttl?: number): Promise<number> {
    const count = await this.client.incr(key);
    if (ttl && count === 1) {
      await this.client.expire(key, ttl);
    }
    return count;
  }
}
