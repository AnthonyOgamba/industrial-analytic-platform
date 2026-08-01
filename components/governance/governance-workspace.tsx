"use client";

/**
 * PAGE: Data Governance
 * FEATURE: Presents canonical policy, ownership, classification, retention, and compliance views.
 * PERMISSION: Navigation and mutations use effective claims; the service remains authoritative.
 * ERROR: Unavailable contracts render explicit states rather than fabricated persistence.
 */

import Link from "next/link";

import { PoliciesStandards } from "./policies-standards";

export function GovernanceWorkspace() {
  return (
    <div className="space-y-5 pb-4">
      <header>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Governance Command Center</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight">Data Governance</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Facility-scoped policy registry, retention rules, and retirement controls.</p>
      </header>

      <PoliciesStandards />
      <Link href="/audit?source=governance" className="inline-flex h-9 items-center rounded-lg border px-3 text-xs font-semibold">View governance activity in Audit Log</Link>
    </div>
  );
}
