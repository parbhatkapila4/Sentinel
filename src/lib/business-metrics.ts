
import { redis } from "./redis";

const DEFAULT_TTL = 60 * 60 * 24 * 7;
export async function incrementMetric(name: string, value: number = 1): Promise<void> {
  if (!redis) return;
  try {
    const key = `metrics:${name}:daily`;
    await redis.incrby(key, value);
    const ttl = await redis.ttl(key);
    if (ttl === -1) await redis.expire(key, DEFAULT_TTL);
  } catch {

  }
}

export async function getMetric(name: string): Promise<number | null> {
  if (!redis) return null;
  try {
    const key = `metrics:${name}:daily`;
    const v = await redis.get(key);
    return v != null ? Number(v) : null;
  } catch {
    return null;
  }
}

export interface BusinessMetricsSummary {
  dealCreated: number;
  dealExported: number;
  apiCalls: number;
  insightsOpened: number;
}

export async function getMetricsSummary(): Promise<BusinessMetricsSummary> {
  const empty: BusinessMetricsSummary = {
    dealCreated: 0,
    dealExported: 0,
    apiCalls: 0,
    insightsOpened: 0,
  };
  if (!redis) return empty;
  try {
    const [dealCreated, dealExported, apiCalls, insightsOpened] = await Promise.all([
      getMetric("deal_created"),
      getMetric("deal_exported"),
      getMetric("api_calls"),
      getMetric("insights_opened"),
    ]);
    return {
      dealCreated: dealCreated ?? 0,
      dealExported: dealExported ?? 0,
      apiCalls: apiCalls ?? 0,
      insightsOpened: insightsOpened ?? 0,
    };
  } catch {
    return empty;
  }
}
