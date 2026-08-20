import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildExportQuery, exportFilename, validateExportDates } from "../lib/report-export.ts";

const combined=buildExportQuery({facilityId:"123",lineId:"456",stationId:"789",fromDate:"2026-08-01",toDate:"2026-08-20",includeSynthetic:false,reportType:"production"});
assert.equal(combined.get("facilityId"),"123");assert.equal(combined.get("lineId"),"456");assert.equal(combined.get("stationId"),"789");assert.equal(combined.get("fromUtc"),"2026-08-01T00:00:00.000Z");assert.equal(combined.get("toUtc"),"2026-08-20T23:59:59.999Z");assert.equal(combined.get("includeSynthetic"),"false");assert.equal(combined.get("reportType"),"production");
for(const reportType of ["audit","security"]){const query=buildExportQuery({facilityId:"1",lineId:"2",stationId:"3",fromDate:"",toDate:"",includeSynthetic:true,reportType});assert.equal(query.has("lineId"),false);assert.equal(query.has("stationId"),false)}
assert.match(validateExportDates("2026-08-20","2026-08-01"),/start date/);assert.match(validateExportDates("2025-01-01","2026-08-20"),/366 days/);assert.equal(validateExportDates("2026-08-01","2026-08-20"),"");
assert.equal(exportFilename("attachment; filename=production-20260820-120000.xlsx"),"production-20260820-120000.xlsx");

const workspace=await readFile(new URL("../components/facilities/facilities-workspace.tsx",import.meta.url),"utf8");
const overview=await readFile(new URL("../components/facilities/facilities-overview.tsx",import.meta.url),"utf8");
const proxy=await readFile(new URL("../app/api/backend/[...path]/route.ts",import.meta.url),"utf8");
assert.match(workspace,/facilities\/workspace\?status=\$\{statusFilter\}/);assert.doesNotMatch(workspace,/includeInactive/);assert.match(overview,/value="active"/);assert.match(overview,/value="inactive"/);assert.match(overview,/value="all"/);
assert.match(workspace,/apiRequest\(`\/api\/backend\/facilities\/\$\{Number\(facility\.id\)\}`,\{method:"DELETE"\}\)/);assert.match(workspace,/capabilities\.includes\("facilities\.delete"\)/);assert.match(proxy,/\^facilities\\\/\\d\+\$\/, methods: \["GET", "PATCH", "DELETE"\]/);
console.log("facility lifecycle and export tests passed");
