"use client";

import { KeyRound, Plus, Trash2, Users } from "lucide-react";

import type { Facility, SiteAccess } from "./facilities-data";

type SiteAccessProps = {
  facilities: Facility[];
  accessRecords: SiteAccess[];
  onGrant: () => void;
  onRevoke: (id: string) => void;
};

export function SiteAccessPanel({ facilities, accessRecords, onGrant, onRevoke }: SiteAccessProps) {
  const facilityName = (id: string) => facilities.find((facility) => facility.id === id)?.name ?? "Unknown facility";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)] sm:flex-row sm:items-center">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Users className="size-5" /></div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">Operational access control</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Control who can view or operate facilities, lines, and stations.</p>
        </div>
        <button type="button" onClick={onGrant} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"><Plus className="size-4" />Grant Access</button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-[var(--dv-shadow)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="border-b bg-muted/35 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Facility</th><th className="px-4 py-3">Scope</th><th className="px-4 py-3">Access</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y">
              {accessRecords.map((record) => (
                <tr key={record.id} className="text-xs hover:bg-muted/20">
                  <td className="px-4 py-3"><p className="font-semibold text-foreground">{record.userName}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{record.platformRole}</p></td>
                  <td className="px-4 py-3 font-medium">{facilityName(record.facilityId)}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-[10px]"><KeyRound className="size-3 text-primary" />{record.station ?? (record.productionLine === "All Lines" ? record.hall : record.productionLine)}</span></td>
                  <td className="px-4 py-3"><span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase text-primary">{record.accessLevel}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{record.expiryDate || "No expiry"}</td>
                  <td className="px-4 py-3 text-right"><button type="button" onClick={() => onRevoke(record.id)} aria-label={`Revoke access for ${record.userName}`} className="inline-flex size-8 items-center justify-center rounded-md border text-muted-foreground hover:border-destructive/40 hover:text-destructive"><Trash2 className="size-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {accessRecords.length === 0 && <div className="px-4 py-10 text-center text-sm text-muted-foreground">No operational access grants found.</div>}
      </div>
    </div>
  );
}
