// ─────────────────────────────────────────────────────────
// Rate Limiting — Middleware
// ─────────────────────────────────────────────────────────
// In-memory sliding-window rate limiter.
// Returns 429 with a standard error envelope when exceeded.
// ─────────────────────────────────────────────────────────

import type { MiddlewareHandler } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { AppError } from "../lib/errors";

// ─── Types ─────────────────────────────────────────────

export interface RateLimitConfig {
  /** Max requests allowed within the window (default: 100) */
  max: number;
  /** Window duration in ms (default: 60_000 = 1 minute) */
  windowMs: number;
  /** Key extractor — defaults to IP */
  keyGenerator: (c: Parameters<MiddlewareHandler>[0]) => string;
  /** Message sent when rate limit is exceeded */
  message: string;
}

// ─── Defaults ──────────────────────────────────────────

const DEFAULTS: RateLimitConfig = {
  max: 100,
  windowMs: 60_000,
  keyGenerator: (c) =>
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    c.req.header("x-real-ip") ??
    "unknown",
  message: "Too many requests, please try again later.",
};

// ─── In-memory Store ──────────────────────────────────

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

// Periodic cleanup every 60 seconds to avoid memory leaks
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    });
    // If the store is empty, stop the interval
    if (store.size === 0 && cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  }, 60_000);
}

// ─── Middleware ────────────────────────────────────────

/**
 * In-memory sliding-window rate limiter for Hono.
 *
 * ```ts
 * app.use("/api/*", rateLimiter({ max: 100 }));
 * ```
 */
export function rateLimiter(overrides: Partial<RateLimitConfig> = {}): MiddlewareHandler {
  const config: RateLimitConfig = { ...DEFAULTS, ...overrides };

  // Start periodic cleanup when the first limiter is created
  startCleanup();

  return async (c, next) => {
    const key = config.keyGenerator(c);
    const now = Date.now();

    let entry = store.get(key);

    // If no entry or window has expired, start a new window
    if (!entry || now >= entry.resetAt) {
      entry = { count: 1, resetAt: now + config.windowMs };
      store.set(key, entry);
      // Set headers
      c.res.headers.set("RateLimit-Limit", String(config.max));
      c.res.headers.set("RateLimit-Remaining", String(config.max - 1));
      c.res.headers.set("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
      await next();
      return;
    }

    // Increment the counter
    entry.count++;

    const remaining = Math.max(0, config.max - entry.count);

    c.res.headers.set("RateLimit-Limit", String(config.max));
    c.res.headers.set("RateLimit-Remaining", String(remaining));
    c.res.headers.set("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    // If over the limit, return 429
    if (entry.count > config.max) {
      const err = new AppError(429, "RATE_LIMIT_EXCEEDED", config.message, {
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
      c.status(429 as StatusCode);
      return c.json({
        status: "error",
        error: err.code,
        message: err.message,
        details: err.details,
        timestamp: new Date().toISOString(),
      });
    }

    await next();
  };
}

/**
 * Reset the rate-limit store (useful for testing).
 */
export function resetRateLimitStore(): void {
  store.clear();
}
