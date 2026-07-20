"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const normalized = email.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || !valid) { setError("Enter a valid email address."); return; }
    setPending(true); setError("");
    try {
      await apiRequest("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ identifier: normalized }) });
      setSubmitted(normalized);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to send reset instructions."); }
    finally { setPending(false); }
  }
  return (
    <div className="auth-form-shell">
      <h1>Reset password</h1>
      <p className="auth-supporting">Enter your account email and we will send password recovery instructions.</p>
      <div className="auth-card">
        {submitted ? (
          <div className="auth-success" role="status" aria-live="polite">
            <CheckCircle2 aria-hidden="true" /><h2>Check your inbox</h2>
            <p>If an account exists for {submitted}, password reset instructions have been sent.</p>
            <button type="button" className="auth-text-button" onClick={() => { setSubmitted(""); setEmail(""); }}>Use a different email</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            {error && <div className="auth-alert auth-alert-error" role="alert">{error}</div>}
            <label htmlFor="email">EMAIL ADDRESS</label>
            <div className="auth-input-wrap"><Mail aria-hidden="true" className="auth-input-icon" /><input id="email" type="email" autoComplete="email" required maxLength={254} placeholder="name@company.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} /></div>
            <button className="auth-submit" type="submit" disabled={pending || !valid} aria-busy={pending}>{pending ? "Sending..." : <><span>Send reset link</span><Send aria-hidden="true" /></>}</button>
          </form>
        )}
        <Link className="auth-back" href="/login"><ArrowLeft aria-hidden="true" />Back to Login</Link>
      </div>
    </div>
  );
}
