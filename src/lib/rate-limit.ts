import { redis } from "./redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimitConfig {
  limit: number;
  window: number;
}

export class RateLimiter {
  private redis: typeof redis;

  constructor() {
    this.redis = redis;
  }

  async checkLimit(
    identifier: string,
    limit: number,
    window: number
  ): Promise<RateLimitResult> {
    if (!this.redis) {
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          `[RateLimit] Redis unavailable - allowing request for ${identifier}`
        );
      }
      return {
        allowed: true,
        remaining: limit,
        resetAt: Date.now() + window * 1000,
      };
    }

    try {
      const now = Date.now();
      const windowMs = window * 1000;
      const key = `rate_limit:${identifier}`;
      const cutoff = now - windowMs;

      await this.redis.zremrangebyscore(key, 0, cutoff);

      const currentCount = (await this.redis.zcard(key)) ?? 0;

      const allowed = currentCount < limit;

      if (allowed) {
        await this.redis.zadd(key, {
          score: now,
          member: `${now}-${Math.random()}`,
        });
      }

      await this.redis.expire(key, window + 1);

      const remaining = Math.max(0, limit - currentCount - (allowed ? 1 : 0));
      const resetAt = now + windowMs;

      return {
        allowed,
        remaining,
        resetAt,
      };
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error(`[RateLimit] Error checking limit for ${identifier}:`, error);
      }
      return {
        allowed: true,
        remaining: limit,
        resetAt: Date.now() + window * 1000,
      };
    }
  }

  calculateBackoff(
    attemptNumber: number,
    baseDelay = 1,
    maxDelay = 60
  ): number {
    const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
    return Math.floor(delay);
  }

  async reset(identifier: string): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      const key = `rate_limit:${identifier}`;
      await this.redis.del(key);
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error(`[RateLimit] Error resetting limit for ${identifier}:`, error);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

export const RATE_LIMIT_CONFIGS = {
  USER_DEFAULT: {
    limit: parseInt(process.env.RATE_LIMIT_USER_DEFAULT || "100", 10),
    window: 60,
  },
  USER_AI: {
    limit: parseInt(process.env.RATE_LIMIT_USER_AI || "20", 10),
    window: 60,
  },
  USER_EXPORT: {
    limit: parseInt(process.env.RATE_LIMIT_USER_EXPORT || "10", 10),
    window: 60,
  },
  IP_PUBLIC: {
    limit: parseInt(process.env.RATE_LIMIT_IP_PUBLIC || "50", 10),
    window: 60,
  },
} as const;
