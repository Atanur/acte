// ─────────────────────────────────────────────────────────
// Push Notifications — Mobile (Expo)
// ─────────────────────────────────────────────────────────
// Requests notification permissions and retrieves the
// Expo push token for the device.
// ─────────────────────────────────────────────────────────

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Configure how notifications are displayed when the app
 * is in the foreground.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and retrieve the Expo
 * push token for the current device.
 *
 * @returns The Expo push token string, or `null` if
 *          permissions were denied or the device is not
 *          supported.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Check if we're on a physical device (push tokens are not available on simulators)
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device — running on simulator");
    return null;
  }

  // Android requires a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission was denied");
    return null;
  }

  // Get the Expo push token
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.expoConfig?.extra?.projectId;

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenData.data;
}
