// ─────────────────────────────────────────────────────────
// Reset Password Email Template
// ─────────────────────────────────────────────────────────
// Renders a password-reset email for users who forgot
// their credentials.
// ─────────────────────────────────────────────────────────

interface ResetPasswordProps {
  username: string;
  resetLink: string;
  expiresInMinutes?: number;
}

/**
 * Generate the password reset email HTML body.
 */
export function ResetPasswordEmail({
  username,
  resetLink,
  expiresInMinutes = 60,
}: ResetPasswordProps): string {
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
              <h1 style="margin:0 0 8px;font-size:24px;color:#18181b;">Reset Your Password 🔑</h1>
              <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.5;">
                Hi <strong>${username}</strong>, we received a request to reset your password.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.5;">
                Click the button below to set a new password. This link expires in
                <strong>${expiresInMinutes} minutes</strong>.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td align="center" style="background-color:#18181b;border-radius:8px;padding:12px 24px;">
                    <a href="${resetLink}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:14px;color:#a1a1aa;">
                If you didn't request a password reset, please ignore this email or
                contact support if you have concerns.
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
