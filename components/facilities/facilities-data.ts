/**
 * Legacy location shape used by asset, sensor, and downtime forms.
 *
 * Production hierarchy records are no longer seeded here. Those screens must
 * load authoritative identifiers through the authenticated hierarchy API.
 */
export type FacilityStatus = "Active" | "Maintenance" | "Standby" | "Inactive";

export type Station = {
  id: string;
  name: string;
  status: FacilityStatus;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  sensorIds: string[];
  assetIds: string[];
  metricKeys: string[];
  downtimeHours: number;
};

export type ProductionLine = {
  id: string;
  name: string;
  code: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  outputPerHour: number;
  sensorCount: number;
  assetCount: number;
  downtimeHours: number;
  stations: Station[];
};

export type Hall = { id: string; name: string; code: string; lines: ProductionLine[] };

export type Facility = {
  id: string;
  name: string;
  code: string;
  facilityType: "Plant" | "Factory" | "Warehouse" | "Distribution Center" | "Facility";
  company: string;
  managerId: string;
  manager: string;
  source: "seeded" | "registered";
  status: FacilityStatus;
  location: { city: string; region: string; country: string };
  timezone: string;
  shiftPattern: string;
  capacityPerDay: string;
  sensorCount: number;
  assetCount: number;
  complianceScore: number;
  lastActivity: string;
  halls: Hall[];
};

// Intentionally empty: production hierarchy is owned by the backend gateway.
export const initialFacilities: Facility[] = [];
