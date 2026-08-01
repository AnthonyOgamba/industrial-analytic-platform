"use client";

// FEATURE: Login
// PAGE: /login authenticates through POST /api/auth/login, then reads /api/auth/session.
// SESSION: Success redirects to password change or the requested protected page.
// ERROR: Authentication failures remain in the form and never expose credentials.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { PasswordField } from "./password-field";
import { useAuthLanguage } from "./auth-language";

export function LoginForm() {
  const {t}=useAuthLanguage();
  const router = useRouter();
  const search = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const reason = search.get("reason");
  const [error, setError] = useState(
    reason === "session-expired" ? t("sessionExpired")
      : reason === "authorization-changed" ? "Your access has changed. Please sign in again."
        : "",
  );
  const passwordChanged = search.get("reason") === "password-changed";
  // HANDLER: Sign In
  // API: POST /api/auth/login followed by GET /api/auth/session.
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (!username.trim() || !password) { setError(t("required")); return; }
    setPending(true); setError("");
    try {
      await apiRequest<{ username: string; role: string; uid: number }>("/api/auth/login", { method: "POST", body: JSON.stringify({ username: username.trim(), password }) });
      const session = await apiRequest<{ user?: { mustChangePassword?: boolean } }>("/api/auth/session");
      setPassword("");
      router.replace(session.user?.mustChangePassword ? "/change-password" : "/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("failed"));
    } finally { setPending(false); }
  }
  return (
    <div className="auth-form-shell">
      <h1>{t("login")}</h1>
      <form className="auth-card" onSubmit={submit} noValidate>
        {passwordChanged && <div className="auth-alert" role="status">Password changed. Sign in with your new password.</div>}
        {error && <div className="auth-alert auth-alert-error" role="alert">{error}</div>}
        <label htmlFor="username">{t("username")}</label>
        <div className="auth-input-wrap">
          <User aria-hidden="true" className="auth-input-icon" />
          <input id="username" name="username" autoComplete="username" required maxLength={100} placeholder={t("usernamePlaceholder")} value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="auth-label-row"><label htmlFor="password">{t("password")}</label><Link href="/forgot-password">{t("forgot")}</Link></div>
        <PasswordField id="password" name="password" autoComplete="current-password" required maxLength={256} placeholder={t("passwordPlaceholder")} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="auth-submit" disabled={pending} aria-busy={pending} type="submit">
          {pending ? t("signingIn") : <><span>{t("signIn")}</span><LogIn aria-hidden="true" /></>}
        </button>
      </form>
    </div>
  );
}
