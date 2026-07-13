import type { Metadata } from "next";

import { FacilitiesWorkspace } from "@/components/facilities/facilities-workspace";

export const metadata: Metadata = {
  title: "Facilities",
  description: "Manage manufacturing facilities, production performance, and operational access.",
};

export default function FacilitiesPage() {
  return <FacilitiesWorkspace />;
}
