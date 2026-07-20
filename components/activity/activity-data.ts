export type ManagerUser = {
  id: string;
  name: string;
  role: string;
};

export type ActivityDecisionType = "approve" | "decline" | "reopen" | "assign";

export type ActivityDecisionHistoryItem = {
  id: string;
  type: ActivityDecisionType;
  actorName: string;
  actorRole?: string;
  timestamp: string; // ISO
  note?: string;
  meta?: Record<string, string>;
};

export type ActivityRequestStatus = "pending" | "approved" | "declined";

export type ActivityType =
  | "delete_product"
  | "delete_sensor"
  | "delete_user"
  | "edit_role"
  | "delete_downtime_factor"
  | "edit_metric";

export type ActivityResourceAffected = {
  title: string;
  details: Record<string, string>;
};

export type ActivityRequest = {
  id: string;
  activityType: ActivityType;
  title: string;

  requestedByName: string;
  requestedByRole: string;

  assignedManagerId: string;
  assignedManagerName: string;

  requestedAt: string; // ISO
  lastUpdatedAt: string; // ISO

  status: ActivityRequestStatus;

  resourceAffected: ActivityResourceAffected;

  requesterNote?: string;

  decisionHistory: ActivityDecisionHistoryItem[];
};

const legacyActivityManagers: ManagerUser[] = [
  { id: "u-admin", name: "Admin User", role: "Administrator" },
  { id: "u-carlos", name: "Carlos Rivera", role: "Plant Manager" },
  { id: "u-sarah", name: "Sarah Johnson", role: "Plant Manager" },
  { id: "u-marcus", name: "Marcus Lee", role: "Plant Manager" },
  { id: "u-anna", name: "Anna Müller", role: "Plant Manager" },
  { id: "u-kenji", name: "Kenji Tanaka", role: "Plant Manager" },
  { id: "u-james", name: "James Okafor", role: "Plant Manager" },
];

export const activityManagers: ManagerUser[] = initialUsers
  .filter((user) => user.status === "Active" && (user.role === "Administrator" || user.role === "Plant Manager"))
  .map((user) => ({ id: user.id, name: user.name, role: user.role }));
void legacyActivityManagers;

const iso = (s: string) => new Date(s).toISOString();

export const initialActivityRequests: ActivityRequest[] = [
  {
    id: "ar-001",
    activityType: "delete_product",
    title: "Delete Product",
    requestedByName: "Carlos Rivera",
    requestedByRole: "Plant Manager",
    assignedManagerId: "u01",
    assignedManagerName: "Admin User",
    requestedAt: iso("2026-07-10T10:05:00Z"),
    lastUpdatedAt: iso("2026-07-10T10:05:00Z"),
    status: "pending",
    resourceAffected: {
      title: "Industrial Valve Set — Type A",
      details: {
        SKU: "IVS-001",
        Category: "Mechanical",
        Stock: "42 units",
      },
    },
    decisionHistory: [
      {
        id: "dh-001",
        type: "assign",
        actorName: "Admin User",
        actorRole: "Administrator",
        timestamp: iso("2026-07-10T10:05:00Z"),
        note: "Assigned for review",
      },
    ],
  },
  {
    id: "ar-002",
    activityType: "delete_sensor",
    title: "Delete Sensor",
    requestedByName: "Sarah Johnson",
    requestedByRole: "Plant Manager",
    assignedManagerId: "u02",
    assignedManagerName: "Carlos Rivera",
    requestedAt: iso("2026-07-12T14:20:00Z"),
    lastUpdatedAt: iso("2026-07-12T14:20:00Z"),
    status: "pending",
    resourceAffected: {
      title: "Flow Meter D3",
      details: {
        Type: "Flow Rate",
        Location: "Cooling System D",
        "Maintenance Status": "Pending",
      },
    },
    decisionHistory: [
      {
        id: "dh-002",
        type: "assign",
        actorName: "Carlos Rivera",
        actorRole: "Plant Manager",
        timestamp: iso("2026-07-12T14:20:00Z"),
        note: "Review scheduled",
      },
    ],
  },
  {
    id: "ar-003",
    activityType: "edit_role",
    title: "Edit Role",
    requestedByName: "Marcus Lee",
    requestedByRole: "Plant Manager",
    assignedManagerId: "u03",
    assignedManagerName: "Anna Müller",
    requestedAt: iso("2026-07-14T08:10:00Z"),
    lastUpdatedAt: iso("2026-07-14T08:10:00Z"),
    status: "pending",
    resourceAffected: {
      title: "Viewer Role Permissions",
      details: {
        "Requested change":
          "Add data_input and reports_generate permissions to Viewer role",
      },
    },
    decisionHistory: [
      {
        id: "dh-003",
        type: "assign",
        actorName: "Anna Müller",
        actorRole: "Plant Manager",
        timestamp: iso("2026-07-14T08:10:00Z"),
        note: "Permission review in progress",
      },
    ],
  },
  {
    id: "ar-004",
    activityType: "delete_downtime_factor",
    title: "Delete Downtime Factor",
    requestedByName: "Carlos Rivera",
    requestedByRole: "Plant Manager",
    assignedManagerId: "u01",
    assignedManagerName: "Admin User",
    requestedAt: iso("2026-07-08T11:30:00Z"),
    lastUpdatedAt: iso("2026-07-09T09:00:00Z"),
    status: "approved",
    resourceAffected: {
      title: "Mechanical Failure — MF-101",
      details: {
        Category: "Equipment",
        Occurrences: "5 this month",
      },
    },
    decisionHistory: [
      {
        id: "dh-004a",
        type: "assign",
        actorName: "Admin User",
        actorRole: "Administrator",
        timestamp: iso("2026-07-08T11:30:00Z"),
      },
      {
        id: "dh-004b",
        type: "approve",
        actorName: "Admin User",
        actorRole: "Administrator",
        timestamp: iso("2026-07-09T09:00:00Z"),
        note: "Approved after review of historical data",
      },
    ],
  },
  {
    id: "ar-005",
    activityType: "edit_metric",
    title: "Edit Metric",
    requestedByName: "Sarah Johnson",
    requestedByRole: "Plant Manager",
    assignedManagerId: "u01",
    assignedManagerName: "Admin User",
    requestedAt: iso("2026-07-05T16:40:00Z"),
    lastUpdatedAt: iso("2026-07-06T12:15:00Z"),
    status: "declined",
    resourceAffected: {
      title: "Monthly Revenue Target",
      details: {
        "Requested change": "Change target from $100,000 to $120,000",
      },
    },
    decisionHistory: [
      {
        id: "dh-005a",
        type: "assign",
        actorName: "Admin User",
        actorRole: "Administrator",
        timestamp: iso("2026-07-05T16:40:00Z"),
      },
      {
        id: "dh-005b",
        type: "decline",
        actorName: "Admin User",
        actorRole: "Administrator",
        timestamp: iso("2026-07-06T12:15:00Z"),
        note: "Declined: proposed target not aligned with quarterly plan",
      },
    ],
  },
];

import { initialUsers } from "../users/users-data";
