// ─────────────────────────────────────────────────────────
// Analytics — Mobile (PostHog stub)
// ─────────────────────────────────────────────────────────
// Stub for PostHog analytics integration in the Expo app.
// Uncomment and configure when ready to use PostHog.
// ─────────────────────────────────────────────────────────

// import posthog from "posthog-react-native";

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? "";
const _POSTHOG_API_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

/**
 * Initialize PostHog analytics.
 * Call this once in your app entry point.
 */
export function initAnalytics(): void {
  if (!POSTHOG_API_KEY) {
    console.info("[Analytics] PostHog key not configured — skipping init");
    return;
  }
  // posthog.init(POSTHOG_API_KEY, {
  //   api_host: POSTHOG_API_HOST,
  //   person_profiles: "identified_only",
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
  if (!POSTHOG_API_KEY) return;
  // posthog.capture(event, properties);
  console.info(`[Analytics] Event: ${event}`, properties ?? {});
}

/**
 * Identify a user.
 */
export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (!POSTHOG_API_KEY) return;
  // posthog.identify(userId, traits);
  console.info(`[Analytics] Identify: ${userId}`, traits ?? {});
}

/**
 * Reset user identity (on logout).
 */
export function resetAnalytics(): void {
  if (!POSTHOG_API_KEY) return;
  // posthog.reset();
  console.info("[Analytics] Reset");
}
