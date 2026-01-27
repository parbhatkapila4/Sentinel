"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CARD_BRANDS } from "@/lib/payment-methods";
import type { PaymentMethodItem } from "@/lib/payment-methods";

export async function getPaymentMethods(): Promise<PaymentMethodItem[]> {
  const userId = await getAuthenticatedUserId();
  const rows = await prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    brand: r.brand,
    last4: r.last4,
    expMonth: r.expMonth,
    expYear: r.expYear,
    isDefault: r.isDefault,
    createdAt: r.createdAt,
  }));
}

export async function addPaymentMethod(data: {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  setAsDefault?: boolean;
}): Promise<{ id: string }> {
  const userId = await getAuthenticatedUserId();

  const last4 = data.last4.replace(/\D/g, "").slice(-4);
  if (last4.length !== 4) {
    throw new Error("Please enter the last 4 digits of your card.");
  }
  if (!CARD_BRANDS.includes(data.brand as (typeof CARD_BRANDS)[number])) {
    throw new Error("Invalid card brand.");
  }
  const expMonth = Math.max(1, Math.min(12, Number(data.expMonth)));
  const expYear = Number(data.expYear);
  const currentYear = new Date().getFullYear();
  if (expYear < currentYear || expYear > currentYear + 20) {
    throw new Error("Please enter a valid expiry year.");
  }

  const isFirst = (await prisma.paymentMethod.count({ where: { userId } })) === 0;
  const isDefault = data.setAsDefault ?? isFirst;

  if (isDefault) {
    await prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const created = await prisma.paymentMethod.create({
    data: {
      userId,
      brand: data.brand,
      last4,
      expMonth,
      expYear,
      isDefault,
    },
  });

  revalidatePath("/settings");
  return { id: created.id };
}

export async function updatePaymentMethod(
  id: string,
  data: { brand?: string; last4?: string; expMonth?: number; expYear?: number }
): Promise<void> {
  const userId = await getAuthenticatedUserId();

  const existing = await prisma.paymentMethod.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    throw new Error("Payment method not found.");
  }

  const updates: { brand?: string; last4?: string; expMonth?: number; expYear?: number } = {};

  if (data.brand !== undefined) {
    if (!CARD_BRANDS.includes(data.brand as (typeof CARD_BRANDS)[number])) {
      throw new Error("Invalid card brand.");
    }
    updates.brand = data.brand;
  }
  if (data.last4 !== undefined) {
    const last4 = data.last4.replace(/\D/g, "").slice(-4);
    if (last4.length !== 4) {
      throw new Error("Please enter the last 4 digits of your card.");
    }
    updates.last4 = last4;
  }
  if (data.expMonth !== undefined) {
    updates.expMonth = Math.max(1, Math.min(12, Number(data.expMonth)));
  }
  if (data.expYear !== undefined) {
    const expYear = Number(data.expYear);
    const currentYear = new Date().getFullYear();
    if (expYear < currentYear || expYear > currentYear + 20) {
      throw new Error("Please enter a valid expiry year.");
    }
    updates.expYear = expYear;
  }

  await prisma.paymentMethod.update({
    where: { id },
    data: updates,
  });

  revalidatePath("/settings");
}

export async function removePaymentMethod(id: string): Promise<void> {
  const userId = await getAuthenticatedUserId();

  const existing = await prisma.paymentMethod.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    throw new Error("Payment method not found.");
  }

  await prisma.paymentMethod.delete({ where: { id } });

  if (existing.isDefault) {
    const next = await prisma.paymentMethod.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.paymentMethod.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  revalidatePath("/settings");
}

export async function setDefaultPaymentMethod(id: string): Promise<void> {
  const userId = await getAuthenticatedUserId();

  const target = await prisma.paymentMethod.findFirst({
    where: { id, userId },
  });
  if (!target) {
    throw new Error("Payment method not found.");
  }

  await prisma.paymentMethod.updateMany({
    where: { userId },
    data: { isDefault: false },
  });
  await prisma.paymentMethod.update({
    where: { id },
    data: { isDefault: true },
  });

  revalidatePath("/settings");
}
