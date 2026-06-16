// ─────────────────────────────────────────────────────────
// API Versioning — Middleware
// ─────────────────────────────────────────────────────────
// Validates the API version from the `Accept-Version` header
// or URL prefix. Adds deprecation warning headers for soon-
// to-be-removed versions.
// ─────────────────────────────────────────────────────────

import type { MiddlewareHandler } from "hono";

// ─── Constants ───────────────────────────────────────

/** All supported API versions. */
export const API_VERSIONS = ["v1"] as const;

export type ApiVersion = (typeof API_VERSIONS)[number];

/** The current default version if none is specified. */
export const DEFAULT_API_VERSION: ApiVersion = "v1";

/** Version lifecycle: each version's deprecation / sunset dates. */
export const VERSION_LIFECYCLE: Record<ApiVersion, { deprecated?: string; sunset?: string }> = {
  v1: {
    // v1 is current — no deprecation yet
  },
};

// ─── Header Name ─────────────────────────────────────

export const API_VERSION_HEADER = "Accept-Version";
export const API_DEPRECATION_HEADER = "Sunset";
export const API_DEPRECATION_LINK_HEADER = "Link";

// ─── Helper: Parse Version ───────────────────────────

/**
 * Parse and validate the requested API version from a header value.
 */
export function parseApiVersion(headerValue: string | undefined): ApiVersion {
  if (!headerValue) {
    return DEFAULT_API_VERSION;
  }

  const normalized = headerValue.trim().toLowerCase();

  if (API_VERSIONS.includes(normalized as ApiVersion)) {
    return normalized as ApiVersion;
  }

  // If the version is unrecognized, default to the latest
  console.warn(
    `[API Version] Unrecognized version "${headerValue}", defaulting to ${DEFAULT_API_VERSION}`,
  );
  return DEFAULT_API_VERSION;
}

// ─── Middleware: Version Validation ──────────────────

/**
 * Hono middleware that validates the `Accept-Version` header
 * and attaches the version info to the request context.
 *
 * Usage:
 * ```ts
 * app.use("/api/*", apiVersionMiddleware());
 * ```
 *
 * If the version is deprecated, adds `Sunset` and `Link` headers
 * to the response to inform the client.
 */
export function apiVersionMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const version = parseApiVersion(c.req.header(API_VERSION_HEADER));

    // Store the resolved version for downstream handlers
    c.set("apiVersion", version);

    // Check deprecation status
    const lifecycle = VERSION_LIFECYCLE[version];
    if (lifecycle.deprecated) {
      // Inform the client this version is deprecated
      c.res.headers.set(API_DEPRECATION_HEADER, lifecycle.sunset ?? lifecycle.deprecated);
      c.res.headers.set(
        API_DEPRECATION_LINK_HEADER,
        `</api/${DEFAULT_API_VERSION}>; rel="latest-version"`,
      );
    }

    await next();
  };
}

// ─── Version Prefix Router Helper ────────────────────

/**
 * Extract the API version from the URL path prefix.
 * Supports both `/api/v1/...` and `/api/...` (default) patterns.
 *
 * Usage in Hono:
 * ```ts
 * const api = new Hono();
 * api.route("/api/v1", v1Router);
 * api.route("/api", v1Router); // default fallback
 * ```
 */
export function getVersionFromPath(path: string): ApiVersion {
  const match = path.match(/^\/api\/(v\d+)\//);
  if (match && API_VERSIONS.includes(match[1] as ApiVersion)) {
    return match[1] as ApiVersion;
  }
  return DEFAULT_API_VERSION;
}
