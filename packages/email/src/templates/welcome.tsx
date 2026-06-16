// ─────────────────────────────────────────────────────────
// Welcome Email Template
// ─────────────────────────────────────────────────────────
// Renders a welcome email for newly registered users.
// Uses plain JSX strings (React Email compatible style).
// ─────────────────────────────────────────────────────────

interface WelcomeEmailProps {
  username: string;
  verifyLink?: string;
}

/**
 * Generate the welcome email HTML body.
 */
export function WelcomeEmail({ username, verifyLink }: WelcomeEmailProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px 32px 24px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:24px;color:#18181b;">Welcome to Acte 👋</h1>
              <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.5;">
                Hi <strong>${username}</strong>, we're thrilled to have you on board!
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.5;">
                Acte helps you build modern monorepo applications with ease.
                Get started by exploring the dashboard and setting up your first project.
              </p>
              ${
                verifyLink
                  ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                  <tr>
                    <td align="center" style="background-color:#18181b;border-radius:8px;padding:12px 24px;">
                      <a href="${verifyLink}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">Verify Email</a>
                    </td>
                  </tr>
                </table>`
                  : ""
              }
              <p style="margin:0;font-size:14px;color:#a1a1aa;">
                If you didn't create this account, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background-color:#fafafa;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                &copy; ${new Date().getFullYear()} Acte. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
