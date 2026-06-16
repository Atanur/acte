// ─────────────────────────────────────────────────────────
// Environment Management — Zod Schema & Validation
// ─────────────────────────────────────────────────────────
// Centralized environment variable validation using Zod.
// Validates all env vars at startup and exports a typed
// object for safe access throughout the application.
// ─────────────────────────────────────────────────────────

import { z } from "zod";

// ─── Schema Definition ────────────────────────────────

/**
 * Complete schema for all environment variables used across
 * the monorepo (backend, web, mobile, and shared packages).
 */
export const envSchema = z.object({
  // ── Node / Runtime ────────────────────────────────
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().positive().default(4000),

  // ── Database ──────────────────────────────────────
  DATABASE_URL: z.string().url().default("postgres://acte:acte_dev@localhost:5432/acte"),

  // ── Redis ──────────────────────────────────────────
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // ── API URLs ──────────────────────────────────────
  API_URL: z.string().url().default("http://localhost:4000"),
  EXPO_PUBLIC_API_URL: z.string().url().default("http://localhost:4000"),
  WEB_URL: z.string().url().default("http://localhost:3000"),

  // ── Authentication (Better Auth) ──────────────────
  BETTER_AUTH_URL: z.string().url().default("http://localhost:4000"),
  BETTER_AUTH_SECRET: z.string().min(1).default("dev-secret-change-in-production"),

  // ── Email (Resend) ────────────────────────────────
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default("noreply@acte.app"),

  // ── AWS / S3 ──────────────────────────────────────
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().optional(),

  // ── Sentry ────────────────────────────────────────
  SENTRY_DSN: z.string().url().optional(),

  // ── Feature Flags ─────────────────────────────────
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),

  // ── Expo ──────────────────────────────────────────
  EXPO_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

// ─── Derived Type ────────────────────────────────────

/** Typed representation of validated environment variables. */
export type Env = z.infer<typeof envSchema>;

// ─── Validation & Parsing ────────────────────────────

let parsedEnv: Env | null = null;

/**
 * Parse and validate environment variables using the schema.
 * Called once at application startup. Throws on invalid config.
 *
 * @param overrides - Optional overrides for testing purposes.
 * @returns Typed and validated environment object.
 */
export function validateEnv(overrides?: Partial<Env>): Env {
  const source = { ...process.env, ...overrides };
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue: z.ZodIssue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `❌ Environment validation failed:\n${issues}\n\n` +
        "Please check your .env file or environment variables.",
    );
  }

  parsedEnv = result.data;
  return parsedEnv;
}

/**
 * Get the previously validated environment object.
 * Must be called after `validateEnv()`.
 */
export function getEnv(): Env {
  if (!parsedEnv) {
    // In production, auto-validate on first access
    if (process.env.NODE_ENV === "production") {
      return validateEnv();
    }
    throw new Error("Environment not yet validated. Call validateEnv() at startup.");
  }
  return parsedEnv;
}

// ─── Convenience Re-exports ──────────────────────────

/**
 * Safely access a single environment variable with type
 * checking and a fallback default.
 */
export function env<K extends keyof Env>(key: K): Env[K] {
  return getEnv()[key];
}
