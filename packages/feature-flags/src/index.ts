// ─────────────────────────────────────────────────────────
// Feature Flags — Core system
// ─────────────────────────────────────────────────────────
// A lightweight, type-safe feature flag system.
// Supports default values, runtime overrides, and
// React context integration for both web and mobile.
// ─────────────────────────────────────────────────────────

import { type FeatureFlagKey, getDefaultFlag } from "./flags";

/**
 * Interface for the feature flag store.
 * Implementations can read from environment variables,
 * local storage, remote config, or a hardcoded map.
 */
export interface FeatureFlagStore {
  isEnabled(key: FeatureFlagKey): boolean;
  getOverrides(): Record<string, boolean>;
  setOverride(key: string, value: boolean): void;
  resetOverrides(): void;
}

/**
 * Default in-memory feature flag store.
 * Supports runtime overrides for testing or dynamic toggling.
 */
export class DefaultFeatureFlagStore implements FeatureFlagStore {
  private overrides: Map<string, boolean> = new Map();

  isEnabled(key: FeatureFlagKey): boolean {
    // Check overrides first
    if (this.overrides.has(key)) {
      return this.overrides.get(key) ?? false;
    }
    return getDefaultFlag(key);
  }

  getOverrides(): Record<string, boolean> {
    return Object.fromEntries(this.overrides.entries());
  }

  setOverride(key: string, value: boolean): void {
    this.overrides.set(key, value);
  }

  resetOverrides(): void {
    this.overrides.clear();
  }
}

/**
 * Environment-variable-backed feature flag store.
 * Reads flags from process.env with the pattern:
 *   FEATURE_FLAG_<KEY_IN_SCREAMING_SNAKE_CASE>
 *
 * Example: `FEATURE_FLAG_UPLOAD_ENABLED` controls `upload.enabled`.
 */
export class EnvFeatureFlagStore implements FeatureFlagStore {
  private fallback: FeatureFlagStore;

  constructor(fallback?: FeatureFlagStore) {
    this.fallback = fallback ?? new DefaultFeatureFlagStore();
  }

  isEnabled(key: FeatureFlagKey): boolean {
    const envKey = `FEATURE_FLAG_${key.toUpperCase().replace(/\./g, "_")}`;
    const envValue = typeof process !== "undefined" ? process.env[envKey] : undefined;

    if (envValue === "true") return true;
    if (envValue === "false") return false;

    return this.fallback.isEnabled(key);
  }

  getOverrides(): Record<string, boolean> {
    return this.fallback.getOverrides();
  }

  setOverride(key: string, value: boolean): void {
    this.fallback.setOverride(key, value);
  }

  resetOverrides(): void {
    this.fallback.resetOverrides();
  }
}

/**
 * Singleton feature flag store used across the app.
 * Swap implementations at startup as needed.
 */
let globalStore: FeatureFlagStore = new EnvFeatureFlagStore();

export function setFeatureFlagStore(store: FeatureFlagStore): void {
  globalStore = store;
}

export function getFeatureFlagStore(): FeatureFlagStore {
  return globalStore;
}

/**
 * Check if a feature flag is enabled.
 * This is the main API for server-side / non-React code.
 */
export function isFeatureEnabled(key: FeatureFlagKey): boolean {
  return globalStore.isEnabled(key);
}

/**
 * Override a feature flag at runtime.
 */
export function setFeatureOverride(key: string, value: boolean): void {
  globalStore.setOverride(key, value);
}

/**
 * Reset all runtime overrides.
 */
export function resetFeatureOverrides(): void {
  globalStore.resetOverrides();
}

// Re-export types from flags
export type { FeatureFlagDefinition, FeatureFlagKey } from "./flags";
