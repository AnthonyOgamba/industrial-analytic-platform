"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RoleManagement } from "@/components/roles/role-management";
import { PermissionsPage } from "@/components/roles/permissions-page";
import { SensitiveUserActions } from "./sensitive-user-actions";
import { UsersPage } from "./users-page";
import { UserRoleAssignments } from "./user-role-assignments";

export function UserAccessPage() {
  const requestedTab = useSearchParams().get("tab");
  const activeTab = requestedTab === "roles" || requestedTab === "permissions" ? requestedTab : "users";
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">User &amp; Access Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage user identities, roles, and permissions.</p>
      </header>
      <nav role="tablist" aria-label="User and access management" className="flex overflow-x-auto border-b">
        <Link href="/users" role="tab" aria-selected={activeTab==="users"} className={`h-11 border-b-2 px-4 py-3 text-xs font-semibold ${activeTab==="users" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Users</Link>
        <Link href="/users?tab=roles" role="tab" aria-selected={activeTab==="roles"} className={`h-11 border-b-2 px-4 py-3 text-xs font-semibold ${activeTab==="roles" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Roles</Link>
        <Link href="/users?tab=permissions" role="tab" aria-selected={activeTab==="permissions"} className={`h-11 border-b-2 px-4 py-3 text-xs font-semibold ${activeTab==="permissions" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Permissions</Link>
      </nav>
      <section role="tabpanel" aria-label={activeTab}>
        {activeTab==="users" ? <div className="space-y-5"><UsersPage /><UserRoleAssignments/><SensitiveUserActions /></div> : activeTab==="roles" ? <RoleManagement/> : <PermissionsPage/>}
      </section>
    </div>
  );
}
