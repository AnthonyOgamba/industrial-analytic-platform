import { Suspense } from "react";
import { UserAccessPage } from "@/components/users/user-access-page";

export default function Page() {
  return <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}><UserAccessPage /></Suspense>;
}
