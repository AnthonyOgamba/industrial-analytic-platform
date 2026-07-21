"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { passwordRequirements, validatePassword } from "@/lib/auth/password-policy";
import { PasswordField } from "./password-field";

export function ResetPasswordForm({ token }: { token: string }) {
  const [validToken, setValidToken] = useState<boolean | null>(token ? null : false);
  const [availabilityError, setAvailabilityError] = useState(token ? "" : "A password reset token is required.");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!token) return;
    apiRequest(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then(() => setValidToken(true)).catch((cause) => { setAvailabilityError(cause instanceof Error ? cause.message : "Password reset is unavailable."); setValidToken(false); });
  }, [token]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const policyError = validatePassword(password);
    if (policyError) { setError(policyError); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setPending(true); setError("");
    try {
      await apiRequest("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword: password }) });
      setPassword(""); setConfirm(""); setSuccess(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to reset password."); }
    finally { setPending(false); }
  }
  return (
    <div className="auth-form-shell">
      <h1>Choose a new password</h1>
      <div className="auth-card">
        {validToken === null ? <div className="auth-loading" role="status">Checking reset link...</div> :
          !validToken ? <div className="auth-alert auth-alert-error" role="alert">{availabilityError || "Password reset completion is unavailable."}</div> :
          success ? <div className="auth-success" role="status" aria-live="polite"><CheckCircle2 aria-hidden="true" /><h2>Password reset</h2><p>Your password has been reset successfully.</p></div> :
          <form onSubmit={submit} noValidate>
            {error && <div className="auth-alert auth-alert-error" role="alert">{error}</div>}
            <label htmlFor="new-password">NEW PASSWORD</label>
            <PasswordField id="new-password" autoComplete="new-password" required maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a new password" />
            <label htmlFor="confirm-password">CONFIRM NEW PASSWORD</label>
            <PasswordField id="confirm-password" autoComplete="new-password" required maxLength={72} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm your new password" />
            <ul className="auth-requirements">{passwordRequirements.map((item) => <li key={item}>{item}</li>)}</ul>
            <button className="auth-submit" type="submit" disabled={pending || !password || !confirm} aria-busy={pending}>{pending ? "Resetting..." : "Reset password"}</button>
          </form>}
        <Link className="auth-back" href="/login"><ArrowLeft aria-hidden="true" />Back to Login</Link>
      </div>
    </div>
  );
}
