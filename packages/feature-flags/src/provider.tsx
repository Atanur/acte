// ─────────────────────────────────────────────────────────
// Feature Flags — React Provider
// ─────────────────────────────────────────────────────────
// React context and provider for feature flags.
// Works identically for both web (Next.js) and mobile
// (Expo) environments.
// ─────────────────────────────────────────────────────────

"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import {
  type FeatureFlagKey,
  type FeatureFlagStore,
  isFeatureEnabled,
  resetFeatureOverrides,
  setFeatureFlagStore,
  setFeatureOverride,
} from "./index";

// ─── Context ──────────────────────────────────────────

interface FeatureFlagsContextValue {
  /** Check if a feature flag is enabled. */
  isEnabled: (key: FeatureFlagKey) => boolean;
  /** Override a feature flag at runtime. */
  setOverride: (key: string, value: boolean) => void;
  /** Reset all runtime overrides. */
  resetOverrides: () => void;
  /** Get all current overrides. */
  overrides: Record<string, boolean>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────

interface FeatureFlagsProviderProps {
  children: ReactNode;
  /**
   * Optional custom store instance.
   * Useful for injecting server-side overrides or
   * a test store in unit tests.
   */
  store?: FeatureFlagStore;
  /**
   * Initial overrides to apply on mount.
   */
  initialOverrides?: Record<string, boolean>;
}

/**
 * React provider for feature flags.
 * Wraps your app at the root level.
 *
 * @example
 * ```tsx
 * <FeatureFlagsProvider>
 *   <App />
 * </FeatureFlagsProvider>
 * ```
 */
export function FeatureFlagsProvider({
  children,
  store,
  initialOverrides,
}: FeatureFlagsProviderProps) {
  // Initialize the global store if provided
  const [overrides, setOverrides] = useState<Record<string, boolean>>(() => {
    if (store) {
      setFeatureFlagStore(store);
    }
    if (initialOverrides) {
      if (store) {
        for (const [key, value] of Object.entries(initialOverrides)) {
          store.setOverride(key, value);
        }
      } else {
        for (const [key, value] of Object.entries(initialOverrides)) {
          setFeatureOverride(key, value);
        }
      }
      return { ...initialOverrides };
    }
    return {};
  });

  const isEnabled = useCallback(
    (key: FeatureFlagKey): boolean => {
      if (overrides[key] !== undefined) {
        return overrides[key];
      }
      return isFeatureEnabled(key);
    },
    [overrides],
  );

  const setOverride = useCallback((key: string, value: boolean) => {
    setFeatureOverride(key, value);
    setOverrides((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetOverridesFn = useCallback(() => {
    resetFeatureOverrides();
    setOverrides({});
  }, []);

  const value = useMemo<FeatureFlagsContextValue>(
    () => ({
      isEnabled,
      setOverride,
      resetOverrides: resetOverridesFn,
      overrides,
    }),
    [isEnabled, setOverride, resetOverridesFn, overrides],
  );

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────

/**
 * Hook to access feature flags from any component.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isEnabled } = useFeatureFlags();
 *   if (!isEnabled("upload.enabled")) return null;
 *   return <UploadButton />;
 * }
 * ```
 */
export function useFeatureFlags(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error("useFeatureFlags must be used within a <FeatureFlagsProvider>");
  }
  return context;
}
