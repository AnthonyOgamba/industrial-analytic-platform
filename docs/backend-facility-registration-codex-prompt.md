# Codex prompt: complete DIVU manufacturing-site registration backend

You are working only in the DIVU backend microservices repository. Do not modify or move the separate frontend repository. Preserve the existing gateway, JWT authorization, database conventions, migrations, audit infrastructure, DTO conventions, and production hierarchy endpoints.

## Objective

Implement a transactional manufacturing-site registration contract for the DIVU frontend modal. The operation must create the facility and its generated halls, production lines, and stations atomically, persist operations/technology/security/AI metadata, and make the new hierarchy immediately available to live production and performance endpoints.

## Gateway endpoint

Add through the existing public gateway:

`POST /api/facilities/register`

Require a valid JWT and the same administrative facility-creation authorization currently used by `POST /api/facilities`.

Request:

```json
{
  "name": "Calgary Manufacturing Plant",
  "code": "CAL-01",
  "siteType": "Plant",
  "company": "DIVU Manufacturing Inc.",
  "country": "Canada",
  "region": "North America",
  "address": "123 Industrial Blvd, Calgary, AB T2P 3C2",
  "hallCount": 2,
  "linesPerHall": 3,
  "stationsPerLine": 4,
  "managerUserId": 4,
  "timezone": "America/Edmonton",
  "operatingHours": "06:00-22:00",
  "shiftPattern": "2-Shift",
  "productionCapacity": 4500,
  "productionCapacityUnit": "units/day",
  "status": "active",
  "expectedSensors": 0,
  "expectedAssets": 0,
  "mesConnected": false,
  "erpConnected": false,
  "telemetryEnabled": true,
  "defaultGovernancePolicyId": null,
  "defaultOperationalAccess": "manager",
  "securityZone": "Zone A",
  "encryptionRequired": true,
  "aiMonitoringEnabled": true,
  "aiRunProposalsEnabled": true,
  "performanceTrackingEnabled": true
}
```

Do not accept the manager as uncontrolled display text. Accept `managerUserId`, validate that the user exists and is active, and return the manager display name in the response.

## Atomic hierarchy generation

Inside one database transaction:

1. Validate the full request before writing.
2. Create the facility.
3. Generate halls named `Hall 1`, `Hall 2`, etc., with codes such as `CAL-01-H1`.
4. Generate lines within each hall named `Line 1`, `Line 2`, etc., with codes such as `CAL-01-H1-L1`.
5. Generate stations within each line named `Station 1`, `Station 2`, etc., with station codes such as `CAL-01-H1-L1-S1`.
6. Assign the manager appropriate site access using `defaultOperationalAccess`.
7. Commit only after every record and access assignment succeeds.
8. Roll back the entire operation on any failure. Never leave a partial hierarchy.

Enforce reasonable limits, configurable where appropriate:

- `hallCount`: 1–20
- `linesPerHall`: 1–20
- `stationsPerLine`: 1–50
- Name, code, address, and metadata length limits
- Unique normalized facility code
- Unique hierarchy codes at their appropriate scope

Return HTTP 201:

```json
{
  "facility": {
    "facilityId": 2,
    "name": "Calgary Manufacturing Plant",
    "code": "CAL-01",
    "status": "active"
  },
  "generated": {
    "halls": 2,
    "productionLines": 6,
    "stations": 24
  },
  "manager": {
    "userId": 4,
    "name": "Manager Name"
  }
}
```

## Persistence

Add migrations using the repository's existing migration mechanism. Extend the facility model or add normalized facility configuration tables for:

- Site type, company, country, region, address
- Manager user ID
- IANA timezone
- Operating hours and shift pattern
- Production capacity and unit
- Expected sensor and asset counts
- MES, ERP, and telemetry flags
- Default governance policy foreign key when governance APIs become available
- Default operational access level
- Security zone and encryption-required flag
- AI monitoring, AI run-proposal, and performance-tracking flags
- UTC created/updated timestamps and actor IDs

Do not store generated metrics such as OEE as facility configuration.

## Live production integration

- Newly generated station IDs must work immediately with `POST /api/runs`.
- Preserve authoritative facility/hall/productionLine/station validation.
- Permit source `manual` and `ai-generated` only according to existing rules.
- When `aiRunProposalsEnabled` is false, reject AI-generated run creation for that facility with HTTP 403 or the backend's established authorization response.
- Continue preventing more than one active or paused run per station.

## Performance integration

Extend facility, hall, line, and station performance DTOs so the frontend can render its existing Production Performance page without demo data:

```json
{
  "oee": 83.0,
  "availability": 92.0,
  "performance": 90.0,
  "quality": 98.0,
  "outputPerHour": 1420,
  "totalRuns": 18,
  "activeRuns": 1,
  "pausedRuns": 0,
  "failedRuns": 2,
  "closedRuns": 15,
  "totalRuntimeMinutes": 9440
}
```

Calculate metrics from authoritative production/run/quality data. Return `null` for metrics that cannot yet be calculated; never invent zero as a substitute for missing telemetry.

Add or extend:

- `GET /api/facilities/{id}/performance`
- `GET /api/halls/{id}/performance`
- `GET /api/lines/{id}/performance`
- `GET /api/stations/{id}/performance`, if the architecture supports it

## AI integration

- Publish a secured internal event after transaction commit, such as `facility.registered`.
- Event payload may contain IDs and configuration flags but no JWT, secret, or credentials.
- The AI service must consume it only through the secured internal/gateway integration.
- Do not expose the unprotected Olive service directly to browsers.
- AI-generated run proposals must reference authoritative hierarchy IDs.

## Live machine-line telemetry and AI prediction pipeline

The frontend must never generate OEE or sensor values. Implement a backend-owned live pipeline that makes every active production line behave like an operating machine line:

1. Add a configurable industrial telemetry generator for development and demonstrations only. Keep it disabled by default in production.
2. Generate readings only for stations belonging to an active or paused production run, according to the backend's run-state policy.
3. Persist timestamped station inputs required for OEE: planned production time, run time, ideal cycle time, total count, and good count.
4. Calculate availability, performance, quality, and OEE server-side using documented formulas.
5. Never ask a language model to invent these measurements. Use deterministic operational calculations; AI consumes the measurements for prediction.
6. Associate every reading and prediction with authoritative facility, hall, line, station, and run IDs.
7. Publish secured live events such as `station.metrics.updated`, `line.performance.updated`, and `prediction.updated` through the existing gateway/SSE infrastructure.
8. Support configurable update frequency, deterministic random seeds in tests, pause/resume behavior, and safe cleanup/retention.
9. Clearly identify generated development telemetry with `source: "simulator"`; real gateway/PLC/SCADA readings should use their actual source.
10. Do not silently fall back to simulated data when real telemetry fails.

Add authenticated endpoints, following existing naming conventions:

- `GET /api/stations/{id}/performance/live`
- `GET /api/lines/{id}/performance/live`
- `GET /api/facilities/{id}/predictions`
- `GET /api/stations/{id}/predictions/latest`

Suggested live performance DTO:

```json
{
  "facilityId": 1,
  "hallId": 1,
  "productionLineId": 1,
  "stationId": 1,
  "runId": 24,
  "status": "active",
  "oee": 83.2,
  "availability": 92.1,
  "performance": 90.4,
  "quality": 99.9,
  "outputPerHour": 1420,
  "source": "plc",
  "calculatedAt": "2026-07-21T03:30:00Z"
}
```

Suggested prediction DTO:

```json
{
  "stationId": 1,
  "failureProbability": 0.78,
  "riskLevel": "high",
  "confidence": 0.91,
  "predictionHorizonHours": 144,
  "estimatedFailureWindowStart": "2026-07-25T00:00:00Z",
  "estimatedFailureWindowEnd": "2026-07-27T00:00:00Z",
  "factors": ["Bearing vibration above baseline"],
  "recommendation": "Inspect bearing CB-07 before the next production shift.",
  "model": "divu-local-risk-v2",
  "calculatedAt": "2026-07-21T03:30:00Z"
}
```

The AI prediction worker must run on a scheduler and when significant telemetry events arrive. Store prediction history, not only the latest result. Include model version, confidence, evidence/factors, prediction horizon, and calculation time. Prevent concurrent duplicate scans for the same station/window.

AI-created notifications must carry authoritative production context:

```json
{
  "notification_id": 101,
  "title": "High failure risk detected",
  "message": "Bearing wear risk increased for Hall A - Line 1 - Assembly.",
  "severity": "high",
  "facilityId": 1,
  "hallId": 1,
  "productionLineId": 1,
  "stationId": 1,
  "predictionId": 44,
  "route": "/operations?tab=performance&stationId=1",
  "created_at": "2026-07-21T03:30:00Z"
}
```

Create or update the notification whenever a prediction crosses a configured risk threshold. Avoid duplicate unread notifications for the same station, prediction type, and risk window. Notification acknowledgement/read state must persist. The notification route must use authoritative IDs and open the matching facility, hall, production line, and station in Production Performance.

## Errors and audit

Return predictable JSON `{ "error": "..." }`:

- 400 validation or invalid hierarchy counts
- 401 missing/invalid JWT
- 403 insufficient role/facility authority
- 404 manager or referenced policy not found
- 409 duplicate facility/code or hierarchy conflict
- 500 unexpected transactional failure without internal details

Audit:

- Registration request and successful facility creation
- Actor user ID
- Facility ID and generated counts
- Failure category without request secrets
- Manager access assignment

## Compatibility

Preserve all existing endpoints and response fields. Do not break current `GET/POST facilities`, nested hierarchy endpoints, runs, site access, sensors, assets, or performance routes.

## Testing

Add unit, integration, authorization, and migration tests covering:

1. Successful 2 × 3 × 4 hierarchy generation.
2. Exact generated counts and code uniqueness.
3. Transaction rollback during hall, line, station, or access creation.
4. Duplicate facility code returns 409.
5. Invalid/inactive manager rejection.
6. Unauthorized and forbidden requests.
7. Newly generated station can start a manual run.
8. Duplicate active run returns 409.
9. AI-generated run respects facility AI settings.
10. Performance endpoints return real values or null, never fabricated data.
11. Audit record is created without secrets.

Run the backend formatter, lint/static analysis, compilation, migrations, and relevant test suite. Report files changed, migration names, endpoint contract, tests run, and any environment configuration required.
