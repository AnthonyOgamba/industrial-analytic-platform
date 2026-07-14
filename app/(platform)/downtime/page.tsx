import type { Metadata } from "next";
import { DowntimePage } from "@/components/downtime/downtime-page";

export const metadata: Metadata = {
  title: "Downtime | DIVU Analytics",
  description: "Downtime factors, active events, operational analytics, and AI insights.",
};

export default function Page() {
  return <DowntimePage />;
}
