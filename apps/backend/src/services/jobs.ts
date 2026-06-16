// ─────────────────────────────────────────────────────────
// Background Jobs — Worker Setup
// ─────────────────────────────────────────────────────────
// Initializes BullMQ workers for processing email and
// notification queues. Called once at backend startup.
// ─────────────────────────────────────────────────────────

import { closeQueues, type EmailJobPayload, type NotificationJobPayload } from "jobs";
import { createEmailWorker } from "jobs/queues/email";
import { createNotificationWorker } from "jobs/queues/notifications";
import { sendEmail } from "./email";
import { sendPushNotification } from "./notifications";

// ─── Worker Initialization ───────────────────────────

let workers: Array<{ close: () => Promise<void> }> = [];

/**
 * Start all background job workers.
 * Call during backend bootstrap (before server.listen).
 */
export function startJobWorkers(): void {
  console.log("[Jobs] Starting workers...");

  // Email worker — sends emails via Resend
  const emailWorker = createEmailWorker(async (payload: EmailJobPayload) => {
    await sendEmail({
      to: payload.to,
      subject: payload.subject,
      html: payload.body,
    });
  });

  // Notification worker — sends push notifications via Expo
  const notificationWorker = createNotificationWorker(async (payload: NotificationJobPayload) => {
    if (payload.type === "push") {
      await sendPushNotification(payload.userId, payload.title, payload.body);
    }
    // In-app notifications would be stored in DB here
  });

  workers = [emailWorker, notificationWorker];

  console.log("[Jobs] Workers started: email, notifications");
}

/**
 * Gracefully stop all workers and close Redis connections.
 * Call during server shutdown (SIGTERM/SIGINT).
 */
export async function stopJobWorkers(): Promise<void> {
  console.log("[Jobs] Stopping workers...");

  await Promise.all(workers.map((w) => w.close()));
  workers = [];

  await closeQueues();
  console.log("[Jobs] Workers stopped");
}
