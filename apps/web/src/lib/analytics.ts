// ─────────────────────────────────────────────────────────
// Analytics — Web (PostHog stub)
// ─────────────────────────────────────────────────────────
// Stub for PostHog analytics integration.
// Uncomment and configure when ready to use PostHog.
// ─────────────────────────────────────────────────────────

// import posthog from "posthog-js";
// import { PostHogProvider } from "posthog-js/react";

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const _POSTHOG_API_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

/**
 * Initialize PostHog analytics.
 * Call this once in your app layout (client-side).
 */
export function initAnalytics(): void {
  if (typeof window === "undefined") return;
  if (!POSTHOG_API_KEY) {
    console.info("[Analytics] PostHog key not configured — skipping init");
    return;
  }
  // posthog.init(POSTHOG_API_KEY, {
  //   api_host: POSTHOG_API_HOST,
  //   person_profiles: "identified_only",
  //   loaded: (ph) => {
  //     console.info("[Analytics] PostHog initialized", ph);
  //   },
  // });
  console.info(
    "[Analytics] PostHog init stub — key would be:",
    `${POSTHOG_API_KEY.substring(0, 8)}...`,
  );
}

/**
 * Capture a custom event.
 */
export function captureEvent(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!POSTHOG_API_KEY) return;
  // posthog.capture(event, properties);
  console.info(`[Analytics] Event: ${event}`, properties ?? {});
}

/**
 * Identify a user.
 */
export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!POSTHOG_API_KEY) return;
  // posthog.identify(userId, traits);
  console.info(`[Analytics] Identify: ${userId}`, traits ?? {});
}

/**
 * Reset user identity (on logout).
 */
export function resetAnalytics(): void {
  if (typeof window === "undefined") return;
  if (!POSTHOG_API_KEY) return;
  // posthog.reset();
  console.info("[Analytics] Reset");
}
