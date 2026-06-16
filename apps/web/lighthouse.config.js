// ─────────────────────────────────────────────────────────
// Lighthouse CI — Performance Budget Configuration
// ─────────────────────────────────────────────────────────
// Budget thresholds for Lighthouse CI runs. Used to fail
// CI builds when performance, accessibility, or size budgets
// are exceeded.
// ─────────────────────────────────────────────────────────

module.exports = {
  ci: {
    collect: {
      // Number of runs to average
      numberOfRuns: 3,
      // Static build directory (production build)
      staticDistDir: "./.next",
      // URL paths to audit
      url: [
        "http://localhost:3000/",
      ],
    },
    assert: {
      // Fail CI if any of these budgets are exceeded
      assertions: {
        // ── Performance ────────────────────────────────
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 3000 }],
        "interactive": ["error", { maxNumericValue: 5000 }],
        "speed-index": ["warn", { maxNumericValue: 4000 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],

        // ── Best Practices ─────────────────────────────
        "uses-http2": ["error"],
        "uses-passive-event-listeners": ["error"],
        "no-document-write": ["error"],
        "meta-viewport": ["error"],
        "errors-in-console": ["error"],

        // ── Accessibility ──────────────────────────────
        "color-contrast": ["error"],
        "image-alt": ["error"],
        "label": ["error"],
        "tap-targets": ["warn"],

        // ── SEO ────────────────────────────────────────
        "meta-description": ["warn"],
        "document-title": ["error"],
        "font-display": ["error"],

        // ── Resource Size Budgets ──────────────────────
        "unused-javascript": ["warn", { maxNumericValue: 50 }],
        "unused-css-rules": ["warn", { maxNumericValue: 10 }],
        "render-blocking-resources": ["warn", { maxNumericValue: 2 }],
        "uses-responsive-images": ["error"],
        "offscreen-images": ["warn"],
        "total-byte-weight": ["warn", { maxNumericValue: 500_000 }],
      },
      // Performance score threshold (0-100)
      // Lighthouse score must be >= this value
      preset: "lighthouse:no-pwa",
    },
    upload: {
      target: "temporary-public-storage",
    },
    server: {},
  },
};
