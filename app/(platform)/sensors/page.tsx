import type { Metadata } from "next";

import { SensorsPage } from "@/components/sensors/sensors-page";

export const metadata: Metadata = {
  title: "Sensors",
  description: "Real-time industrial sensor intelligence, health, thresholds, and secure telemetry monitoring.",
};

export default function SensorsRoute() {
  return <SensorsPage />;
}
