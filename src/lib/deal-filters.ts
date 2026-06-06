import type { Prisma } from "@prisma/client";
export const REAL_DEAL_WHERE = { isDemo: false } satisfies Prisma.DealWhereInput;

export function isRealDeal<T extends { isDemo?: boolean | null }>(deal: T): boolean {
  return !deal.isDemo;
}
