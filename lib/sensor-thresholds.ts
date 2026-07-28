export type SensorThresholds = Record<string, number>;

export function normalizeSensorThresholds(payload: unknown): SensorThresholds {
  if (payload === null || payload === undefined) return {};
  if (typeof payload === "string") {
    try {
      return normalizeSensorThresholds(JSON.parse(payload));
    } catch {
      return {};
    }
  }
  if (Array.isArray(payload)) {
    const result: SensorThresholds = {};
    for (const entry of payload) {
      if (!entry || typeof entry !== "object") continue;
      const record = entry as Record<string, unknown>;
      const key = String(record.name ?? record.key ?? record.level ?? "").trim();
      const value = Number(record.value);
      if (key && Number.isFinite(value)) result[key] = value;
    }
    return result;
  }
  if (typeof payload !== "object") return {};
  const record = payload as Record<string, unknown>;
  for (const key of ["thresholds", "values", "data"]) {
    if (key in record) {
      const nested = normalizeSensorThresholds(record[key]);
      if (Object.keys(nested).length) return nested;
    }
  }
  return Object.fromEntries(
    Object.entries(record)
      .map(([key, value]) => [key, Number(value)] as const)
      .filter(([, value]) => Number.isFinite(value)),
  );
}

export function formatSensorThresholds(payload: unknown): string {
  return Object.entries(normalizeSensorThresholds(payload))
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ") || "Not configured";
}
