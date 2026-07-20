import "server-only";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const webhook = process.env.PASSWORD_RESET_EMAIL_WEBHOOK_URL;
  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: email, template: "password-reset", resetUrl }),
    });
    if (!response.ok) throw new Error("Password reset email provider rejected the request.");
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.info(`[development password reset] ${email}: ${resetUrl}`);
  }
}
