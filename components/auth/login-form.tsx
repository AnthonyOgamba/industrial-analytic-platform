"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { PasswordField } from "./password-field";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(search.get("reason") === "session-expired" ? "Your session expired. Please sign in again." : "");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (!username.trim() || !password) { setError("Enter your username and password."); return; }
    setPending(true); setError("");
    try {
      const session = await apiRequest<{ token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify({ username: username.trim(), password }) });
      sessionStorage.setItem("divu-access-token", session.token);
      setPassword("");
      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed.");
    } finally { setPending(false); }
  }
  return (
    <div className="auth-form-shell">
      <h1>Login</h1>
      <form className="auth-card" onSubmit={submit} noValidate>
        {error && <div className="auth-alert auth-alert-error" role="alert">{error}</div>}
        <label htmlFor="username">USERNAME</label>
        <div className="auth-input-wrap">
          <User aria-hidden="true" className="auth-input-icon" />
          <input id="username" name="username" autoComplete="username" required maxLength={100} placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="auth-label-row"><label htmlFor="password">PASSWORD</label><Link href="/forgot-password">Forgot?</Link></div>
        <PasswordField id="password" name="password" autoComplete="current-password" required maxLength={256} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="auth-submit" disabled={pending} aria-busy={pending} type="submit">
          {pending ? "Signing in..." : <><span>Sign In</span><LogIn aria-hidden="true" /></>}
        </button>
      </form>
    </div>
  );
}
