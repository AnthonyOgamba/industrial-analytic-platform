"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { apiAuditEvents, type ApiAuditEvent } from "./api-audit-log-data";
import { ApiAuditLogStats } from "./api-audit-log-stats";
import { ApiAuditLogFilters, type AuditFilters } from "./api-audit-log-filters";
import { ApiAuditLogTable } from "./api-audit-log-table";
import { ApiAuditLogDetailModal } from "./api-audit-log-detail-modal";

const initialFilters: AuditFilters = { query: "", type: "All events", severity: "All severities", client: "All clients", actor: "All actors", environment: "All environments", date: "Last 7 days" };
export function ApiAuditLogPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [selected, setSelected] = useState<ApiAuditEvent>();
  const events = useMemo(() => apiAuditEvents.filter((event) => { const haystack = [event.client,event.clientId,event.actor,event.type,event.ipAddress,event.tokenSuffix,event.id].join(" ").toLowerCase(); const query = filters.query.trim().toLowerCase(); return (!query || haystack.includes(query)) && (filters.type === "All events" || event.type === filters.type) && (filters.severity === "All severities" || event.severity === filters.severity) && (filters.client === "All clients" || event.client === filters.client) && (filters.actor === "All actors" || event.actor === filters.actor) && (filters.environment === "All environments" || event.environment === filters.environment); }), [filters]);
  return <div className="space-y-4 pb-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><Link href="/api-security" className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"><ArrowLeft className="size-3.5" />API Security</Link><h1 className="text-2xl font-bold tracking-tight">API Audit Log</h1><p className="mt-1 text-sm text-muted-foreground">Token, client, scope, IP whitelist, and API access history</p></div><span className="rounded-lg border bg-card px-3 py-2 font-mono text-[10px] text-muted-foreground">Read-only · Mock data</span></header><ApiAuditLogStats events={apiAuditEvents} /><ApiAuditLogFilters filters={filters} onChange={setFilters} count={events.length} /><ApiAuditLogTable events={events} onSelect={setSelected} />{selected && <ApiAuditLogDetailModal event={selected} onClose={() => setSelected(undefined)} />}</div>;
}
