import type {
  AiAlert,
  ApprovalDto,
  BackendUserDto,
  CanonicalAssetDto,
  CanonicalDowntimeDto,
  CanonicalNotificationDto,
  CanonicalSensorDto,
} from "@/lib/backend-dtos";
import { normalizeSensorThresholds } from "@/lib/sensor-thresholds";

const COMMON_KEYS = ["items", "data", "results", "records", "value"] as const;
const CONTAINER_KEYS = ["data", "result", "payload"] as const;

function warnUnexpected(label: string, payload: unknown) {
  if (process.env.NODE_ENV !== "production") {
    const shape =
      payload === null ? "null" : Array.isArray(payload) ? "array" : typeof payload;
    console.warn(`Unexpected ${label} response shape (${shape}); using an empty collection.`);
  }
}

export function normalizeArrayResponse<T>(
  payload: unknown,
  candidateKeys: string[] = [],
  label = "collection",
): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") {
    warnUnexpected(label, payload);
    return [];
  }

  const keys = [...candidateKeys, ...COMMON_KEYS];
  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }

  for (const containerKey of CONTAINER_KEYS) {
    const nested = record[containerKey];
    if (!nested || typeof nested !== "object" || Array.isArray(nested)) continue;
    const nestedRecord = nested as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(nestedRecord[key])) return nestedRecord[key] as T[];
    }
  }

  warnUnexpected(label, payload);
  return [];
}

export type NormalizedCollection<T> = {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
};

export function normalizeCollection<T>(
  payload: unknown,
  candidateKeys: string[] = [],
  label = "collection",
): NormalizedCollection<T> {
  const items = normalizeArrayResponse<T>(payload, candidateKeys, label);
  const record = payload && typeof payload === "object" && !Array.isArray(payload)
    ? payload as Record<string, unknown>
    : {};
  const numeric = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;
  return {
    items,
    total: numeric(record.total) ?? numeric(record.count) ?? items.length,
    page: numeric(record.page),
    pageSize: numeric(record.pageSize) ?? numeric(record.page_size),
  };
}

export const normalizeNotifications = (payload: unknown): CanonicalNotificationDto[] =>
  normalizeArrayResponse<Record<string, unknown>>(payload, ["notifications"], "notifications")
    .map((item) => ({
      notificationId: Number(item.notificationId ?? item.notification_id),
      notificationType: String(item.notificationType ?? item.notification_type ?? "activity"),
      title: String(item.title ?? ""),
      message: String(item.message ?? ""),
      recipientUserId: Number(item.recipientUserId ?? item.recipient_user_id),
      actorUserId: item.actorUserId == null && item.actor_user_id == null
        ? null
        : Number(item.actorUserId ?? item.actor_user_id),
      actorUsername: typeof (item.actorUsername ?? item.actor_username) === "string"
        ? String(item.actorUsername ?? item.actor_username)
        : null,
      targetType: typeof (item.targetType ?? item.target_type ?? item.resource_type) === "string"
        ? String(item.targetType ?? item.target_type ?? item.resource_type)
        : null,
      targetId: item.targetId == null && item.target_id == null && item.resource_id == null
        ? null
        : String(item.targetId ?? item.target_id ?? item.resource_id),
      facilityId: item.facilityId == null && item.facility_id == null
        ? null
        : Number(item.facilityId ?? item.facility_id),
      action: typeof item.action === "string" ? item.action : null,
      severity: String(item.severity ?? "info"),
      route: typeof item.route === "string" ? item.route : null,
      correlationId: typeof (item.correlationId ?? item.correlation_id) === "string"
        ? String(item.correlationId ?? item.correlation_id)
        : null,
      createdAtUtc: String(item.createdAtUtc ?? item.created_at_utc ?? ""),
      readAtUtc: typeof (item.readAtUtc ?? item.read_at_utc) === "string"
        ? String(item.readAtUtc ?? item.read_at_utc)
        : null,
    }))
    .filter((item) => Number.isFinite(item.notificationId));
export const normalizeApprovals = (payload: unknown) =>
  normalizeArrayResponse<ApprovalDto>(payload, ["approvals"], "approvals");
export const normalizeAssets = (payload: unknown) =>
  normalizeArrayResponse<CanonicalAssetDto>(payload, ["assets"], "assets");
export const normalizeSensors = (payload: unknown) =>
  normalizeArrayResponse<CanonicalSensorDto>(payload, ["sensors"], "sensors").map((sensor) => ({
    ...sensor,
    thresholds: normalizeSensorThresholds(sensor.thresholds),
  }));
export const normalizeDowntimeEvents = (payload: unknown) =>
  normalizeArrayResponse<CanonicalDowntimeDto>(payload, ["events", "downtime"], "downtime events");
export const normalizeUsers = (payload: unknown) =>
  normalizeArrayResponse<BackendUserDto>(payload, ["users"], "users");
export const normalizeAlerts = (payload: unknown) =>
  normalizeArrayResponse<AiAlert>(payload, ["alerts"], "alerts");
