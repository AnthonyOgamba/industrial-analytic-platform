import assert from "node:assert/strict";

const baseUrl = process.env.DIVU_TEST_BASE_URL ?? "http://localhost:3000";
const username = process.env.DIVU_TEST_USERNAME;
const password = process.env.DIVU_TEST_PASSWORD;

if (!username || !password) {
  throw new Error("Set DIVU_TEST_USERNAME and DIVU_TEST_PASSWORD before running the Financial BFF verification.");
}

const unauthenticated = await fetch(`${baseUrl}/api/backend/financial/summary`);
assert.equal(unauthenticated.status, 401, "Financial BFF must require its HttpOnly session cookie");

const login = await fetch(`${baseUrl}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
  redirect: "manual",
});
assert.equal(login.status, 200, "Test login must succeed");
const cookie = login.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
assert.ok(cookie, "Login must issue an HttpOnly session cookie");

async function get(path) {
  return fetch(`${baseUrl}${path}`, { headers: { Cookie: cookie } });
}

const sharedQuery = "includeSynthetic=true";
for (const route of [
  "/api/backend/financial?page=1&pageSize=5&includeSynthetic=true",
  `/api/backend/financial/summary?${sharedQuery}`,
  `/api/backend/financial/monthly?${sharedQuery}`,
  `/api/backend/financial/facilities?${sharedQuery}`,
  `/api/backend/financial/lines?${sharedQuery}`,
]) {
  const response = await get(route);
  assert.equal(response.status, 200, `${route} must be available through the BFF`);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/i);
  const body = await response.json();
  assert.ok(Array.isArray(body.items), `${route} must return an items collection`);
}

const invalidCurrency = await get("/api/backend/financial/summary?currency=INVALID");
assert.equal(invalidCurrency.status, 400, "BFF must preserve upstream currency validation");
assert.match(invalidCurrency.headers.get("content-type") ?? "", /application\/json/i);

const unsupportedStation = await get("/api/backend/financial?stationId=1");
assert.equal(unsupportedStation.status, 400, "Backend must reject station-granular financial filtering");

const emptyRange = await get("/api/backend/financial/summary?fromUtc=2000-01-01T00%3A00%3A00Z&toUtc=2000-01-02T00%3A00%3A00Z");
assert.equal(emptyRange.status, 200);
assert.deepEqual((await emptyRange.json()).items, [], "An empty range must remain an honest empty result");

const summary = await get("/api/backend/financial/summary?includeSynthetic=true");
const summaryBody = await summary.json();
for (const item of summaryBody.items) {
  assert.match(item.currency, /^[A-Z]{3}$/, "Aggregate currency must be a three-letter code");
  assert.equal(typeof item.containsSynthetic, "boolean");
  assert.ok(Array.isArray(item.generationBatchIds));
}

console.log("Financial BFF verification passed.");
