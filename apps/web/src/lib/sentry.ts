// ─────────────────────────────────────────────────────────
// Sentry setup – Web (Next.js / React)
// ─────────────────────────────────────────────────────────
// Initializes Sentry for the Next.js web frontend.
// Reads DSN from the NEXT_PUBLIC_SENTRY_DSN environment
// variable (public, must be prefixed with NEXT_PUBLIC_).
// Stub – uncomment & configure when you add the
// @sentry/nextjs package to apps/web/package.json.
// ─────────────────────────────────────────────────────────

// import * as Sentry from "@sentry/nextjs";
//
// Sentry.init({
//   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//   environment: process.env.NODE_ENV ?? "development",
//   tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
// });

export {};
