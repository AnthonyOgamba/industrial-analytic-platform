# Frontend/backend gap report

Date: 2026-07-24
Frontend branch: `fix/connect-backend-preserve-approved-ui`
Backend contract reviewed: `C:\Turnupz\Re-TurnupWeb\Zenith-Analytics\docs\frontend-integration-contract.md`

This report contains only backend limitations confirmed while integrating the approved frontend. It does not list unfinished frontend mapping work as a backend gap.

## 1. Governance records cannot be deleted

- Frontend page/component: Data Governance; `components/governance/policies-standards.tsx`, `components/governance/policy-modals.tsx`
- Blocked workflow: permanently delete or retention-safe retire a governance record after confirmation.
- Existing routes: `POST /api/data-governance`; `PATCH /api/data-governance/{id}`.
- Exact limitation: the contract contains no DELETE operation. Hiding a record in frontend state would be false success.
- Required method and route: `DELETE /api/data-governance/{governanceId}`, or the equivalent route following the controller’s established resource naming.
- Query parameters: none.
- Request body: none. If retention rules require an explicit reason, use a documented body such as `{ "reason": "..." }` and return `400` when it is missing.
- Required success response: either `204 No Content`, or `200` with `{ "governanceId": "<uuid>", "status": "deleted"|"retired", "deletedAtUtc": "...", "deletedBy": <uid> }`.
- Required capability: the same confirmed governance-management authority currently used by governance mutations, `settings.organization`, unless the backend introduces a narrower documented capability.
- Facility scope: global records require organization-wide authority; facility records must require access to that facility. Administrators must not be able to delete outside their effective scope unless their documented role is unrestricted.
- Pagination: not applicable to DELETE. The deleted/retired record must cease appearing in normal paged reads without corrupting `total`/`totalPages`.
- Validation: valid UUID; enforce dependency and retention rules; never cascade into unrelated operational datasets.
- Errors: `400` malformed identifier/request; `401` missing/invalid JWT; `403` missing capability or facility access; `404` record absent/already unavailable; `409` dependencies, retention, legal hold, or other state conflict.
- Audit: create a governance deletion/retirement audit action containing actor, resource ID, facility ID, previous values, reason where supplied, and timestamp.
- Migration/index: soft-delete columns and a filtered/indexed active-record lookup may be needed if audit/retention rules prohibit hard deletion. No migration is needed if an existing auditable soft-delete mechanism can be reused.
- Frontend waiting: the existing governance delete confirmation UI must remain disabled/hidden until this contract exists and is verified.

## 2. `generator.reading` lacks fields required for Olive Live Data

- Frontend page/component: Olive Live Data tab to be added within `components/local-ai/local-ai-page.tsx`; shared fetch-based SSE client.
- Blocked workflow: render a self-contained, continuously updating reading row/card and perform targeted hierarchy invalidation without issuing hierarchy/sensor lookups for every event.
- Existing routes: `GET /api/ai/events`; `GET /api/ai/data-generators/{generatorId}/readings`; `GET /api/ai/data-generators/{generatorId}/metrics`.
- Existing reading fields: `reading_id`, `value`, `reading_ts`, `run_id`, `sensor_id`, `sensor_name`, `sensor_type`, `station_id`, `source`, `is_synthetic`, `generation_batch_id`, `generated_at_utc`.
- Exact limitation: the documented `generator.reading` payload is not specified beyond “generated tick payload”; the documented O9 reading lacks `generator_id`, facility/hall/line IDs and names, station name/code, stream identity, unit, sensor status, threshold condition, and anomaly state.
- Required method/route: keep `GET /api/ai/events`; do not create a second live endpoint.
- Query parameters: optional replay cursor only if the chosen durable implementation requires it; retain `Last-Event-ID`.
- Request body: none.
- Required event fields: `event_id`, `generator_id`, `generation_batch_id`, `facility_id`, `facility_name`, `hall_id`, `hall_name`, `production_line_id`, `production_line_name`, `station_id`, `station_name`, `station_code`, `stream_id`, `stream_name`, `sensor_id`, `sensor_name`, `sensor_type`, `value`, `unit`, `reading_ts`, `status`, `threshold_condition`, `is_anomaly`, `source`, `is_synthetic`, and nullable `run_id`. Fields genuinely unavailable for a sensor may be `null`, but identifiers used for targeted refresh must be present.
- Required capability: `generator.use` for generator events, with `olive.use` sufficient only for other Olive events already allowed by policy.
- Facility scope: publish only events belonging to facilities visible to the authenticated caller; lifecycle and reading events must use the same generator facility-scope enforcement as generator reads.
- Pagination/replay: the live stream is not paged. Historical readings retain bounded `limit`; add a stable cursor only if needed for lossless catch-up.
- Validation: stable unique event IDs; ISO-8601 UTC timestamps; finite numeric value; referenced hierarchy/sensor/run/batch records must match.
- Errors: `400` invalid replay cursor; `401` invalid session; `403` capability/facility scope; `404` only for generator-specific history resources; `409` if replay state is no longer available and a documented resync is required.
- Audit: no audit row per high-frequency reading. Generator lifecycle administration remains audited; security-relevant anomaly creation remains audited through its owning operation.
- Migration/index: likely no new reading table is required because readings are already persisted. An event outbox/broker cursor table and indexes on event ID, generator ID, facility ID and timestamp may be needed for durable multi-replica replay.
- Frontend waiting: authenticated shared SSE store, bounded 200–500 reading buffer, hierarchy labels, and targeted invalidation rules.

## 3. SSE is process-local and cannot provide reliable replay across replicas

- Frontend page/component: Olive Live Data and every event-driven refresh consumer.
- Blocked workflow: preserve `Last-Event-ID` replay across reconnects and Azure Container App replica/revision changes.
- Existing route: `GET /api/ai/events`.
- Exact limitation: the contract explicitly says events are process-local and not durable, with no cross-replica broker. A reconnect may reach another replica and miss events even when `Last-Event-ID` is sent.
- Required method/route: retain `GET /api/ai/events`.
- Query/body: no request body; continue accepting the standard `Last-Event-ID` header.
- Required response behaviour: monotonically replayable event IDs within a documented retention window; ordered replay followed by live delivery; no duplicate delivery for a single connection.
- Required capability/scope: preserve the capability and facility filtering described above.
- Pagination: not applicable; document replay retention/window and resynchronization behaviour.
- Validation/errors: `400` malformed cursor; `401`; `403`; a documented `409` or reset event when the cursor predates retained history; `404` is not expected for the stream.
- Audit: no audit per delivery.
- Migration/index: a transactional outbox plus broker, database-backed event log, or equivalent shared durable mechanism may be required; index the replay cursor/event ID and retention timestamp.
- Frontend waiting: reliable deduplication and replay semantics. The frontend can reconnect with bounded backoff but cannot repair server-side event loss.

## 4. Hierarchy resources support creation but not synchronization mutations

- Frontend page/component: Facilities workspace and shared facility hierarchy source; approved facility/hall/line/station edit and removal controls.
- Blocked workflow: synchronize renamed, re-coded, status-changed, moved, or retired facilities/halls/lines/stations across all selectors.
- Existing routes: facility/hall/line/station GET and POST hierarchy routes plus `GET /api/facilities/workspace`.
- Exact limitation: no confirmed update or delete/retire routes for facilities, halls, production lines, or stations.
- Required methods/routes: follow existing resource naming and add only required operations, for example `PATCH /api/facilities/{facilityId}`, `PATCH /api/halls/{hallId}`, `PATCH /api/lines/{lineId}`, `PATCH /api/stations/{stationId}` and retention-safe DELETE/retire equivalents where the product permits removal.
- Query parameters: none.
- Request bodies: complete documented mutable fields—`name`, `code`/`stationCode`, `status`; moving a child between parents should be disallowed unless explicitly supported transactionally.
- Required response fields: canonical ID, parent ID where applicable, name, code, status, and `updatedAtUtc`; return the post-mutation resource.
- Required capability: `facilities.manage`; station changes must also enforce `assets.manage` where current policy requires it.
- Facility scope: resolve every child to its facility and require access before read or mutation; unrestricted admin behaviour must match the contract.
- Pagination: not required for individual mutation; workspace refresh must immediately reflect changes.
- Validation: unique code within documented scope, supported status, non-empty names, parent existence, dependency checks, and prevention of cross-facility orphaning.
- Errors: `400` validation; `401`; `403` authority/scope; `404` resource/parent absent; `409` duplicate code, active dependencies, active runs, streams, sensors, or retention conflict.
- Audit: create actions for hierarchy update and retire/delete with old/new values and facility context.
- Migration/index: uniqueness/status indexes or soft-delete columns may be required; do not add migrations if current schema already supports these safely.
- Frontend waiting: shared hierarchy invalidation after edits/removals and approved edit/delete controls.

## 5. No standalone asset resource

- Frontend page/component: approved Asset Registry components.
- Blocked workflow: represent asset-specific manufacturer/model/serial, lifecycle, criticality, maintenance association and asset CRUD independently of stations.
- Existing route: none; stations currently represent machine resources.
- Exact limitation: `/api/assets` does not exist and station DTOs do not contain the approved registry fields.
- Required method/route: only if the product still requires assets distinct from stations: paged `GET /api/assets`, `POST /api/assets`, and resource `GET/PATCH/DELETE /api/assets/{assetId}` under the public gateway.
- Query parameters: `facilityId`, `hallId`, `lineId`, `stationId`, `status`, `type`, search, `page`, `pageSize`.
- Request body: station/hierarchy association plus name, asset code, type, manufacturer, model, serial number, lifecycle status, criticality and mutable metadata.
- Response fields: asset ID and all display fields above, readable hierarchy IDs/names, latest sensor-health/risk summary, created/updated timestamps.
- Required capability: `assets.view`/`assets.manage`.
- Facility scope: derive from the associated station and enforce server-side.
- Pagination: standard `{items,page,pageSize,total,totalPages}` envelope.
- Validation/errors: `400` invalid hierarchy/fields; `401`; `403`; `404`; `409` duplicate asset code/serial or dependent active records.
- Audit: asset create/update/retire/delete.
- Migration/index: likely requires asset storage and unique indexes if assets remain a separate domain concept.
- Frontend waiting: `components/assets/assets-page.tsx` and its approved dialogs/cards. If stations are the final product model, the frontend needs an explicit product decision to relabel/map the approved asset fields rather than a new API.

## 6. Confirmed filter limitations

### Reports

- Page/component: Reports Center.
- Blocked workflow: server-correct facility filtering with accurate pagination.
- Existing route: `GET /api/reports`.
- Limitation: accepts date, source and pagination, but no `facilityId`; the embedded `filters.facilityId` cannot be client-filtered without making page totals incorrect.
- Required change: add optional `facilityId` query filtering; keep response envelope and `reports.view`.
- Scope: reject inaccessible facilities with `403`; otherwise filter within caller-visible exports.
- Errors/audit/index: standard `400/401/403`; `404` not applicable to list; `409` not expected. Reads need no audit beyond existing report access policy. Index persisted report filter/facility data if query performance requires it.
- Frontend waiting: approved facility selector in `components/reports/report-center.tsx`.

### Activity and audit

- Page/components: Activity and Audit Log.
- Blocked workflow: facility-specific administrative/operational timelines and accurate paging.
- Existing routes: `GET /api/activity`, `GET /api/audit`.
- Limitation: Activity lacks `facilityId`; Audit is an unpaged read contract without confirmed facility/date/action filters.
- Required change: optional `facilityId`, `fromUtc`, `toUtc`, `action`/`source`, `page`, `pageSize`; return stable readable facility identity when an audit record is facility-related.
- Capability/scope: `dashboard.view` for Activity and `audit.view` for Audit; facility-scoped users must not receive records for other facilities.
- Errors: `400` invalid filters/range; `401`; `403`; list `404/409` not expected.
- Audit/index: reads need no new audit action; indexes on facility, action and timestamp may be required.
- Frontend waiting: approved filters in Activity and Audit Log.

## Not backend blockers

- Financial, Downtime and Security Operations already expose facility-aware paged routes.
- Generated batches already carry shared `generationBatchId` links into confirmed downtime and financial records; the backend should not duplicate those records.
- Dashboard now forwards `facilityId`, `fromUtc` and `toUtc` according to the latest contract section.
- Data-input import deliberately records batch metadata and row counts; operational ingestion is a separate product requirement and is not requested here.
- Invitation redemption, session management and user deletion are confirmed missing, but they are outside the currently requested cross-platform live-data/facility/governance completion scope.

## Verification evidence

- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `git diff --check`: passed; Git emitted line-ending normalization warnings only.
- `npm run build`: invoked repeatedly, but the Next.js/Turbopack worker did not reach a terminal result and did not produce a fresh `.next/BUILD_ID`. This is not recorded as a backend gap.
- Public production integration: not claimed. Production deployment and test credentials were not part of this frontend session, and the backend contract explicitly says production is not updated until healthy Azure revisions are routed and verified.
