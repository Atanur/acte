// ─────────────────────────────────────────────────────────
// Email Service — Backend sendEmail wrapper
// ─────────────────────────────────────────────────────────
// Exports helper functions to send emails via the Resend
// email package. Integrates with the background job queue
// for async delivery.
// ─────────────────────────────────────────────────────────

import { sendEmail as resendSendEmail, type SendEmailOptions, type SendEmailResult } from "email";
import { sendEmailJob } from "jobs/queues/email";

/**
 * Send an email immediately (blocking).
 * Useful for critical transactional emails during a request.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  return resendSendEmail(options);
}

/**
 * Queue an email for background delivery via BullMQ.
 * Preferred for non-critical emails to avoid blocking the HTTP response.
 */
export async function queueEmail(
  to: string,
  subject: string,
  html: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await sendEmailJob({
    type: "generic",
    to,
    subject,
    body: html,
    metadata,
  });
}

/**
 * Send a welcome email to a newly registered user.
 */
export async function sendWelcomeEmail(
  to: string,
  username: string,
  verifyLink?: string,
): Promise<SendEmailResult> {
  const { WelcomeEmail } = await import("email/templates/welcome");
  const html = WelcomeEmail({ username, verifyLink });
  return sendEmail({ to, subject: "Welcome to Acte 🎉", html });
}

/**
 * Send a password reset email.
 */
export async function sendResetPasswordEmail(
  to: string,
  username: string,
  resetLink: string,
): Promise<SendEmailResult> {
  const { ResetPasswordEmail } = await import("email/templates/reset-password");
  const html = ResetPasswordEmail({ username, resetLink });
  return sendEmail({ to, subject: "Reset Your Password 🔑", html });
}
