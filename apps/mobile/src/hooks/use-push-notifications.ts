// ─────────────────────────────────────────────────────────
// usePushNotifications — React hook for Expo push notifications
// ─────────────────────────────────────────────────────────
// Registers for push notifications on mount and listens
// for incoming notifications while the component is alive.
// ─────────────────────────────────────────────────────────

import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { registerForPushNotificationsAsync } from "../services/notifications";

interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

/**
 * Custom hook that manages the push notification lifecycle.
 *
 * - Requests permission and retrieves the Expo push token on mount.
 * - Listens for incoming notifications (foreground and background).
 * - Returns the current push token and latest notification.
 */
export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    expoPushToken: null,
    notification: null,
    error: null,
  });

  // Register for push notifications on mount
  useEffect(() => {
    let isMounted = true;

    async function register() {
      try {
        const token = await registerForPushNotificationsAsync();
        if (isMounted) {
          setState((prev) => ({ ...prev, expoPushToken: token }));
        }
      } catch (error) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            error: error instanceof Error ? error : new Error(String(error)),
          }));
        }
      }
    }

    register();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for notifications received while app is foregrounded
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      setState((prev) => ({ ...prev, notification }));
    });

    return () => subscription.remove();
  }, []);

  // Listen for notification responses (user tapped on notification)
  const lastNotificationResponse = useCallback(() => {
    return Notifications.getLastNotificationResponseAsync();
  }, []);

  return {
    expoPushToken: state.expoPushToken,
    notification: state.notification,
    error: state.error,
    lastNotificationResponse,
  };
}
