// ─────────────────────────────────────────────────────────
// Notifications Queue — BullMQ worker + producer helpers
// ─────────────────────────────────────────────────────────

import { addJob, createWorker, type NotificationJobPayload, QUEUES } from "../index";

/**
 * Add a notification job to the queue.
 */
export async function sendNotificationJob(payload: NotificationJobPayload, delay?: number) {
  return addJob(QUEUES.NOTIFICATIONS, payload, { delay });
}

/**
 * Create the notifications queue worker.
 * The `handler` function is injected so the consumer app
 * can provide actual notification-sending logic.
 */
export function createNotificationWorker(
  handler: (payload: NotificationJobPayload) => Promise<void>,
) {
  return createWorker(QUEUES.NOTIFICATIONS, async (job) => {
    const data = job.data as NotificationJobPayload;
    console.log(
      `[Jobs:Notifications] Processing job ${job.id} — type=${data.type} userId=${data.userId}`,
    );
    await handler(data);
  });
}
