"use client";

/**
 * PAGE: Security Operations
 * FEATURE: Loads persisted security events and capability-specific operational panels.
 * SECURITY: Sensitive records and actions remain permission and facility scoped.
 * ERROR: Missing service contracts are reported without fabricating security records.
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  FileSearch,
  Filter,
  LockKeyhole,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import { apiRequest } from "@/lib/api-client";
import type { PagedEnvelope, SecurityEventDto } from "@/lib/backend-dtos";
import { useFacilityHierarchy } from "@/lib/facility-hierarchy";
import { pageRequest } from "@/lib/page-request";
import type { ApiGatewayPageContract } from "@/lib/page-contracts";

type Tab =
  | "overview"
  | "threats"
  | "api-gateway"
  | "authentication"
  | "sessions"
  | "blocked"
  | "ingestion";
const tabs: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "threats", label: "Threats & Alerts" },
  { id: "api-gateway", label: "API Gateway" },
  { id: "authentication", label: "Authentication" },
  { id: "ingestion", label: "Data Ingestion Security" },
  { id: "sessions", label: "Active Sessions" },
  { id: "blocked", label: "Blocked Clients" },
];
const unsupported: Record<
  Exclude<Tab, "overview" | "threats" | "api-gateway" | "authentication" | "ingestion">,
  { title: string; message: string }
> = {
  sessions: {
    title: "Active sessions unavailable",
    message:
      "Active-session inventory and session revocation are not currently available.",
  },
  blocked: {
    title: "Blocked clients unavailable",
    message:
      "Blocked-client inventory and unblock controls are not currently available.",
  },
};

function GatewayPanel() {
  const [data,setData]=useState<ApiGatewayPageContract|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const load=useCallback(async()=>{setLoading(true);try{setData(await pageRequest<ApiGatewayPageContract>("apiGateway"));setError("")}catch(cause){setData(null);setError(cause instanceof Error?cause.message:"Gateway status could not be loaded.")}finally{setLoading(false)}},[]);
  useEffect(()=>{// eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  },[load]);
  if(loading)return <div className="h-52 animate-pulse rounded-xl bg-muted"/>;
  if(error)return <section className="rounded-xl border border-destructive/30 bg-destructive/10 p-5"><p role="alert" className="text-xs text-destructive">{error}</p><button type="button" onClick={()=>void load()} className="mt-3 h-9 rounded-lg border px-3 text-xs font-semibold">Retry</button></section>;
  if(!data)return null;
  const metric=(value:number|null)=>value===null?"Unavailable":value.toLocaleString();
  return <div className="space-y-4"><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
    ["Service",data.service.status],
    ["Environment",data.service.environment??"Not reported"],
    ["Authentication",data.service.authenticationStatus],
    ["Rate limiting",data.service.rateLimitStatus??"Unavailable"],
  ].map(([label,value])=><article key={label} className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-mono text-sm font-semibold capitalize">{value}</p></article>)}</section><section className="rounded-xl border bg-card p-5"><h2 className="font-semibold">Routing</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">{data.routing.summary}</p></section><section className="rounded-xl border bg-card p-5"><h2 className="font-semibold">Recent requests</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{[["Total",data.recentRequests.total],["Successful",data.recentRequests.successful],["Failed",data.recentRequests.failed]].map(([label,value])=><div key={String(label)} className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold">{metric(value as number|null)}</p></div>)}</div></section>{data.warnings.map(warning=><p key={warning} className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700">{warning}</p>)}</div>;
}

function EventTable({ items }: { items: SecurityEventDto[] }) {
  function userFacingLabel(status: string): import("react").ReactNode {
    return status
      .split(/(?=[A-Z])|_/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[70rem] text-left text-xs">
          <caption className="sr-only">Persisted security events</caption>
          <thead className="bg-muted/40 font-mono text-xs uppercase text-muted-foreground">
            <tr>
              {[
                "ID",
                "Event",
                "Description",
                "Severity",
                "Status",
                "Source",
                "Occurred",
              ].map((item) => (
                <th scope="col" key={item} className="px-3 py-3">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.securityEventId} className="border-t">
                <td className="px-4 py-4 font-mono">#{item.securityEventId}</td>
                <td className="px-4 py-4 font-semibold">{userFacingLabel(item.eventType)}</td>
                <td className="max-w-md px-4 py-4 leading-5 text-muted-foreground">
                  {item.description}
                </td>
                <td className="px-4 py-4">{userFacingLabel(item.severity)}</td>
                <td className="px-4 py-4">{userFacingLabel(item.status)}</td>
                <td className="px-4 py-4">{item.source}</td>
                <td className="px-4 py-4">
                  {new Date(item.occurredAtUtc).toLocaleString()}
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td
                  colSpan={7}
                  className="p-12 text-center text-muted-foreground"
                >
                  No persisted security events match this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SecurityOperationsPage() {
  const search = useSearchParams();
  const requested = search.get("tab") as Tab | null;
  const hierarchy = useFacilityHierarchy();
  const [tab, setTab] = useState<Tab>(
    tabs.some((item) => item.id === requested) ? requested! : "overview",
  );
  const [facilityId, setFacilityId] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState<PagedEnvelope<SecurityEventDto>>({
    items: [],
    page: 1,
    pageSize: 200,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: "1", pageSize: "200" });
      if (facilityId) query.set("facilityId", facilityId);
      if (severity) query.set("severity", severity);
      if (status) query.set("status", status);
      setData(await apiRequest(`/api/backend/security-events?${query}`));
      setError("");
    } catch (cause) {
      setData({ items: [], page: 1, pageSize: 200, total: 0, totalPages: 0 });
      setError(
        cause instanceof Error
          ? cause.message
          : "Security events could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [facilityId, severity, status]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  const counts = useMemo(
    () => ({
      critical: data.items.filter(
        (item) => item.severity.toLowerCase() === "critical",
      ).length,
      open: data.items.filter(
        (item) => !["resolved", "closed"].includes(item.status.toLowerCase()),
      ).length,
      facilities: new Set(
        data.items.map((item) => item.facilityId).filter(Boolean),
      ).size,
    }),
    [data.items],
  );
  const authEvents = data.items.filter((item) =>
    /auth|login|password|passcode/i.test(
      `${item.eventType} ${item.description}`,
    ),
  );
  const ingestionEvents = data.items.filter((item) =>
    /ingest|ingestion|pipeline|kafka|s3|connector/i.test(
      `${item.eventType} ${item.description} ${item.source}`,
    ),
  );
  const threats = data.items.filter((item) =>
    ["critical", "high"].includes(item.severity.toLowerCase()),
  );
  const content =
    tab === "overview" ? (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Persisted events", value: data.total, icon: ShieldAlert },
            { label: "Open events", value: counts.open, icon: AlertTriangle },
            {
              label: "Critical events",
              value: counts.critical,
              icon: LockKeyhole,
            },
            {
              label: "Affected facilities",
              value: counts.facilities,
              icon: FileSearch,
            },
          ].map(({ icon: Icon, ...item }) => (
            <article key={item.label} className="rounded-xl border bg-card p-4">
              <Icon className="size-4 text-primary" />
              <p className="mt-3 text-xl font-bold">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.label}
              </p>
            </article>
          ))}
        </div>
        <EventTable items={data.items.slice(0, 10)} />
        <Link
          href="/audit?source=security"
          className="inline-flex h-9 items-center rounded-lg border px-3 text-xs font-semibold"
        >
          View Audit & Approvals
        </Link>
      </div>
    ) : tab === "threats" ? (
      <EventTable items={threats} />
    ) : tab === "authentication" ? (
      <EventTable items={authEvents} />
    ) : tab === "ingestion" ? (
      <div className="space-y-3">
        <p className="rounded-lg border bg-card px-4 py-3 text-xs text-muted-foreground">
          Data-ingestion security events recorded by the canonical security
          event stream.
        </p>
        <EventTable items={ingestionEvents} />
      </div>
    ) : tab === "api-gateway" ? (
      <GatewayPanel />
    ) : (
      <section className="rounded-xl border border-dashed bg-muted/20 p-10 text-center">
        <ShieldAlert className="mx-auto size-8 text-muted-foreground" />
        <h2 className="mt-3 font-semibold">{unsupported[tab].title}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">
          {unsupported[tab].message}
        </p>
      </section>
    );
  return (
    <div className="space-y-5 pb-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Security Operations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Persisted security events and platform capability status
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </header>
      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertTriangle className="size-4" />
          {error}
        </p>
      )}
      <section className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <Filter className="size-4 text-muted-foreground" />
        <select
          aria-label="Facility"
          value={facilityId}
          onChange={(event) => setFacilityId(event.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs"
        >
          <option value="">All Facilities</option>
          {(hierarchy.data?.facilities ?? []).map((item) => (
            <option key={item.facilityId} value={item.facilityId}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Severity"
          value={severity}
          onChange={(event) => setSeverity(event.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs"
        >
          <option value="">All Severities</option>
          {["critical", "high", "medium", "low", "info"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          aria-label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs"
        >
          <option value="">All Statuses</option>
          {["new", "investigating", "acknowledged", "resolved"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>
      <nav
        className="overflow-x-auto border-b"
        role="tablist"
        aria-label="Security operations sections"
      >
        <div className="flex min-w-max gap-2 px-2">
          {tabs.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`h-12 border-b-2 px-5 text-xs font-medium ${tab === item.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
      <div role="tabpanel">
        {loading ? (
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        ) : (
          content
        )}
      </div>
    </div>
  );
}
