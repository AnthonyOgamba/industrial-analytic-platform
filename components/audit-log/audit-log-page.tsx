"use client";

import { Download, Filter, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api-client";
import type { AuditRecordDto, PagedEnvelope } from "@/lib/backend-dtos";
import { useFacilityHierarchy } from "@/lib/facility-hierarchy";

import { AuditEventDetailModal, AuditEventRow } from "./audit-event";
import type { AuditEvent } from "./audit-log-data";

function displayValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object")
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => {
        const label = key
          .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
          .replace(/[._-]+/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase());
        return `${label}: ${String(item)}`;
      })
      .join(" · ");
  return String(value);
}

function mapRecord(record: AuditRecordDto): AuditEvent {
  const timestamp = record.occurredAtUtc ?? record.loggedAt ?? "";
  const date = new Date(timestamp);
  const source = record.resource ?? record.tableAffected ?? "Audit";
  const resource = source
    .replaceAll("_", " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
  return {
    id: String(record.auditId),
    user: record.username,
    role: "Not provided",
    action: record.action,
    resource,
    source,
    detail:
      displayValue(record.newValues) ||
      displayValue(record.oldValues) ||
      "No change details supplied.",
    status: "Success",
    timestamp: Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString(),
    relativeTime: Number.isNaN(date.getTime())
      ? "Unknown"
      : date.toLocaleDateString(),
    ip: "Not provided",
    site: record.facility ?? "Global",
    sessionId: "Not provided",
  };
}

function Select({
  value,
  onChange,
  children,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 rounded-lg border bg-card px-3 text-[11px] outline-none focus:ring-2 focus:ring-ring"
    >
      {children}
    </select>
  );
}

export function AuditLogPage() {
  const hierarchy = useFacilityHierarchy();
  const [records, setRecords] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [user, setUser] = useState("All Users");
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("All Resources");
  const [facilityId, setFacilityId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "50",
      });
      if (facilityId) params.set("facilityId", facilityId);
      if (action) params.set("action", action);
      if (from)
        params.set("fromUtc", new Date(`${from}T00:00:00`).toISOString());
      if (to) params.set("toUtc", new Date(`${to}T23:59:59.999`).toISOString());
      const data = await apiRequest<PagedEnvelope<AuditRecordDto>>(
        `/api/backend/audit?${params}`,
      );
      setRecords(data.items.map(mapRecord));
      setPageInfo({
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Audit events could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [action, facilityId, from, page, to]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  const users = useMemo(
    () => [...new Set(records.map((event) => event.user))],
    [records],
  );
  const actions = useMemo(
    () => [...new Set(records.map((event) => event.action))],
    [records],
  );
  const resources = useMemo(
    () => [...new Set(records.map((event) => event.resource))],
    [records],
  );
  const filtered = useMemo(() => {
    const value = query.toLowerCase().trim();
    return records.filter(
      (event) =>
        (!value ||
          [event.user, event.action, event.resource, event.detail, event.source]
            .join(" ")
            .toLowerCase()
            .includes(value)) &&
        (user === "All Users" || event.user === user) &&
        (resource === "All Resources" || event.resource === resource),
    );
  }, [query, records, resource, user]);
  const stats = useMemo(
    () => ({
      Total: pageInfo.total,
      Success: pageInfo.total,
      Warning: 0,
      Failed: 0,
      Blocked: 0,
    }),
    [pageInfo.total],
  );
  function exportCsv() {
    const rows = [
      ["Event ID", "Timestamp", "User", "Action", "Resource", "Details"],
      ...filtered.map((event) => [
        event.id,
        event.timestamp,
        event.user,
        event.action,
        event.resource,
        event.detail,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "divu-audit-current-view.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="space-y-4 pb-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Audit & Approval History
            </h1>
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-mono text-[8px] uppercase text-emerald-600">
              Live gateway data
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Facility-scoped audit records with protected values
            preserved.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold disabled:opacity-40"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            disabled={!filtered.length}
            title="Client-side export of the current fetched view"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white disabled:opacity-40"
          >
            <Download className="size-3.5" />
            Export current view
          </button>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {(["Total", "Success", "Warning", "Failed", "Blocked"] as const).map(
          (key) => (
            <div key={key} className="rounded-xl border bg-card p-4">
              <strong className="text-lg">{stats[key]}</strong>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {key} events
              </p>
            </div>
          ),
        )}
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive"
        >
          {error}
          <button onClick={() => void load()} className="ml-3 underline">
            Retry
          </button>
        </div>
      )}
      <section className="flex flex-col gap-2 rounded-xl border bg-card p-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border bg-muted/20 px-3">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search current page…"
              className="min-w-0 flex-1 bg-transparent text-[11px] outline-none"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
          <Select
            label="Filter by facility"
            value={facilityId}
            onChange={(value) => {
              setFacilityId(value);
              setPage(1);
            }}
          >
            <option value="">All Facilities</option>
            {(hierarchy.data?.facilities ?? []).map((item) => (
              <option key={item.facilityId} value={item.facilityId}>
                {item.name}
              </option>
            ))}
          </Select>
          <input
            aria-label="Audit start date"
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border bg-card px-3 text-[11px]"
          />
          <input
            aria-label="Audit end date"
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border bg-card px-3 text-[11px]"
          />
          <Select label="Filter by user" value={user} onChange={setUser}>
            <option>All Users</option>
            {users.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
          <Select
            label="Filter by action"
            value={action}
            onChange={(value) => {
              setAction(value);
              setPage(1);
            }}
          >
            <option value="">All Actions</option>
            {actions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
          <Select
            label="Filter by resource"
            value={resource}
            onChange={setResource}
          >
            <option>All Resources</option>
            {resources.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </div>
      </section>
      <section className="overflow-hidden rounded-xl border bg-card">
        <header className="flex justify-between bg-muted/50 px-4 py-3 font-mono text-[9px] uppercase text-muted-foreground">
          <span>Recorded platform activity · newest first</span>
          <span>{pageInfo.total} results</span>
        </header>
        {loading ? (
          <div
            role="status"
            className="m-4 h-40 animate-pulse rounded-lg bg-muted"
          />
        ) : filtered.length ? (
          filtered.map((event) => (
            <AuditEventRow
              key={event.id}
              event={event}
              onSelect={setSelected}
            />
          ))
        ) : (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No audit events match the current view.
          </p>
        )}
        <footer className="flex items-center justify-between border-t p-3 text-xs">
          <button
            type="button"
            disabled={pageInfo.page <= 1 || loading}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="rounded-lg border px-3 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {pageInfo.page} of {Math.max(1, pageInfo.totalPages)}
          </span>
          <button
            type="button"
            disabled={pageInfo.page >= pageInfo.totalPages || loading}
            onClick={() => setPage((value) => value + 1)}
            className="rounded-lg border px-3 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </footer>
      </section>
      {selected && (
        <AuditEventDetailModal
          event={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
