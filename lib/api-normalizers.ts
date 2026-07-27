import type {
  AiAlert,
  ApprovalDto,
  BackendUserDto,
  CanonicalAssetDto,
  CanonicalDowntimeDto,
  CanonicalNotificationDto,
  CanonicalSensorDto,
} from "@/lib/backend-dtos";

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

export const normalizeNotifications = (payload: unknown) =>
  normalizeArrayResponse<CanonicalNotificationDto>(payload, ["notifications"], "notifications");
export const normalizeApprovals = (payload: unknown) =>
  normalizeArrayResponse<ApprovalDto>(payload, ["approvals"], "approvals");
export const normalizeAssets = (payload: unknown) =>
  normalizeArrayResponse<CanonicalAssetDto>(payload, ["assets"], "assets");
export const normalizeSensors = (payload: unknown) =>
  normalizeArrayResponse<CanonicalSensorDto>(payload, ["sensors"], "sensors");
export const normalizeDowntimeEvents = (payload: unknown) =>
  normalizeArrayResponse<CanonicalDowntimeDto>(payload, ["events", "downtime"], "downtime events");
export const normalizeUsers = (payload: unknown) =>
  normalizeArrayResponse<BackendUserDto>(payload, ["users"], "users");
export const normalizeAlerts = (payload: unknown) =>
  normalizeArrayResponse<AiAlert>(payload, ["alerts"], "alerts");
