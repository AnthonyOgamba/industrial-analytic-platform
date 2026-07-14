import { initialAssets } from "@/components/assets/assets-data";

export type SensorType = "Temperature" | "Pressure" | "Vibration" | "Current" | "Humidity" | "RPM" | "Energy";
export type SensorStatus = "Active" | "Warning" | "Critical" | "Offline" | "Maintenance";
export type SensorClassification = "Public" | "Internal" | "Confidential" | "Restricted";

export type SensorLocation = {
  siteId: string; siteName: string; hallId: string; hallName: string;
  lineId: string; lineName: string; stationId: string; stationName: string;
  assetId: string; assetName: string;
};

export type IndustrialSensor = {
  id: string; sensorId: string; name: string; type: SensorType; unit: string;
  location: SensorLocation;
  status: SensorStatus; reading: number; health: number; battery: number; lastUpdated: string;
  thresholds: { min: number; warnLow: number; warnHigh: number; max: number };
  history: number[];
  network: { protocol: string; samplingFrequency: string; dataSource: string; firmwareVersion: string; ipAddress: string; installationDate: string };
  governance: { policy: string; classification: SensorClassification; encryptionRequired: boolean };
  calibration: { interval: string; lastCalibration: string; nextCalibration: string; status: "Current" | "Due Soon" | "Overdue" | "Not Required" };
  monitoring: { predictiveMonitoring: boolean; anomalyDetection: boolean; anomalyDetected: boolean; failureRisk: "Low" | "Medium" | "High" | "Critical" };
};

export type SensorAlert = { id: string; sensorId: string; level: "warning" | "critical"; message: string; time: string };

function location(assetId: string): SensorLocation {
  const asset = initialAssets.find((item) => item.assetId === assetId);
  if (!asset) throw new Error(`Missing mock asset ${assetId}`);
  return { ...asset.location, assetId: asset.assetId, assetName: asset.name };
}

const historyOffsets = [-1.2, -0.4, 0.5, -0.1, 0.8, 0.2, -0.6, 0.9, 0.3, -0.2, 0.6, 0];
const history = (reading: number, scale: number) => historyOffsets.map((offset) => Number((reading + offset * scale).toFixed(2)));

type SensorSeed = Omit<IndustrialSensor, "id" | "location" | "history" | "network" | "governance" | "calibration" | "monitoring"> & { assetId: string; risk?: IndustrialSensor["monitoring"]["failureRisk"]; anomaly?: boolean; encrypted?: boolean };

function createSensor(seed: SensorSeed): IndustrialSensor {
  return {
    id: seed.sensorId.toLowerCase(), sensorId: seed.sensorId, name: seed.name, type: seed.type, unit: seed.unit,
    location: location(seed.assetId), status: seed.status, reading: seed.reading, health: seed.health, battery: seed.battery, lastUpdated: seed.lastUpdated,
    thresholds: seed.thresholds, history: history(seed.reading, Math.max(0.5, (seed.thresholds.max - seed.thresholds.min) * 0.025)),
    network: { protocol: "OPC-UA", samplingFrequency: "1s", dataSource: "Telemetry Gateway", firmwareVersion: "4.1.2", ipAddress: `192.168.8.${Number(seed.sensorId.replace(/\D/g, "")) % 200 + 10}`, installationDate: "2025-03-14" },
    governance: { policy: "Sensor Telemetry Retention", classification: seed.status === "Critical" ? "Restricted" : "Internal", encryptionRequired: seed.encrypted ?? true },
    calibration: { interval: "6 months", lastCalibration: "2026-04-01", nextCalibration: "2026-10-01", status: seed.status === "Warning" ? "Due Soon" : seed.status === "Offline" ? "Overdue" : "Current" },
    monitoring: { predictiveMonitoring: true, anomalyDetection: true, anomalyDetected: seed.anomaly ?? (seed.status === "Warning" || seed.status === "Critical"), failureRisk: seed.risk ?? (seed.status === "Critical" ? "Critical" : seed.status === "Warning" ? "Medium" : "Low") },
  };
}

export const initialSensors: IndustrialSensor[] = [
  createSensor({ sensorId: "SNS-1001", name: "Spindle Temp A1", type: "Temperature", unit: "°F", assetId: "AST-0011", status: "Active", reading: 68.2, thresholds: { min: 55, warnLow: 60, warnHigh: 80, max: 90 }, health: 100, battery: 91, lastUpdated: "2 min ago" }),
  createSensor({ sensorId: "SNS-1002", name: "Coolant Temp A2", type: "Temperature", unit: "°F", assetId: "AST-0011", status: "Warning", reading: 84.7, thresholds: { min: 55, warnLow: 60, warnHigh: 80, max: 90 }, health: 80, battery: 73, lastUpdated: "5 min ago" }),
  createSensor({ sensorId: "SNS-1003", name: "Ambient Temp A3", type: "Temperature", unit: "°C", assetId: "AST-0031", status: "Warning", reading: 31.8, thresholds: { min: 15, warnLow: 18, warnHigh: 30, max: 40 }, health: 76, battery: 68, lastUpdated: "7 min ago" }),
  createSensor({ sensorId: "SNS-2001", name: "Hydraulic Press P1", type: "Pressure", unit: "PSI", assetId: "AST-0021", status: "Critical", reading: 312, thresholds: { min: 80, warnLow: 100, warnHigh: 280, max: 300 }, health: 25, battery: 22, lastUpdated: "1 min ago", risk: "Critical", encrypted: false }),
  createSensor({ sensorId: "SNS-2002", name: "Conveyor Press P2", type: "Pressure", unit: "PSI", assetId: "AST-0022", status: "Active", reading: 145.2, thresholds: { min: 80, warnLow: 100, warnHigh: 200, max: 280 }, health: 100, battery: 87, lastUpdated: "5 min ago" }),
  createSensor({ sensorId: "SNS-2003", name: "Pneumatic Line P3", type: "Pressure", unit: "PSI", assetId: "AST-0041", status: "Warning", reading: 205.4, thresholds: { min: 70, warnLow: 90, warnHigh: 195, max: 230 }, health: 72, battery: 64, lastUpdated: "4 min ago" }),
  createSensor({ sensorId: "SNS-3001", name: "Motor Vibration V1", type: "Vibration", unit: "mm/s", assetId: "AST-0012", status: "Active", reading: 3.8, thresholds: { min: 0, warnLow: 1, warnHigh: 6, max: 8 }, health: 100, battery: 95, lastUpdated: "2 min ago" }),
  createSensor({ sensorId: "SNS-3002", name: "Drive Vibration V2", type: "Vibration", unit: "mm/s", assetId: "AST-0042", status: "Warning", reading: 6.8, thresholds: { min: 0, warnLow: 1, warnHigh: 6, max: 8 }, health: 80, battery: 55, lastUpdated: "8 min ago" }),
  createSensor({ sensorId: "SNS-4001", name: "Motor Current C1", type: "Current", unit: "A", assetId: "AST-0022", status: "Active", reading: 18.4, thresholds: { min: 0, warnLow: 4, warnHigh: 28, max: 35 }, health: 96, battery: 89, lastUpdated: "2 min ago" }),
  createSensor({ sensorId: "SNS-4002", name: "Spindle Current C2", type: "Current", unit: "A", assetId: "AST-0011", status: "Active", reading: 22.1, thresholds: { min: 0, warnLow: 5, warnHigh: 32, max: 40 }, health: 94, battery: 84, lastUpdated: "3 min ago" }),
  createSensor({ sensorId: "SNS-5001", name: "Cleanroom Humidity", type: "Humidity", unit: "%RH", assetId: "AST-0052", status: "Active", reading: 42, thresholds: { min: 20, warnLow: 30, warnHigh: 60, max: 80 }, health: 92, battery: 78, lastUpdated: "4 min ago" }),
  createSensor({ sensorId: "SNS-5002", name: "Paint Booth Humidity", type: "Humidity", unit: "%RH", assetId: "AST-0032", status: "Warning", reading: 67.5, thresholds: { min: 20, warnLow: 30, warnHigh: 60, max: 80 }, health: 68, battery: 49, lastUpdated: "11 min ago" }),
  createSensor({ sensorId: "SNS-6001", name: "Line RPM Sensor", type: "RPM", unit: "RPM", assetId: "AST-0041", status: "Active", reading: 1480, thresholds: { min: 0, warnLow: 500, warnHigh: 1750, max: 2000 }, health: 91, battery: 82, lastUpdated: "1 min ago" }),
  createSensor({ sensorId: "SNS-6002", name: "Spindle RPM Sensor", type: "RPM", unit: "RPM", assetId: "AST-0051", status: "Maintenance", reading: 0, thresholds: { min: 0, warnLow: 500, warnHigh: 2200, max: 2500 }, health: 58, battery: 61, lastUpdated: "34 min ago", risk: "High" }),
  createSensor({ sensorId: "SNS-7001", name: "Energy Meter E1", type: "Energy", unit: "kWh", assetId: "AST-0042", status: "Active", reading: 284.6, thresholds: { min: 0, warnLow: 25, warnHigh: 420, max: 500 }, health: 90, battery: 100, lastUpdated: "1 min ago" }),
  createSensor({ sensorId: "SNS-7002", name: "Energy Meter E2", type: "Energy", unit: "kWh", assetId: "AST-0061", status: "Offline", reading: 0, thresholds: { min: 0, warnLow: 25, warnHigh: 420, max: 500 }, health: 18, battery: 12, lastUpdated: "2 hr ago", risk: "High" }),
];

export const sensorAlerts: SensorAlert[] = [
  { id: "alert-1", sensorId: "sns-2001", level: "critical", message: "Hydraulic pressure 312 PSI exceeds maximum threshold (300 PSI)", time: "1 min ago" },
  { id: "alert-2", sensorId: "sns-1002", level: "warning", message: "Coolant temperature 84.7°F is approaching the warning threshold", time: "5 min ago" },
  { id: "alert-3", sensorId: "sns-3002", level: "warning", message: "Drive vibration 6.8 mm/s is approaching the critical limit", time: "8 min ago" },
  { id: "alert-4", sensorId: "sns-1003", level: "warning", message: "Ambient temperature is above the approved operating range", time: "7 min ago" },
  { id: "alert-5", sensorId: "sns-2003", level: "warning", message: "Pneumatic line pressure has exceeded its warning threshold", time: "4 min ago" },
  { id: "alert-6", sensorId: "sns-5002", level: "warning", message: "Paint booth humidity requires inspection", time: "11 min ago" },
  { id: "alert-7", sensorId: "sns-7002", level: "critical", message: "Energy Meter E2 is offline and no longer reporting telemetry", time: "2 hr ago" },
];

export const sensorTypes: SensorType[] = ["Temperature", "Pressure", "Vibration", "Current", "Humidity", "RPM", "Energy"];
export const sensorPolicies = ["Sensor Telemetry Retention", "Operations Log Archive", "Standard Operational Policy", "API Access Audit Trail"];
export const sensorProtocols = ["OPC-UA", "MQTT", "Modbus TCP", "EtherNet/IP", "PROFINET", "EtherCAT"];
