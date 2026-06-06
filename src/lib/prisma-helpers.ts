import { Prisma } from "@prisma/client";
import { logWarn } from "@/lib/logger";

export async function deleteIfExists(
  fn: () => Promise<unknown>,
  context: { resource: string; userId?: string }
): Promise<void> {
  try {
    await fn();
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return;
    }
    logWarn(`Failed to delete ${context.resource}`, {
      ...context,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
