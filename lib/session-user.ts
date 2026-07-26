"use client";

import { useEffect, useState } from "react";

export type SessionUser = {
  uid: number;
  username: string;
  email: string;
  role: string;
  displayRole: string;
  capabilities: string[];
  facilityIds: number[];
  mustChangePassword: boolean;
};

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : undefined)
      .then((session) => {
        if (active) setUser(session?.user);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}
