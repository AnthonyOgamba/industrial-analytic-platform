import type { DashboardWorkspaceDto } from "@/lib/backend-dtos";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function list(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(record) : [];
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function normalizeDashboardResponse(raw: unknown): DashboardWorkspaceDto {
  const source = record(raw);
  const summary = record(source.summary);
  const sensorHealth = record(source.sensorHealth);
  const securitySummary = record(source.securitySummary);

  const normalized: DashboardWorkspaceDto = {
    summary: {
      activeRuns: number(summary.activeRuns),
      totalStations: number(summary.totalStations),
      activeFacilities: number(summary.activeFacilities),
      averageOee: number(summary.averageOee),
      openDowntimeEvents: number(summary.openDowntimeEvents),
      openAlerts: number(summary.openAlerts),
      estimatedDowntimeCost: number(summary.estimatedDowntimeCost),
    },
    productionTrend: list(source.productionTrend).map((item) => ({
      timestamp: text(item.timestamp),
      produced: number(item.produced),
      good: number(item.good),
      scrap: number(item.scrap),
      isSynthetic: Boolean(item.isSynthetic),
    })),
    oeeByFacility: list(source.oeeByFacility).map((item) => ({
      facilityId: number(item.facilityId),
      facility: text(item.facility, "Unknown facility"),
      oee: number(item.oee),
      availability: number(item.availability),
      performance: number(item.performance),
      quality: number(item.quality),
    })),
    downtimeTrend: list(source.downtimeTrend).map((item) => ({
      timestamp: text(item.timestamp),
      incidents: number(item.incidents),
      hours: number(item.hours),
    })),
    financialImpact: list(source.financialImpact).map((item) => ({
      facilityId: number(item.facilityId),
      facility: text(item.facility, "Unknown facility"),
      downtimeCost: number(item.downtimeCost),
      lostProductionValue: number(item.lostProductionValue),
      currency: text(item.currency, "CAD"),
    })),
    sensorHealth: {
      total: number(sensorHealth.total),
      active: number(sensorHealth.active),
      fresh: number(sensorHealth.fresh),
      stale: number(sensorHealth.stale),
      latestReadingAtUtc: typeof sensorHealth.latestReadingAtUtc === "string"
        ? sensorHealth.latestReadingAtUtc
        : null,
    },
    securitySummary: {
      failedAuthentication: number(securitySummary.failedAuthentication),
      authorizationFailures: number(securitySummary.authorizationFailures),
      generatorAdministrationActions: number(securitySummary.generatorAdministrationActions),
      integrityAnomalies: number(securitySummary.integrityAnomalies),
    },
    recentRuns: list(source.recentRuns).map((item) => ({
      runId: number(item.runId),
      facilityId: number(item.facilityId),
      facility: text(item.facility),
      stationId: number(item.stationId),
      station: text(item.station),
      status: text(item.status),
      startTime: text(item.startTime),
      endTime: typeof item.endTime === "string" ? item.endTime : null,
      source: text(item.source),
      isSynthetic: Boolean(item.isSynthetic),
    })),
    recentAlerts: list(source.recentAlerts).map((item) => ({
      alertId: number(item.alertId),
      title: text(item.title, "Untitled alert"),
      severity: text(item.severity),
      status: text(item.status),
      resource: text(item.resource),
      createdAt: text(item.createdAt),
    })),
    recentActivity: list(source.recentActivity).map((item) => ({
      auditId: number(item.auditId),
      userId: item.userId === null || item.userId === undefined ? null : number(item.userId),
      action: text(item.action, "UNKNOWN"),
      resource: text(item.resource),
      loggedAt: text(item.loggedAt),
    })),
    generatedAtUtc: text(source.generatedAtUtc, new Date(0).toISOString()),
  };

  if (process.env.NODE_ENV !== "production") {
    const missingArrays = [
      "productionTrend", "oeeByFacility", "downtimeTrend", "financialImpact",
      "recentRuns", "recentAlerts", "recentActivity",
    ].filter((key) => !Array.isArray(source[key]));
    console.info("[Dashboard] normalized response", {
      keys: Object.keys(source),
      missingArrays,
      lengths: {
        productionTrend: normalized.productionTrend.length,
        oeeByFacility: normalized.oeeByFacility.length,
        downtimeTrend: normalized.downtimeTrend.length,
        financialImpact: normalized.financialImpact.length,
        recentRuns: normalized.recentRuns.length,
        recentAlerts: normalized.recentAlerts.length,
        recentActivity: normalized.recentActivity.length,
      },
    });
  }

  return normalized;
}
