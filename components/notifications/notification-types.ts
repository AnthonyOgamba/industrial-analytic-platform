export type NotificationType = "Security" | "Operations" | "Approval" | "Report" | "Governance" | "Olive";
export type NotificationSeverity = "Critical" | "High" | "Medium" | "Low";

export type DivuNotification = {
  id: string;
  title: string;
  type: NotificationType;
  severity: NotificationSeverity;
  read: boolean;
  message: string;
  time: string;
  source: string;
  route: string;
  actions: string[];
  recipient?: string;
};
