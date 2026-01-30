import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().refine(
    (url) => {
      return !url.includes("localhost") || process.env.NODE_ENV === "development";
    },
    { message: "Invalid database URL" }
  ),

  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1).refine(
    (key) => key.length >= 32,
    { message: "CLERK_SECRET_KEY must be at least 32 characters" }
  ),

  OPENROUTER_API_KEY: z.string().min(1),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),

  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),

  RETRY_MAX_RETRIES: z.string().optional(),
  RETRY_INITIAL_DELAY: z.string().optional(),
  RETRY_MAX_DELAY: z.string().optional(),
  RETRY_MULTIPLIER: z.string().optional(),

  CIRCUIT_BREAKER_FAILURE_THRESHOLD: z.string().optional(),
  CIRCUIT_BREAKER_TIMEOUT: z.string().optional(),

  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_PERFORMANCE_SAMPLE_RATE: z.string().optional(),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return result.data;
}

export const env = validateEnv();
