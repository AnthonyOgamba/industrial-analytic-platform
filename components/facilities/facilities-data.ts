export type FacilityStatus = "Active" | "Maintenance" | "Standby" | "Inactive";
export type AccessLevel = "View" | "Operate" | "Manage" | "Admin";

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

export type Hall = {
  id: string;
  name: string;
  code: string;
  lines: ProductionLine[];
};

export type Facility = {
  id: string;
  name: string;
  code: string;
  facilityType: "Plant" | "Factory" | "Warehouse" | "Distribution Center" | "Facility";
  company: string;
  manager: string;
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

export type SiteAccess = {
  id: string;
  userName: string;
  platformRole: string;
  operationalRole: string;
  facilityId: string;
  hall: string;
  productionLine: string;
  station?: string;
  accessLevel: AccessLevel;
  effectiveDate: string;
  expiryDate?: string;
  status: "Active" | "Pending" | "Expired";
};

export type OperationalInsight = {
  id: string;
  facility: string;
  line: string;
  message: string;
  priority: "High" | "Medium" | "Low";
  confidence: number;
};

function createStation(lineId: string, index: number, baseline: number): Station {
  const offsets = [3, -4, 1, -8, 5, -2];
  const offset = offsets[index % offsets.length];
  const availability = Math.max(60, Math.min(99, baseline + offset + 5));
  const performance = Math.max(58, Math.min(99, baseline + offset + 2));
  const quality = Math.max(80, Math.min(100, baseline + offset + 9));
  const oee = Math.round((availability * performance * quality) / 10000);

  return {
    id: `${lineId}-station-${index + 1}`,
    name: `Station ${index + 1}`,
    status: oee >= 80 ? "Active" : oee >= 65 ? "Maintenance" : "Inactive",
    oee,
    availability,
    performance,
    quality,
    sensorIds: [`SNS-${lineId.toUpperCase()}-${index + 1}A`, `SNS-${lineId.toUpperCase()}-${index + 1}B`],
    assetIds: [`AST-${lineId.toUpperCase()}-${index + 1}`],
    metricKeys: ["oee", "availability", "performance", "quality"],
    downtimeHours: oee < 70 ? 1.8 : oee < 80 ? 0.7 : 0.2,
  };
}

function createLine(
  id: string,
  name: string,
  oee: number,
  availability: number,
  performance: number,
  quality: number,
  outputPerHour: number,
  stationCount = 4,
): ProductionLine {
  const stations = Array.from({ length: stationCount }, (_, index) => createStation(id, index, oee));
  return {
    id,
    name,
    code: id.toUpperCase(),
    oee,
    availability,
    performance,
    quality,
    outputPerHour,
    sensorCount: stations.reduce((total, station) => total + station.sensorIds.length, 0),
    assetCount: stations.reduce((total, station) => total + station.assetIds.length, 0),
    downtimeHours: stations.reduce((total, station) => total + station.downtimeHours, 0),
    stations,
  };
}

export const initialFacilities: Facility[] = [
  {
    id: "site-detroit",
    name: "Detroit Assembly Plant",
    code: "DET-01",
    facilityType: "Plant",
    company: "DIVU Manufacturing NA",
    manager: "Carlos Rivera",
    status: "Active",
    location: { city: "Detroit", region: "North America", country: "USA" },
    timezone: "America/Detroit",
    shiftPattern: "3-shift",
    capacityPerDay: "8,500 units",
    sensorCount: 48,
    assetCount: 124,
    complianceScore: 94,
    lastActivity: "2 minutes ago",
    halls: [
      { id: "det-hall-a", code: "DET-HA", name: "Hall A — Body Shop", lines: [createLine("det-line-a", "Line A", 87, 94, 93, 100, 1420), createLine("det-line-b", "Line B", 81, 90, 91, 98, 1310)] },
      { id: "det-hall-b", code: "DET-HB", name: "Hall B — Paint Shop", lines: [createLine("det-line-c", "Line C", 79, 88, 90, 100, 1280), createLine("det-line-d", "Line D", 84, 92, 92, 99, 1360)] },
      { id: "det-hall-c", code: "DET-HC", name: "Hall C — General Assembly", lines: [createLine("det-line-e", "Line E", 91, 97, 95, 99, 1490), createLine("det-line-f", "Line F", 76, 85, 90, 99, 1210)] },
    ],
  },
  {
    id: "site-stuttgart",
    name: "Stuttgart Manufacturing Hub",
    code: "STU-02",
    facilityType: "Factory",
    company: "DIVU Manufacturing EU",
    manager: "Anna Müller",
    status: "Active",
    location: { city: "Stuttgart", region: "Europe", country: "Germany" },
    timezone: "Europe/Berlin",
    shiftPattern: "2-shift",
    capacityPerDay: "6,200 units",
    sensorCount: 36,
    assetCount: 89,
    complianceScore: 97,
    lastActivity: "6 minutes ago",
    halls: [
      { id: "stu-hall-1", code: "STU-H1", name: "Hall 1 — Stamping", lines: [createLine("stu-line-1", "Line 1", 91, 97, 95, 99, 1490), createLine("stu-line-2", "Line 2", 88, 95, 93, 100, 1410)] },
      { id: "stu-hall-2", code: "STU-H2", name: "Hall 2 — Welding", lines: [createLine("stu-line-3", "Line 3", 85, 93, 92, 99, 1370)] },
    ],
  },
  {
    id: "site-osaka",
    name: "Osaka Production Site",
    code: "OSA-03",
    facilityType: "Facility",
    company: "DIVU Asia KK",
    manager: "Hiro Tanaka",
    status: "Maintenance",
    location: { city: "Osaka", region: "Asia Pacific", country: "Japan" },
    timezone: "Asia/Tokyo",
    shiftPattern: "Continuous",
    capacityPerDay: "4,800 units",
    sensorCount: 29,
    assetCount: 72,
    complianceScore: 86,
    lastActivity: "18 minutes ago",
    halls: [
      { id: "osa-hall-a", code: "OSA-HA", name: "Hall A — Precision Machining", lines: [createLine("osa-line-alpha", "Line α", 72, 82, 89, 98, 980), createLine("osa-line-beta", "Line β", 83, 91, 93, 99, 1190)] },
    ],
  },
];

export const initialSiteAccess: SiteAccess[] = [
  { id: "access-1", userName: "Carlos Rivera", platformRole: "Plant Manager", operationalRole: "Site Administrator", facilityId: "site-detroit", hall: "All Halls", productionLine: "All Lines", accessLevel: "Admin", effectiveDate: "2026-05-14", status: "Active" },
  { id: "access-2", userName: "Anna Müller", platformRole: "Plant Manager", operationalRole: "Site Administrator", facilityId: "site-stuttgart", hall: "All Halls", productionLine: "All Lines", accessLevel: "Admin", effectiveDate: "2026-05-29", status: "Active" },
  { id: "access-3", userName: "John Smith", platformRole: "Viewer", operationalRole: "Line Observer", facilityId: "site-detroit", hall: "Hall A — Body Shop", productionLine: "Line A", accessLevel: "View", effectiveDate: "2026-06-13", status: "Active" },
  { id: "access-4", userName: "Mike Davis", platformRole: "Operator", operationalRole: "Process Operator", facilityId: "site-stuttgart", hall: "Hall 1 — Stamping", productionLine: "Line 1", station: "Station 2", accessLevel: "Operate", effectiveDate: "2026-07-12", status: "Active" },
];

export const operationalInsights: OperationalInsight[] = [
  { id: "insight-1", facility: "Detroit Assembly Plant", line: "Line F", message: "Availability is trending below the 90% operating target across two stations.", priority: "High", confidence: 92 },
  { id: "insight-2", facility: "Osaka Production Site", line: "Line α", message: "Vibration pattern differs from the recent baseline and warrants inspection.", priority: "Medium", confidence: 85 },
  { id: "insight-3", facility: "Stuttgart Manufacturing Hub", line: "Line 1", message: "Output is tracking 6.4% above the current shift plan.", priority: "Low", confidence: 89 },
];
