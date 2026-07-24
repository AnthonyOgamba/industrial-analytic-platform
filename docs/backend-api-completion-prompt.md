Work in:

C:\Turnupz\Re-TurnupWeb\Zenith-Analytics

Continue from the current completed backend integration branch.

Do not modify the frontend repository.
Do not commit, push, merge or deploy automatically.

Implement only the confirmed frontend blockers documented in:

`C:\DIVU ANALYTIC PLATFORM\divu-frontend\docs\frontend-backend-gap-report.md`

Before changing code, reconcile that report with the current backend branch, controllers, schema, tests, .NET gateway, nginx configuration, and `docs/frontend-integration-contract.md`. If a requested operation or field already exists on the current branch, verify and document it instead of duplicating it. Do not introduce alternate routes for an existing resource.

## 1. Governance deletion

Confirm whether a governance DELETE operation is still missing. If missing, implement a retention- and audit-safe delete/retire operation using the controller’s established resource naming. `DELETE /api/data-governance/{governanceId}` is suitable if it matches the existing pattern, but do not create a duplicate route merely to use that spelling.

The operation must:

- require the confirmed governance-management authority, currently `settings.organization`, unless a narrower documented capability is introduced consistently;
- enforce facility scope for facility-owned records and organization-wide authority for global records;
- validate the identifier and return JSON `400` for invalid requests;
- return `401` for missing/invalid authentication;
- return `403` for missing capability or facility scope;
- return `404` when the record does not exist;
- return `409` when dependencies, retention, legal hold or current state block deletion;
- create an audit record with actor, governance ID, facility ID, old values, reason if applicable and timestamp;
- avoid silently deleting related operational datasets;
- use soft deletion when retention or audit requirements prohibit hard deletion;
- return `204`, or a documented clear success object containing identifier, terminal status, timestamp and actor;
- keep paged list totals correct after deletion/retirement;
- be exposed through the .NET gateway and public nginx gateway;
- include controller, authorization, facility-scope, dependency-conflict, audit and public-route tests.

## 2. Olive Live Data event contract

Keep `GET /api/ai/events`; do not create a parallel live-data endpoint.

Inspect the actual scheduler payload for `generator.reading`. The restored contract documents O9 fields but does not define the tick payload precisely. Make one reading event self-contained for the approved Olive Live Data UI and targeted cache invalidation.

Where available, include:

- stable `event_id`;
- `generator_id`;
- `generation_batch_id`;
- `facility_id`, `facility_name`;
- `hall_id`, `hall_name`;
- `production_line_id`, `production_line_name`;
- `station_id`, `station_name`, `station_code`;
- `stream_id`, `stream_name`;
- `sensor_id`, `sensor_name`, `sensor_type`;
- `value`, `unit`, `reading_ts`;
- `status`, `threshold_condition`, `is_anomaly`;
- `source`, `is_synthetic`;
- nullable `run_id`.

Use `null` only for genuinely unavailable optional display fields. Do not fabricate names, units, thresholds or anomaly state.

Preserve the documented lifecycle, alert, notification and scan events. Ensure generator lifecycle payloads retain hierarchy IDs and `generation_batch_id`.

Event authorization must:

- require the appropriate `olive.use`, `olive.configure` and/or `generator.use` authority for each event class;
- filter generator, alert and reading events to the caller’s permitted facilities;
- prevent cross-facility event leakage.

The current process-local event implementation is insufficient for reliable `Last-Event-ID` replay across Azure replicas. Implement a shared durable replay mechanism appropriate to the existing architecture—transactional outbox, broker, database event log, or equivalent—without duplicating operational readings. Provide:

- stable ordered event IDs;
- bounded documented retention;
- replay from `Last-Event-ID`;
- ordered catch-up followed by live delivery;
- a documented `400` for malformed cursor;
- `401` and `403`;
- a documented reset response/event or `409` when a cursor predates retained history;
- cancellation propagation when the client disconnects;
- no audit row for every high-frequency reading;
- automated single-replica, cross-replica/reconnect, replay, deduplication, authorization and facility-scope tests.

Add a migration and indexes only if the selected durable mechanism requires them. Index the replay cursor/event ID, retention timestamp and facility/generator lookup fields as appropriate.

## 3. Facility hierarchy synchronization

The confirmed hierarchy contract supports reads and creation but not update or retirement/deletion. Inspect the approved frontend workflows and current backend before adding anything.

Where still missing, implement update operations for facility, hall, production line and station using the existing resource naming. Support only the mutable fields already owned by these resources:

- `name`;
- `code` or `stationCode`;
- `status`.

Return canonical ID, parent ID, name, code/status and `updatedAtUtc`. Require `facilities.manage`, plus `assets.manage` for station operations where current policy requires it. Resolve every child to its facility and enforce facility scope.

Return:

- `400` for invalid names/codes/status or illegal parent changes;
- `401`;
- `403`;
- `404`;
- `409` for duplicate codes, active runs, dependent streams/sensors or retention conflicts.

Only implement delete/retire operations where the product workflow actually exposes them and dependencies can be handled safely. Prefer retirement/soft deletion where audit history requires it. Do not cascade-delete unrelated runs, telemetry, financial, downtime, audit or generation records.

Audit every hierarchy update/retire operation with old/new values and facility context. Add uniqueness/status indexes or migrations only when required. Add tests proving `GET /api/facilities/workspace` immediately reflects successful mutations.

## 4. Asset decision and API

The backend contract explicitly states that stations currently represent machine/asset resources and `/api/assets` does not exist.

First determine and document whether the product model treats an asset as:

1. exactly a station, in which case extend the station/workspace display contract only with confirmed asset-owned fields; or
2. a separate resource, in which case implement a properly scoped asset domain rather than overloading products.

Do not build asset CRUD until this domain decision is confirmed from current backend/product artifacts. If assets are separate and required, implement paged list/create/detail/update/retire routes with station hierarchy association, asset code, type, manufacturer, model, serial number, lifecycle status, criticality, timestamps and latest sensor-health/risk summary. Use `assets.view`/`assets.manage`, derive facility scope from station ownership, validate dependencies, audit mutations, expose routes through gateway/nginx, and add required migrations/indexes and tests.

## 5. Confirmed list-filter gaps

Add only filters that are still absent:

- Reports: optional `facilityId` on `GET /api/reports`, with correct server-side pagination totals and facility authorization.
- Activity: optional `facilityId` on `GET /api/activity`.
- Audit: add a paged contract only if the current route is still unpaged; support `facilityId`, `fromUtc`, `toUtc`, `action`/`source`, `page`, `pageSize`.

Use the existing shared envelope:

`{ "items": [], "page": 1, "pageSize": 50, "total": 0, "totalPages": 0 }`

Apply the existing 1–200 page-size clamp, 366-day maximum interval, cancellation tokens and JSON validation errors. Return `403` for a specifically requested inaccessible facility. Include readable facility identity on records that are facility-related. Add indexes on facility/action/timestamp only where query plans require them.

Do not add duplicate facility filters to Financial, Downtime or Security Operations; those are already confirmed. Do not duplicate generated data. Preserve the existing shared `generationBatchId` relationships.

## Cross-cutting requirements

For every implemented change:

- update `docs/frontend-integration-contract.md` with exact request/response examples, capability, scope, pagination, validation, errors, timeout and verification status;
- update the .NET gateway and public nginx route configuration where necessary;
- enforce named capabilities and facility scope server-side;
- propagate cancellation tokens through controllers, services and database calls;
- use pagination for potentially unbounded reads;
- add database migrations and indexes only where required;
- add automated unit/integration/authorization/scope tests;
- verify locally through the public gateway, not only by calling internal services;
- verify JSON errors for `400`, `401`, `403`, `404` and `409` where applicable;
- preserve audit integrity and avoid logging secrets or high-frequency raw readings as audit entries.

## Required completion report

Report:

- exact controllers/services/models/migrations/tests/configuration changed;
- exact public routes and contracts added or changed;
- capability and facility-scope behaviour;
- local public-gateway verification commands and results;
- migration names and indexes, if any;
- remaining blockers not implemented and why;
- updated `docs/frontend-integration-contract.md` path;
- Docker images that must be rebuilt;
- Azure Container Apps/revisions that require deployment, including at minimum whichever of `Zenith.Identity`, `Zenith.Operations`, `Zenith.Telemetry`, `Zenith.Gateway`, public nginx gateway and `zenith-ai-agent` were actually changed.

Do not perform frontend styling work. Do not claim production completion. Do not deploy automatically.
