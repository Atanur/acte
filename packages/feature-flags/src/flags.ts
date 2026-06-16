// ─────────────────────────────────────────────────────────
// Feature Flags — Default flag definitions
// ─────────────────────────────────────────────────────────
// Central registry of all feature flags used across
// the application. Each flag has a key, description,
// and default value.
// ─────────────────────────────────────────────────────────

export interface FeatureFlagDefinition {
  key: string;
  description: string;
  defaultValue: boolean;
}

/**
 * All feature flags used across web + mobile + backend.
 *
 * Convention: use dot-notation keys scoped by domain.
 * Examples:
 *   - `notifications.enabled`
 *   - `upload.video`
 *   - `auth.sso`
 */
export const FEATURE_FLAGS: FeatureFlagDefinition[] = [
  {
    key: "notifications.push",
    description: "Enable push notifications",
    defaultValue: true,
  },
  {
    key: "upload.enabled",
    description: "Enable file upload functionality",
    defaultValue: true,
  },
  {
    key: "upload.video",
    description: "Enable video file uploads (requires upload.enabled)",
    defaultValue: false,
  },
  {
    key: "analytics.posthog",
    description: "Enable PostHog analytics tracking",
    defaultValue: false,
  },
  {
    key: "analytics.verbose",
    description: "Enable verbose analytics logging in dev mode",
    defaultValue: true,
  },
  {
    key: "auth.sso",
    description: "Enable SSO / social login providers",
    defaultValue: false,
  },
  {
    key: "auth.magic-link",
    description: "Enable magic link authentication",
    defaultValue: false,
  },
  {
    key: "i18n.debug",
    description: "Show i18n translation keys instead of values (debug mode)",
    defaultValue: false,
  },
  {
    key: "experimental.new-onboarding",
    description: "Enable the new onboarding flow (experimental)",
    defaultValue: false,
  },
];

/**
 * Convenience type for all feature flag keys.
 */
export type FeatureFlagKey = (typeof FEATURE_FLAGS)[number]["key"];

/**
 * Get the default value for a feature flag.
 */
export function getDefaultFlag(key: string): boolean {
  const flag = FEATURE_FLAGS.find((f) => f.key === key);
  return flag?.defaultValue ?? false;
}
