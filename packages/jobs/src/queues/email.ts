// ─────────────────────────────────────────────────────────
// Email Queue — BullMQ worker + producer helpers
// ─────────────────────────────────────────────────────────

import { addJob, createWorker, type EmailJobPayload, QUEUES } from "../index";

/**
 * Add an email job to the queue.
 */
export async function sendEmailJob(payload: EmailJobPayload, delay?: number) {
  return addJob(QUEUES.EMAIL, payload, { delay });
}

/**
 * Create the email queue worker.
 * The `handler` function is injected so the consumer app
 * (backend) can provide the actual email-sending logic.
 */
export function createEmailWorker(handler: (payload: EmailJobPayload) => Promise<void>) {
  return createWorker(QUEUES.EMAIL, async (job) => {
    const data = job.data as EmailJobPayload;
    console.log(`[Jobs:Email] Processing job ${job.id} — type=${data.type} to=${data.to}`);
    await handler(data);
  });
}

// Re-export for convenience
export { getQueue as getEmailQueue } from "../index";
