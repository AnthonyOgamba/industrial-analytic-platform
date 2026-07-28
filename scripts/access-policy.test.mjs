import assert from "node:assert/strict";
import test from "node:test";

import {
  createAccessChecks,
  requiredCapabilityForPath,
} from "../lib/access-policy.ts";

test("capability helpers use only authenticated claims", () => {
  const access = createAccessChecks({
    capabilities: ["assets.view", "reports.view", "reports.export"],
    facilityIds: [7, 12],
  });

  assert.equal(access.can("assets.view"), true);
  assert.equal(access.can("assets.manage"), false);
  assert.equal(access.canAny(["assets.manage", "reports.view"]), true);
  assert.equal(access.canAll(["reports.view", "reports.export"]), true);
  assert.equal(access.canAll(["reports.view", "users.manage"]), false);
});

test("facility access is explicit and does not infer global access", () => {
  const access = createAccessChecks({ facilityIds: [7] });
  assert.equal(access.hasFacilityAccess(7), true);
  assert.equal(access.hasFacilityAccess(8), false);
});

test("protected routes resolve to canonical capabilities", () => {
  assert.equal(requiredCapabilityForPath("/"), "dashboard.view");
  assert.equal(requiredCapabilityForPath("/assets"), "assets.view");
  assert.equal(requiredCapabilityForPath("/users?tab=roles"), "users.view");
  assert.equal(requiredCapabilityForPath("/reports"), "reports.view");
  assert.equal(requiredCapabilityForPath("/unauthorized"), undefined);
});
