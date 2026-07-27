import { AuditLogPage } from "@/components/audit-log/audit-log-page";
import { ApprovalPanel } from "@/components/audit-log/approval-panel";

export default function AuditPage() {
  return <div className="space-y-5"><ApprovalPanel/><AuditLogPage /></div>;
}
