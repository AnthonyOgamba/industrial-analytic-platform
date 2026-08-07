import { AuditLogPage } from "@/components/audit-log/audit-log-page";
import { ApprovalPanel } from "@/components/audit-log/approval-panel";
import { AuditPageDataProvider } from "@/lib/audit-page-data";

export default function AuditPage() {
  return <AuditPageDataProvider><div className="space-y-5"><ApprovalPanel/><AuditLogPage /></div></AuditPageDataProvider>;
}
