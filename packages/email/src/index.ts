// ─────────────────────────────────────────────────────────
// Email Service — Resend Client Wrapper
// ─────────────────────────────────────────────────────────
// Wraps the Resend SDK to provide a typed sendEmail helper
// with common email templates.
// ─────────────────────────────────────────────────────────

import { Resend } from "resend";

// ─── Client Setup ────────────────────────────────────

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_EMAIL = process.env.EMAIL_FROM ?? "noreply@acte.app";

let resendClient: Resend | null = null;

function getClient(): Resend {
  if (!resendClient) {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is required to send emails");
    }
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

// ─── Types ────────────────────────────────────────────

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string;
  }>;
}

export interface SendEmailResult {
  id: string;
  from: string;
  to: string[];
  createdAt: string;
}

// ─── Send ─────────────────────────────────────────────

/**
 * Send an email via Resend.
 * Returns the send result containing the Resend message ID.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const client = getClient();

  const { data, error } = await client.emails.send({
    from: options.from ?? FROM_EMAIL,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
    attachments: options.attachments,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return {
    id: data?.id ?? "",
    from: options.from ?? FROM_EMAIL,
    to: Array.isArray(options.to) ? options.to : [options.to],
    createdAt: new Date().toISOString(),
  };
}

// ─── Verify Connection ────────────────────────────────

/**
 * Test that the Resend API key is valid by fetching the
 * current account/audience info.
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    const client = getClient();
    await client.audiences.list();
    return true;
  } catch {
    return false;
  }
}
