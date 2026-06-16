// ─────────────────────────────────────────────────────────
// Analytics — Backend (event tracking stub)
// ─────────────────────────────────────────────────────────
// Stub for server-side analytics events.
// Replace with your analytics provider (e.g., PostHog,
// Mixpanel, custom logger, etc.).
// ─────────────────────────────────────────────────────────

type EventProperties = Record<string, unknown>;

interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: EventProperties;
  timestamp: Date;
}

/**
 * Log an analytics event on the server side.
 * Currently logs to console; replace with your actual
 * analytics provider integration.
 */
export function trackEvent(event: string, userId?: string, properties?: EventProperties): void {
  const payload: AnalyticsEvent = {
    event,
    userId,
    properties,
    timestamp: new Date(),
  };

  if (process.env.NODE_ENV === "development") {
    console.info("[Analytics]", payload);
  }

  // TODO: Replace with actual analytics provider
  // Example:
  // await analyticsClient.capture({
  //   distinctId: userId ?? "anonymous",
  //   event,
  //   properties,
  // });
}

/**
 * Identify a user for analytics purposes.
 */
export function identifyUser(userId: string, traits?: EventProperties): void {
  if (process.env.NODE_ENV === "development") {
    console.info("[Analytics] Identify user:", { userId, traits });
  }

  // TODO: Replace with actual analytics provider
  // analyticsClient.identify(userId, traits);
}
