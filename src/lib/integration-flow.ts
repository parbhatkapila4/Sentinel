import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth";
import { enforceIntegrationLimit } from "@/lib/plan-enforcement";
import { incrementUsage } from "@/lib/plans";
import { logIntegrationAction } from "@/app/actions/integrations";

export type IntegrationProviderKey =
  | "salesforce"
  | "hubspot"
  | "google_calendar"
  | "gmail";

export interface IntegrationConnectContext {
  userId: string;
  isFirstConnect: boolean;
}

export interface IntegrationConnectInput<TValidation> {
  provider: IntegrationProviderKey;
  hasExisting: (userId: string) => Promise<boolean>;
  validate: () => Promise<{ valid: boolean; error?: string } & TValidation>;
  upsert: (
    ctx: IntegrationConnectContext,
    validation: TValidation
  ) => Promise<void>;
  successMessage?: (validation: TValidation) => string;
}

export async function runIntegrationConnect<TValidation = object>(
  input: IntegrationConnectInput<TValidation>
): Promise<{ success: true }> {
  const userId = await getAuthenticatedUserId();
  const isFirstConnect = !(await input.hasExisting(userId));

  const validation = await input.validate();
  if (!validation.valid) {
    await logIntegrationAction(
      input.provider,
      "connect",
      "failed",
      validation.error
    );
    throw new Error(validation.error || "Invalid credentials");
  }

  if (isFirstConnect) {
    await enforceIntegrationLimit(userId, input.provider);
  }

  await input.upsert({ userId, isFirstConnect }, validation);

  if (isFirstConnect) {
    await incrementUsage(userId, "integrations", 1);
  }

  await logIntegrationAction(
    input.provider,
    "connect",
    "success",
    input.successMessage?.(validation) ?? `Successfully connected to ${input.provider}`
  );

  revalidatePath("/settings");
  return { success: true };
}
