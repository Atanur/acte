// ─────────────────────────────────────────────────────────
// Sentry setup – Backend (Bun / Hono)
// ─────────────────────────────────────────────────────────
// Initializes Sentry for the Bun backend.
// Reads DSN from the SENTRY_DSN environment variable.
// Stub – uncomment & configure when you add the
// @sentry/bun package to apps/backend/package.json.
// ─────────────────────────────────────────────────────────

// import * as Sentry from "@sentry/bun";
//
// Sentry.init({
//   dsn: process.env.SENTRY_DSN,
//   environment: process.env.NODE_ENV ?? "development",
//   tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
// });

export {};
