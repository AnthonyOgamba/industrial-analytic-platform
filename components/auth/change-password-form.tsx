"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

import { apiRequest } from "@/lib/api-client";
import { validatePassword } from "@/lib/auth/password-policy";
import { PasswordField } from "./password-field";

export function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/login?reason=authentication-required");
          return;
        }
        if (!response.ok) throw new Error("Your session could not be verified.");
        const session = await response.json();
        if (!session?.user?.mustChangePassword) router.replace("/");
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Your session could not be verified."))
      .finally(() => setChecking(false));
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmation) {
      setError("New password confirmation does not match.");
      return;
    }
    if (!currentPassword) {
      setError("Current temporary password is required.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await apiRequest("/api/backend/profile", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      window.dispatchEvent(new Event("divu-session-cleared"));
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      window.location.assign("/login?reason=password-changed");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Password change failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-form-shell">
      <h1>Change password</h1>
      <form className="auth-card" onSubmit={submit}>
        <p className="text-sm text-muted-foreground">
          Replace your temporary password before accessing DIVU Analytics.
        </p>
        {error && <div className="auth-alert auth-alert-error" role="alert">{error}</div>}
        <label htmlFor="current-password">Current temporary password</label>
        <PasswordField
          id="current-password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
        <label htmlFor="new-password">New password</label>
        <PasswordField
          id="new-password"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <label htmlFor="confirm-password">Confirm new password</label>
        <PasswordField
          id="confirm-password"
          autoComplete="new-password"
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
        <button
          className="auth-submit"
          disabled={checking || pending}
          aria-busy={checking || pending}
          type="submit"
        >
          <KeyRound aria-hidden="true" />
          {checking ? "Checking session…" : pending ? "Changing password…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
