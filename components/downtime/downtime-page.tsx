"use client";
/* eslint-disable react-hooks/purity */

// FEATURE: Downtime creation and financial impact
// PAGE: /downtime joins incidents to facilities, assets, optional sensors, runs, and technicians.
// API: GET/POST /api/backend/downtime/events plus canonical lookup endpoints.
// SECURITY: Creation and sensitive row actions are controlled by effective capabilities.

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  Clock3,
  DollarSign,
  Plus,
  RefreshCw,
  Timer,
  X,
} from "lucide-react";

import { apiRequest } from "@/lib/api-client";
import { createAccessChecks } from "@/lib/access-policy";
import type {
  CanonicalAssetDto,
  CanonicalDowntimeDto,
  CanonicalSensorDto,
  BackendUserDto,
  DowntimeWriteDto,
  ProductionRun,
} from "@/lib/backend-dtos";
import { useSessionUser } from "@/lib/session-user";
import {
  normalizeArrayResponse,
  normalizeAssets,
  normalizeDowntimeEvents,
  normalizeSensors,
  normalizeUsers,
} from "@/lib/api-normalizers";

const field =
  "mt-1 h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50";
const reasons = [
  "machine_failure",
  "emergency_stop",
  "conveyor_jam",
  "calibration_error",
  "inventory_shortage",
  "machine_adjustment",
];

function DowntimeForm({
  assets,
  sensors,
  runs,
  users,
  onClose,
  onCreated,
}: {
  assets: CanonicalAssetDto[];
  sensors: CanonicalSensorDto[];
  runs: ProductionRun[];
  users: BackendUserDto[];
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    assetId: "",
    sensorId: "",
    productionId: "",
    startUtc: new Date().toISOString().slice(0, 16),
    endUtc: "",
    plannedType: "unplanned",
    reasonCode: "machine_failure",
    severity: "medium",
    detectionSource: "manual",
    productionLoss: "0",
    repairCost: "0",
    correctiveAction: "",
    status: "active",
    description: "",
    assignedTechnicianUserId: "",
    repairStatus: "not_repaired",
    repairNotes: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const asset = assets.find((item) => item.asset_id === Number(form.assetId));
  const availableSensors = sensors.filter(
    (item) => item.asset_id === asset?.asset_id,
  );
  const availableRuns = runs.filter(
    (item) => item.stationId === asset?.station_id,
  );
  function change(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  // HANDLER: Create Downtime
  // API: POST /api/backend/downtime/events with canonical hierarchy and asset relationships.
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!asset || !form.productionId) return;
    const body: DowntimeWriteDto = {
      assetId: asset.asset_id,
      sensorId: form.sensorId ? Number(form.sensorId) : null,
      productionId: Number(form.productionId),
      startUtc: new Date(form.startUtc).toISOString(),
      endUtc: form.endUtc ? new Date(form.endUtc).toISOString() : null,
      plannedType: form.plannedType,
      reasonCode: form.reasonCode,
      severity: form.severity,
      detectionSource: form.detectionSource,
      productionLoss: Number(form.productionLoss),
      repairCost: Number(form.repairCost),
      correctiveAction: form.correctiveAction || null,
      status: form.status,
      description: form.description || null,
      source: "manual",
      isSynthetic: false,
      assignedTechnicianUserId: form.assignedTechnicianUserId ? Number(form.assignedTechnicianUserId) : null,
      assignedTechnicianName: users.find((user) => user.uid === Number(form.assignedTechnicianUserId))?.username ?? null,
      repairStatus: form.repairStatus,
      repairNotes: form.repairNotes || null,
    };
    setPending(true);
    setError("");
    try {
      await apiRequest("/api/backend/downtime/events", {
        method: "POST",
        body: JSON.stringify(body),
      });
      await onCreated();
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Downtime creation failed.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-5"
      onMouseDown={(event) =>
        event.target === event.currentTarget && !pending && onClose()
      }
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-downtime-title"
        className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start border-b p-5">
          <div className="flex-1">
            <h2 id="create-downtime-title" className="font-bold">
              Create Downtime Event
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Canonical asset, sensor, and production-run relationship
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Create Downtime Event"
            className="grid size-9 place-items-center rounded-lg border"
          >
            <X className="size-4" />
          </button>
        </header>
        <form
          id="downtime-form"
          onSubmit={submit}
          className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2"
        >
          <label className="text-xs sm:col-span-2">
            Asset
            <select
              required
              value={form.assetId}
              onChange={(event) => {
                change("assetId", event.target.value);
                change("sensorId", "");
                change("productionId", "");
              }}
              className={field}
            >
              <option value="">Select asset</option>
              {assets.map((item) => (
                <option key={item.asset_id} value={item.asset_id}>
                  {item.asset_name} · {item.facility_name} · {item.station_name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Sensor (optional)
            <select
              value={form.sensorId}
              disabled={!asset}
              onChange={(event) => change("sensorId", event.target.value)}
              className={field}
            >
              <option value="">No triggering sensor</option>
              {availableSensors.map((item) => (
                <option key={item.sensor_id} value={item.sensor_id}>
                  {item.sensor_name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Production run
            <select
              required
              value={form.productionId}
              disabled={!asset}
              onChange={(event) => change("productionId", event.target.value)}
              className={field}
            >
              <option value="">Select station production run</option>
              {availableRuns.map((item) => (
                <option key={item.runId} value={item.runId}>
                  Run #{item.runId} · {item.status}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Started at
            <input
              required
              type="datetime-local"
              value={form.startUtc}
              onChange={(event) => change("startUtc", event.target.value)}
              className={field}
            />
          </label>
          <label className="text-xs">
            Ended at (leave empty for active)
            <input
              type="datetime-local"
              value={form.endUtc}
              onChange={(event) => change("endUtc", event.target.value)}
              className={field}
            />
          </label>
          <label className="text-xs">
            Type
            <select
              value={form.plannedType}
              onChange={(event) => change("plannedType", event.target.value)}
              className={field}
            >
              <option value="planned">Planned</option>
              <option value="unplanned">Unplanned</option>
            </select>
          </label>
          <label className="text-xs">
            Reason code
            <select
              value={form.reasonCode}
              onChange={(event) => change("reasonCode", event.target.value)}
              className={field}
            >
              {reasons.map((item) => (
                <option key={item}>{item.replaceAll("_", " ")}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Severity
            <select
              value={form.severity}
              onChange={(event) => change("severity", event.target.value)}
              className={field}
            >
              {["low", "medium", "high", "critical"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Detection source
            <select
              value={form.detectionSource}
              onChange={(event) =>
                change("detectionSource", event.target.value)
              }
              className={field}
            >
              {["manual", "sensor", "olive_ai", "production_system"].map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
          </label>
          <label className="text-xs">
            Production loss units
            <input
              type="number"
              min="0"
              step="any"
              value={form.productionLoss}
              onChange={(event) => change("productionLoss", event.target.value)}
              className={field}
            />
          </label>
          <label className="text-xs">
            Repair cost
            <input
              type="number"
              min="0"
              step=".01"
              value={form.repairCost}
              onChange={(event) => change("repairCost", event.target.value)}
              className={field}
            />
          </label>
          <label className="text-xs">
            Status
            <select
              value={form.status}
              onChange={(event) => change("status", event.target.value)}
              className={field}
            >
              {["active", "resolved", "closed"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Assigned technician
            <select
              value={form.assignedTechnicianUserId}
              onChange={(event) => change("assignedTechnicianUserId", event.target.value)}
              className={field}
            >
              <option value="">Unassigned</option>
              {users.filter((user) => user.status !== "deleted").map((user) => (
                <option key={user.uid} value={user.uid}>{user.username} · {user.email}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Repair status
            <select value={form.repairStatus} onChange={(event) => change("repairStatus", event.target.value)} className={field}>
              {["not_repaired","repair_in_progress","repaired","monitoring","awaiting_parts","escalated","closed"].map((item) => <option key={item}>{item.replaceAll("_", " ")}</option>)}
            </select>
          </label>
          <label className="text-xs sm:col-span-2">
            Repair notes
            <textarea value={form.repairNotes} onChange={(event) => change("repairNotes", event.target.value)} className="mt-1 min-h-20 w-full rounded-lg border bg-background p-3 text-xs" />
          </label>
          <label className="text-xs sm:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(event) => change("description", event.target.value)}
              className="mt-1 min-h-20 w-full rounded-lg border bg-background p-3 text-xs"
            />
          </label>
          <label className="text-xs sm:col-span-2">
            Corrective action
            <textarea
              value={form.correctiveAction}
              onChange={(event) =>
                change("correctiveAction", event.target.value)
              }
              className="mt-1 min-h-20 w-full rounded-lg border bg-background p-3 text-xs"
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive sm:col-span-2"
            >
              {error}
            </p>
          )}
        </form>
        <footer className="flex justify-end gap-2 border-t p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border px-4 text-xs"
          >
            Cancel
          </button>
          <button
            form="downtime-form"
            disabled={pending || !asset || !form.productionId}
            className="h-10 rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
          >
            {pending ? "Creating…" : "Create Event"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export function DowntimePage() {
  const session = useSessionUser();
  const [events, setEvents] = useState<CanonicalDowntimeDto[]>([]);
  const [assets, setAssets] = useState<CanonicalAssetDto[]>([]);
  const [sensors, setSensors] = useState<CanonicalSensorDto[]>([]);
  const [runs, setRuns] = useState<ProductionRun[]>([]);
  const [users, setUsers] = useState<BackendUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const canManage =
    session.user?.capabilities.includes("downtime.create") ?? false;
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [e, a, s, r, u] = await Promise.all([
        apiRequest<unknown>("/api/backend/downtime/events"),
        apiRequest<unknown>("/api/backend/assets"),
        apiRequest<unknown>("/api/backend/sensors/catalog"),
        apiRequest<unknown>("/api/backend/runs"),
        apiRequest<unknown>("/api/backend/users").catch(() => []),
      ]);
      const accessChecks = createAccessChecks(session.user);
      setEvents(normalizeDowntimeEvents(e).filter(
        (item) => typeof item.facilityid === "number" && accessChecks.hasFacilityAccess(item.facilityid),
      ));
      setAssets(normalizeAssets(a).filter(
        (item) => typeof item.facilityid === "number" && accessChecks.hasFacilityAccess(item.facilityid),
      ));
      setSensors(normalizeSensors(s).filter(
        (item) => typeof item.facilityid === "number" && accessChecks.hasFacilityAccess(item.facilityid),
      ));
      setRuns(
        normalizeArrayResponse<ProductionRun>(r, ["runs"], "production runs").filter(
          (item) => accessChecks.hasFacilityAccess(item.facilityId),
        ),
      );
      setUsers(normalizeUsers(u));
    } catch (cause) {
      setEvents([]);
      setAssets([]);
      setSensors([]);
      setRuns([]);
      setUsers([]);
      setError(
        cause instanceof Error
          ? cause.message
          : "Downtime events could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [session.user]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  const active = events.filter(
    (item) => !item.end_utc || item.status === "active",
  );
  const totalMinutes = events.reduce(
    (sum, item) =>
      sum +
      (new Date(item.end_utc ?? Date.now()).getTime() -
        new Date(item.start_utc).getTime()) /
        60000,
    0,
  );
  const loss = events.reduce(
    (sum, item) => sum + Number(item.production_loss || 0),
    0,
  );
  const repair = events.reduce(
    (sum, item) => sum + Number(item.repair_cost || 0),
    0,
  );
  const common = useMemo(() => {
    const counts = new Map<string, number>();
    events.forEach((item) =>
      counts.set(
        item.reason_code ?? "unspecified",
        (counts.get(item.reason_code ?? "unspecified") ?? 0) + 1,
      ),
    );
    return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None";
  }, [events]);
  return (
    <div className="space-y-5 pb-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-primary">
            Operations intelligence
          </p>
          <h1 className="mt-1 text-2xl font-bold">Downtime Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Canonical downtime linked to assets, sensors, production, and
            financial consequences
          </p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="size-4" />
              Create Downtime Event
            </button>
          )}
          <button
            onClick={() => void load()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-xs"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
        </div>
      </header>
      {success && (
        <p
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700"
        >
          {success}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertTriangle className="size-4" />
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {[
          {
            label: "Active downtime",
            value: active.length,
            icon: AlertTriangle,
          },
          {
            label: "Total downtime",
            value: `${(totalMinutes / 60).toFixed(1)}h`,
            icon: Clock3,
          },
          {
            label: "MTTR",
            value: events.length
              ? `${(totalMinutes / events.length).toFixed(0)}m`
              : "—",
            icon: Timer,
          },
          {
            label: "Production loss",
            value: loss.toLocaleString(),
            icon: AlertTriangle,
          },
          {
            label: "Repair cost",
            value: repair.toLocaleString(undefined, {
              style: "currency",
              currency: "CAD",
            }),
            icon: DollarSign,
          },
          {
            label: "Common cause",
            value: common.replaceAll("_", " "),
            icon: AlertTriangle,
          },
        ].map(({ icon: Icon, ...item }) => (
          <article key={item.label} className="rounded-xl border bg-card p-4">
            <Icon className="size-4 text-primary" />
            <p className="mt-3 truncate text-lg font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </article>
        ))}
      </div>
      {loading ? (
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[96rem] text-left text-xs">
              <caption className="sr-only">
                Canonical downtime events, operational loss, repair cost,
                approval, and source
              </caption>
              <thead className="bg-muted/40 font-mono text-xs uppercase text-muted-foreground">
                <tr>
                  {[
                    "Event",
                    "Asset",
                    "Facility / Site",
                    "Sensor",
                    "Started",
                    "Duration",
                    "Type / reason",
                    "Severity",
                    "Status",
                    "Technician",
                    "Repair status",
                    "Detection",
                    "Production loss",
                    "Repair cost",
                    "Approval",
                    "AI recommendation",
                  ].map((item) => (
                    <th scope="col" key={item} className="p-3">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((item) => {
                  const asset = assets.find(
                    (value) => value.asset_id === item.asset_id,
                  );
                  const facilityName =
                    item.facility_name ||
                    asset?.facility_name ||
                    (item.facilityid
                      ? `Facility #${item.facilityid}`
                      : "Not assigned");
                  const sensor = sensors.find(
                    (value) => value.sensor_id === item.sensor_id,
                  );
                  const duration =
                    (new Date(item.end_utc ?? Date.now()).getTime() -
                      new Date(item.start_utc).getTime()) /
                    60000;
                  return (
                    <tr key={item.event_id} className="border-t">
                      <td className="p-3 font-mono">#{item.event_id}</td>
                      <td className="p-3">{item.asset_name}</td>
                      <td className="p-3">
                        <span className="font-semibold">{facilityName}</span>
                        {(item.hall_name || asset?.hall_name) && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {[
                              item.hall_name || asset?.hall_name,
                              item.line_name || asset?.line_name,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </td>
                      <td className="p-3">{sensor?.sensor_name ?? "—"}</td>
                      <td className="p-3">
                        {new Date(item.start_utc).toLocaleString()}
                      </td>
                      <td className="p-3">{duration.toFixed(0)}m</td>
                      <td className="p-3">
                        {item.planned_type}
                        <p className="text-xs">{item.reason_code}</p>
                      </td>
                      <td className="p-3">{item.severity}</td>
                      <td className="p-3">{item.status}</td>
                      <td className="p-3">{item.assigned_technician_name ?? "Unassigned"}</td>
                      <td className="p-3">{item.repair_status?.replaceAll("_", " ") ?? "Not repaired"}</td>
                      <td className="p-3">{item.detection_source}</td>
                      <td className="p-3">
                        {Number(item.production_loss).toLocaleString()}
                      </td>
                      <td className="p-3">
                        {Number(item.repair_cost).toLocaleString(undefined, {
                          style: "currency",
                          currency: "CAD",
                        })}
                      </td>
                      <td className="p-3">{item.approval_state}</td>
                      <td className="p-3 text-muted-foreground">
                        Not returned by canonical event
                      </td>
                    </tr>
                  );
                })}
                {!events.length && (
                  <tr>
                    <td
                      colSpan={16}
                      className="p-12 text-center text-muted-foreground"
                    >
                      No downtime events exist.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {createOpen && (
        <DowntimeForm
          assets={assets}
          sensors={sensors}
          runs={runs}
          users={users}
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            await load();
            setSuccess("Downtime event created successfully.");
          }}
        />
      )}
    </div>
  );
}
