export type DashboardSeverity = "neutral" | "healthy" | "warning" | "critical" | "info";

export type DashboardIcon =
  | "activity"
  | "alert"
  | "clock"
  | "cpu"
  | "dollar"
  | "radio"
  | "shield"
  | "trend"
  | "users";

export type DashboardMetric = {
  label: string;
  value: string;
  unit?: string;
  delta: string;
  deltaPositive?: boolean;
  detail?: string;
  severity?: DashboardSeverity;
  icon: DashboardIcon;
  href?: string;
  onClick?: () => void;
};

export type TrendPoint = { label: string; value: number };
export type EquipmentLine = { name: string; value: number; severity: DashboardSeverity };
export type SensorGroup = { label: string; value: string; detail: string; severity: DashboardSeverity };
export type ActivityEvent = { id: string; title: string; detail: string; time: string; code: string; severity: DashboardSeverity };
