"use client";

import { useAccess } from "@/lib/access-control";

export type SessionUser = {
  uid: number;
  username: string;
  email: string;
  role: string;
  roles: string[];
  displayRole: string;
  capabilities: string[];
  permissions: string[];
  facilityIds: number[];
  permissionVersion: number;
  accountStatus: string;
  mustChangePassword: boolean;
};

export function useSessionUser() {
  const { user, loading } = useAccess();
  return { user, loading };
}
