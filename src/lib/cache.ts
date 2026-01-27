import { redis } from "./redis";

const DEFAULT_TTL = 60;

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis || process.env.NODE_ENV === "test") {
    return null;
  }

  try {
    const value = await redis.get(key);
    if (!value) {
      return null;
    }

    if (typeof value === "string") {
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    }

    return value as T;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[Cache] Failed to get key ${key}:`, error);
    }
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL
): Promise<void> {
  if (!redis || process.env.NODE_ENV === "test") {
    return;
  }

  try {
    const serialized = JSON.stringify(value);
    await redis.set(key, serialized, { ex: ttlSeconds });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[Cache] Failed to set key ${key}:`, error);
    }
  }
}

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  if (!redis || process.env.NODE_ENV === "test") {
    return loader();
  }

  try {
    const cached = await getCache<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await loader();

    setCache(key, value, ttlSeconds).catch(() => {
    });

    return value;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[Cache] Error in withCache for key ${key}, falling back to loader:`, error);
    }
    return loader();
  }
}


export async function invalidateCache(key: string): Promise<void> {
  if (!redis || process.env.NODE_ENV === "test") {
    return;
  }

  try {
    await redis.del(key);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[Cache] Failed to invalidate key ${key}:`, error);
    }
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (!redis || process.env.NODE_ENV === "test") {
    return;
  }

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[Cache] Failed to invalidate pattern ${pattern}:`, error);
    }
  }
}
