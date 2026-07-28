import { Suspense } from "react";
import { SecurityOperationsPage as SecurityOperationsWorkspace } from "@/components/security-operations/security-operations-page";

export default function SecurityOperationsPage() {
  return <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted"/>}><SecurityOperationsWorkspace /></Suspense>;
}
