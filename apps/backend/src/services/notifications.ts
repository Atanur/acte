// ─────────────────────────────────────────────────────────
// Push Notifications — Backend (Expo Push API)
// ─────────────────────────────────────────────────────────
// Uses expo-server-sdk to send push notifications to
// Expo-compatible devices (iOS, Android, Web).
// ─────────────────────────────────────────────────────────

import { Expo, type ExpoPushMessage, type ExpoPushTicket } from "expo-server-sdk";

let expo: Expo | null = null;

function getExpoClient(): Expo {
  if (!expo) {
    expo = new Expo();
  }
  return expo;
}

/**
 * Send a push notification to a single Expo push token.
 *
 * @param expoPushToken - The Expo push token of the target device.
 * @param title         - Notification title.
 * @param body          - Notification body text.
 * @param data          - Optional JSON data payload sent with the notification.
 * @returns             - The push ticket(s) returned by Expo.
 */
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<ExpoPushTicket[]> {
  const client = getExpoClient();

  // Validate the push token
  if (!Expo.isExpoPushToken(expoPushToken)) {
    throw new Error(`Invalid Expo push token: ${expoPushToken}`);
  }

  const messages: ExpoPushMessage[] = [
    {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data: data ?? {},
      priority: "high",
    },
  ];

  const chunks = client.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await client.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("Failed to send push notification chunk:", error);
      throw error;
    }
  }

  return tickets;
}

/**
 * Send the same push notification to multiple recipients.
 */
export async function sendBulkPushNotifications(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<ExpoPushTicket[]> {
  const client = getExpoClient();
  const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t));

  if (validTokens.length === 0) {
    return [];
  }

  const messages: ExpoPushMessage[] = validTokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data: data ?? {},
    priority: "high",
  }));

  const chunks = client.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await client.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("Failed to send bulk push notification chunk:", error);
      throw error;
    }
  }

  return tickets;
}
