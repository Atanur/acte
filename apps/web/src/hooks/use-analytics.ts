// ─────────────────────────────────────────────────────────
// useAnalytics — Web React hook
// ─────────────────────────────────────────────────────────
// Provides analytics tracking functions as a hook.
// ─────────────────────────────────────────────────────────

import { useCallback } from "react";
import { captureEvent, identifyUser, resetAnalytics } from "../lib/analytics";

interface AnalyticsHook {
  track: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  reset: () => void;
}

export function useAnalytics(): AnalyticsHook {
  const track = useCallback((event: string, properties?: Record<string, unknown>) => {
    captureEvent(event, properties);
  }, []);

  const identify = useCallback((userId: string, traits?: Record<string, unknown>) => {
    identifyUser(userId, traits);
  }, []);

  const reset = useCallback(() => {
    resetAnalytics();
  }, []);

  return { track, identify, reset };
}
