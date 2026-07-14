import { Radio } from "lucide-react";

import { SensorCard } from "./sensor-card";
import type { IndustrialSensor } from "./sensors-data";

export function SensorGrid({ sensors }: { sensors: IndustrialSensor[] }) {
  if (!sensors.length) return <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground"><Radio className="mx-auto mb-3 size-9 opacity-40" />No sensors match the selected filters.</div>;
  return <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{sensors.map((sensor) => <SensorCard key={sensor.id} sensor={sensor} />)}</div>;
}
