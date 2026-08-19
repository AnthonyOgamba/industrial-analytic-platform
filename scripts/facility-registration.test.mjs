import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { facilitySettingsPayload } from "../lib/facility-contract.ts";
import { responseErrorMessage, validationErrors } from "../lib/api-error-utils.ts";
import { activeGovernancePolicyNames } from "../lib/governance-policy-options.ts";

const payload=facilitySettingsPayload({name:" Main Facility ",code:"FAC-001",status:"ACTIVE",description:"",managerUserId:"12",address:"123 Industrial Road",city:"Calgary",provinceState:"Alberta",country:"Canada",countryCode:"ca",timezone:"America/Edmonton",latitude:"51.0447",longitude:"-114.0719",governancePolicy:"Operational Governance Policy",accessLevel:"manager",securityZone:"Zone A",currency:"cad",hourlyProductionValue:"2500",downtimeCostPerHour:"8000"});
assert.equal(payload.governancePolicy,"Operational Governance Policy","canonical governance policy name is submitted");
assert.deepEqual(activeGovernancePolicyNames({items:[{governanceId:"policy-1",name:"Operational Governance Policy",status:"ACTIVE"},{governanceId:"policy-2",name:"Draft Policy",status:"draft"}]}),["Operational Governance Policy"],"only active canonical policy names become option values");
assert.equal(payload.managerUserId,12,"manager uid is numeric");
for(const key of ["latitude","longitude","hourlyProductionValue","downtimeCostPerHour"])assert.equal(typeof payload[key],"number",`${key} is numeric`);
assert.equal(payload.city,"Calgary");assert.equal(payload.country,"Canada");assert.equal(payload.address,"123 Industrial Road");assert.equal(payload.provinceState,"Alberta");
assert.equal(payload.countryCode,"CA");assert.equal(payload.currency,"CAD");assert.equal(payload.status,"active");
assert.deepEqual(validationErrors({errors:{governancePolicy:"Policy is inactive.",city:["City is required.","City is invalid."]}}),{governancePolicy:"Policy is inactive.",city:"City is required. City is invalid."});
assert.equal(responseErrorMessage({detail:"Specific backend detail"},"fallback"),"Specific backend detail");
assert.equal(responseErrorMessage({errors:{governancePolicy:["Policy is inactive."]}},"fallback"),"Policy is inactive.");

const modal=await readFile(new URL("../components/facilities/facility-modals.tsx",import.meta.url),"utf8");
const workspace=await readFile(new URL("../components/facilities/facilities-workspace.tsx",import.meta.url),"utf8");
assert.match(modal,/cause instanceof ApiError&&Object\.keys\(cause\.fieldErrors\)\.length/,"400 errors remain in the modal");
assert.match(modal,/!governancePolicies\.includes\(settings\.governancePolicy\)\|\|pending/,"registration is disabled until an active policy name is selected");
assert.match(modal,/querySelector<HTMLElement>\(`\[name=/,"first invalid field is focused");
assert.match(workspace,/catch \(cause\) \{ throw cause; \}/,"failed registration is returned to the open modal");
assert.match(workspace,/await invalidateFacilityHierarchy\(\); await load\(\); setError\(""\); setRegisterOpen\(false\)/,"successful creation refreshes canonical data before closing");
assert.match(workspace,/if\(!hasFacilities\.current\)setLoading\(true\); setError\(""\)/,"refresh clears stale page errors");
console.log("facility registration tests passed");
