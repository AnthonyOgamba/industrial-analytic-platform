import type { Metadata } from "next";
import { DataInputPage } from "@/components/data-input/data-input-page";

export const metadata: Metadata = {
  title: "Data Input | DIVU Analytics",
  description: "Secure industrial telemetry ingestion, validation, data quality, and source management.",
};

export default function Page() {
  return <DataInputPage />;
}
