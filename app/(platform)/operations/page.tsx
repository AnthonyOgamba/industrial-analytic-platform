import type { Metadata } from "next";

import { BackendFacilitiesWorkspace } from "@/components/facilities/backend-facilities-workspace";

export const metadata: Metadata = {
  title: "Facilities",
  description: "Manage manufacturing facilities, production performance, and operational access.",
};

export default function FacilitiesPage() {
  return <BackendFacilitiesWorkspace />;
}
