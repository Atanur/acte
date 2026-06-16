// ─────────────────────────────────────────────────────────
// Deep Linking — Universal Link & URL Scheme Handler
// ─────────────────────────────────────────────────────────
// Configures Expo Router deep linking for both iOS Universal
// Links and Android App Links. Handles incoming URLs and
// routes them to the correct app screen.
// ─────────────────────────────────────────────────────────

import * as Linking from "expo-linking";
import { router } from "expo-router";

// ─── Constants ───────────────────────────────────────

/** The custom URL scheme registered for the app. */
export const APP_SCHEME = "acte";

/** Base URL for production universal links. */
export const UNIVERSAL_LINK_BASE = "https://acte.app";

// ─── Route Map ───────────────────────────────────────

/**
 * Map of deep link paths to Expo Router screen routes.
 * Update this as the app adds new shareable screens.
 */
const DEEP_LINK_ROUTES: Record<string, string> = {
  "/profile/:id": "/profile/[id]",
  "/posts/:id": "/posts/[id]",
  "/reset-password": "/reset-password",
  "/verify-email": "/verify-email",
  "/settings": "/settings",
};

// ─── Helper: Extract string params from query ────────

/**
 * Safely extract string-only parameters from parsed query params.
 * Converts arrays to their first value and drops undefined.
 */
function extractStringParams(
  queryParams: Record<string, string | string[] | undefined> | undefined,
): Record<string, string> {
  const result: Record<string, string> = {};

  if (!queryParams) {
    return result;
  }

  for (const key of Object.keys(queryParams)) {
    const value = queryParams[key];
    if (value === undefined) {
      continue;
    }
    result[key] = Array.isArray(value) ? value[0] : value;
  }

  return result;
}

// ─── URL Parsing ─────────────────────────────────────

interface ParsedDeepLink {
  /** The Expo Router path to navigate to */
  route: string;
  /** URL parameters extracted from the link */
  params: Record<string, string>;
}

/**
 * Parse an incoming URL and map it to an app route.
 * Handles both custom scheme URLs (acte://...) and
 * universal links (https://acte.app/...).
 */
export function parseDeepLink(url: string): ParsedDeepLink | null {
  // Parse using expo-linking
  const parsed = Linking.parse(url);

  if (!parsed.path) {
    console.warn("[DeepLink] No path found in URL:", url);
    return null;
  }

  // Build the full path
  const path = `/${parsed.path}`;
  const queryParams = extractStringParams(parsed.queryParams as Record<string, string | string[]> | undefined);

  // Check against route map
  for (const [pattern, route] of Object.entries(DEEP_LINK_ROUTES)) {
    const regex = new RegExp(`^${pattern.replace(/:\w+/g, "([^/]+)")}$`);
    const match = path.match(regex);

    if (match) {
      // Extract named parameters from the URL pattern
      const paramNames = (pattern.match(/:(\w+)/g) ?? []).map((p) => p.slice(1));
      const params: Record<string, string> = { ...queryParams };

      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });

      return { route, params };
    }
  }

  // Fallback: treat the path as-is if it matches a known key
  if (DEEP_LINK_ROUTES[path]) {
    return { route: DEEP_LINK_ROUTES[path], params: queryParams };
  }

  // Unknown link — navigate to home
  console.warn("[DeepLink] Unknown route:", path);
  return { route: "/", params: {} };
}

// ─── Handle Incoming Links ───────────────────────────

/**
 * Process an incoming deep link URL and navigate to the
 * corresponding screen. Call this from a linking subscription
 * or from the app's entry point.
 */
export function handleDeepLink(url: string): void {
  const parsed = parseDeepLink(url);

  if (!parsed) {
    return;
  }

  const { route, params } = parsed;

  // Build query string from params
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const href = queryString ? `${route}?${queryString}` : route;

  // Use replace to avoid stacking links in the nav history
  router.replace(href as Parameters<typeof router.replace>[0]);
}

// ─── Expo Router Linking Configuration ──────────────

/**
 * Expo Router linking configuration object.
 * Include this in the root layout or pass to expo-router's
 * `<RootNavigator>` or `LinkingContext`.
 */
export const linkingConfig = {
  prefixes: [APP_SCHEME, UNIVERSAL_LINK_BASE],
  config: {
    screens: {
      index: "",
      "profile/[id]": "profile/:id",
      "posts/[id]": "posts/:id",
      "reset-password": "reset-password",
      "verify-email": "verify-email",
      settings: "settings",
    },
  },
};
