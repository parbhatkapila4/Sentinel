import { redis } from "./redis";

interface MetricData {
  value: number;
  count: number;
  lastUpdated: number;
  tags?: Record<string, string>;
}

export async function incrementMetric(
  name: string,
  value: number = 1,
  tags?: Record<string, string>,
  ttl: number = 86400
): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    const key = `metric:${name}`;
    const tagKey = tags ? `:${JSON.stringify(tags)}` : "";
    const fullKey = `${key}${tagKey}`;

    await redis.incrby(fullKey, value);

    const exists = await redis.exists(fullKey);
    if (exists === 1) {
      await redis.expire(fullKey, ttl);
    }

    const timestampKey = `${fullKey}:timestamp`;
    await redis.set(timestampKey, Date.now().toString());
    await redis.expire(timestampKey, ttl);
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[Metrics] Failed to increment metric ${name}:`, error);
    }
  }
}

export async function getMetric(
  name: string,
  tags?: Record<string, string>
): Promise<number | null> {
  if (!redis) {
    return null;
  }

  try {
    const key = `metric:${name}`;
    const tagKey = tags ? `:${JSON.stringify(tags)}` : "";
    const fullKey = `${key}${tagKey}`;

    const value = await redis.get(fullKey);
    return value ? parseInt(value.toString(), 10) : null;
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[Metrics] Failed to get metric ${name}:`, error);
    }
    return null;
  }
}

export async function getMetricsSummary(): Promise<{
  dealMetrics: {
    created: number;
    updated: number;
    deleted: number;
  };
  apiMetrics: {
    totalCalls: number;
    averageResponseTime: number;
    errorRate: number;
  };
  userMetrics: {
    activeUsers: number;
    totalUsers: number;
  };
}> {
  if (!redis) {
    return {
      dealMetrics: { created: 0, updated: 0, deleted: 0 },
      apiMetrics: { totalCalls: 0, averageResponseTime: 0, errorRate: 0 },
      userMetrics: { activeUsers: 0, totalUsers: 0 },
    };
  }

  try {
    const dealCreated = (await getMetric("deal.created")) || 0;
    const dealUpdated = (await getMetric("deal.updated")) || 0;
    const dealDeleted = (await getMetric("deal.deleted")) || 0;

    const apiTotalCalls = (await getMetric("api.calls.total")) || 0;
    const apiTotalTime = (await getMetric("api.calls.total_time")) || 0;
    const apiErrors = (await getMetric("api.calls.errors")) || 0;

    const averageResponseTime =
      apiTotalCalls > 0 ? apiTotalTime / apiTotalCalls : 0;
    const errorRate = apiTotalCalls > 0 ? apiErrors / apiTotalCalls : 0;

    const activeUsers = (await getMetric("user.active")) || 0;
    const totalUsers = (await getMetric("user.total")) || 0;

    return {
      dealMetrics: {
        created: dealCreated,
        updated: dealUpdated,
        deleted: dealDeleted,
      },
      apiMetrics: {
        totalCalls: apiTotalCalls,
        averageResponseTime: Math.round(averageResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
      },
      userMetrics: {
        activeUsers,
        totalUsers,
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Metrics] Failed to get metrics summary:", error);
    }
    return {
      dealMetrics: { created: 0, updated: 0, deleted: 0 },
      apiMetrics: { totalCalls: 0, averageResponseTime: 0, errorRate: 0 },
      userMetrics: { activeUsers: 0, totalUsers: 0 },
    };
  }
}

export async function trackDealCreated(userId?: string): Promise<void> {
  await incrementMetric("deal.created", 1);
  if (userId) {
    await incrementMetric("deal.created", 1, { userId });
  }
}

export async function trackDealUpdated(userId?: string): Promise<void> {
  await incrementMetric("deal.updated", 1);
  if (userId) {
    await incrementMetric("deal.updated", 1, { userId });
  }
}

export async function trackDealDeleted(userId?: string): Promise<void> {
  await incrementMetric("deal.deleted", 1);
  if (userId) {
    await incrementMetric("deal.deleted", 1, { userId });
  }
}

export async function trackApiCall(
  endpoint: string,
  duration: number,
  statusCode: number
): Promise<void> {
  await incrementMetric("api.calls.total", 1);
  await incrementMetric("api.calls.total_time", duration);
  await incrementMetric("api.calls.by_endpoint", 1, { endpoint });

  if (statusCode >= 400) {
    await incrementMetric("api.calls.errors", 1);
    await incrementMetric("api.calls.errors_by_endpoint", 1, { endpoint });
  }

  if (duration > 1000) {
    await incrementMetric("api.calls.slow", 1, { endpoint });
  }
}

export async function trackUserActivity(userId: string): Promise<void> {
  await incrementMetric("user.active", 1, { userId }, 3600); // 1 hour TTL
}

export async function trackPageView(
  path: string,
  userId?: string
): Promise<void> {
  await incrementMetric("page.views", 1, { path });
  if (userId) {
    await incrementMetric("page.views", 1, { path, userId });
  }
}

export async function trackFeatureUsage(
  feature: string,
  userId?: string
): Promise<void> {
  await incrementMetric("feature.usage", 1, { feature });
  if (userId) {
    await incrementMetric("feature.usage", 1, { feature, userId });
  }
}
