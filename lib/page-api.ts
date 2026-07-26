"use client";

import { apiRequest } from "@/lib/api-client";
import type { PagedEnvelope } from "@/lib/backend-dtos";

export type PagedFilters = {
  fromUtc?:string;
  toUtc?:string;
  facilityId?:number;
  action?:string;
  source?:string;
  page?:number;
  pageSize?:number;
};

function query(filters:PagedFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

export type ReportListItem = { reportId:string;reportType:string;filters:Record<string,unknown>;rowCount:number;generatedAtUtc:string;generatedBy:string;facilityId?:number|null;facility?:string|null };
export type ActivityListItem = { activityId:number;action:string;resource:string;username:string;occurredAtUtc:string;oldValues:unknown|null;newValues:unknown|null;facilityId?:number|null;facility?:string|null };

export const pageApi = {
  reports:(filters:PagedFilters) => apiRequest<PagedEnvelope<ReportListItem>>(`/api/backend/reports?${query(filters)}`),
  activity:(filters:PagedFilters) => apiRequest<PagedEnvelope<ActivityListItem>>(`/api/backend/activity?${query(filters)}`),
};
