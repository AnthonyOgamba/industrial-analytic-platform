export const reportTypes = ["industrial-analytics","production","downtime","facilities","sensors","telemetry","financial-impact","audit","security","alerts"] as const;
export type ReportType = typeof reportTypes[number];
export type ExportFilters={fromDate:string;toDate:string;facilityId:string;lineId:string;stationId:string;includeSynthetic:boolean;reportType:ReportType};

export function utcDayStart(date:string){return date?`${date}T00:00:00.000Z`:""}
export function utcDayEnd(date:string){return date?`${date}T23:59:59.999Z`:""}
export function validateExportDates(fromDate:string,toDate:string){
  if(!fromDate||!toDate)return "";
  const from=Date.parse(utcDayStart(fromDate));const to=Date.parse(utcDayEnd(toDate));
  if(from>to)return "The start date must be on or before the end date.";
  if(to-from>366*24*60*60*1000)return "The export date range cannot exceed 366 days.";
  return "";
}
export function buildExportQuery(filters:ExportFilters){
  const params=new URLSearchParams({reportType:filters.reportType,includeSynthetic:String(filters.includeSynthetic)});
  if(filters.facilityId)params.set("facilityId",filters.facilityId);
  const hierarchyAllowed=filters.reportType!=="audit"&&filters.reportType!=="security";
  if(hierarchyAllowed&&filters.lineId)params.set("lineId",filters.lineId);
  if(hierarchyAllowed&&filters.stationId)params.set("stationId",filters.stationId);
  if(filters.fromDate)params.set("fromUtc",utcDayStart(filters.fromDate));
  if(filters.toDate)params.set("toUtc",utcDayEnd(filters.toDate));
  return params;
}
export function exportFilename(disposition:string|null){
  const encoded=disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if(encoded)try{return decodeURIComponent(encoded)}catch{return encoded}
  return disposition?.match(/filename="?([^";]+)"?/i)?.[1]??"export.xlsx";
}
