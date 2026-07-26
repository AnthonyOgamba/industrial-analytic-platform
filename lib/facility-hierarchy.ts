"use client";

import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api-client";
import type { FacilityWorkspace } from "@/lib/backend-dtos";

type HierarchyState = {
  data: FacilityWorkspace | null;
  error: string;
  loading: boolean;
  version: number;
};

const state: HierarchyState = { data: null, error: "", loading: false, version: 0 };
const listeners = new Set<() => void>();
let pending: Promise<FacilityWorkspace> | null = null;

function emit() {
  state.version += 1;
  listeners.forEach((listener) => listener());
}

export async function refreshFacilityHierarchy() {
  if (pending) return pending;
  state.loading = true;
  state.error = "";
  emit();
  pending = apiRequest<FacilityWorkspace>("/api/backend/facilities/workspace")
    .then((data) => {
      state.data = data;
      return data;
    })
    .catch((cause) => {
      state.error = cause instanceof Error ? cause.message : "Facility hierarchy could not be loaded.";
      throw cause;
    })
    .finally(() => {
      pending = null;
      state.loading = false;
      emit();
    });
  return pending;
}

export function invalidateFacilityHierarchy() {
  state.data = null;
  emit();
  return refreshFacilityHierarchy();
}

type HierarchyStatus = "active" | "inactive" | "maintenance" | "retired";
type HierarchyUpdate = { name:string; code:string|null; status:HierarchyStatus };
type StationUpdate = { name:string; stationCode:string|null; status:HierarchyStatus };

async function updateHierarchy<T>(url:string, body:HierarchyUpdate|StationUpdate) {
  const result = await apiRequest<T>(url, { method:"PATCH", body:JSON.stringify(body) });
  await invalidateFacilityHierarchy();
  return result;
}

export const facilityHierarchyApi = {
  updateFacility:(facilityId:number, body:HierarchyUpdate) => updateHierarchy<{facilityId:number;name:string;code:string|null;status:string;updatedAtUtc:string}>(`/api/backend/facilities/${facilityId}`, body),
  updateHall:(hallId:number, body:HierarchyUpdate) => updateHierarchy<{hallId:number;facilityId:number;name:string;code:string|null;status:string;updatedAtUtc:string}>(`/api/backend/halls/${hallId}`, body),
  updateLine:(lineId:number, body:HierarchyUpdate) => updateHierarchy<{productionLineId:number;hallId:number;name:string;code:string|null;status:string;updatedAtUtc:string}>(`/api/backend/lines/${lineId}`, body),
  updateStation:(stationId:number, body:StationUpdate) => updateHierarchy<{stationId:number;productionLineId:number;name:string;stationCode:string|null;status:string;updatedAtUtc:string}>(`/api/backend/stations/${stationId}`, body),
};

export function useFacilityHierarchy() {
  const [, setVersion] = useState(0);
  useEffect(() => {
    const listener = () => setVersion((value) => value + 1);
    const refreshVisible = () => {
      if (document.visibilityState === "visible") void refreshFacilityHierarchy();
    };
    listeners.add(listener);
    if (!state.data && !state.loading) void refreshFacilityHierarchy();
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    const refreshTimer = window.setInterval(refreshVisible, 30_000);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
      window.clearInterval(refreshTimer);
    };
  }, []);
  const refresh = useCallback(() => refreshFacilityHierarchy(), []);
  return { data: state.data, error: state.error, loading: state.loading, refresh };
}
