# Presentation code guide

Use `Ctrl+Shift+F` in VS Code and search for the exact uppercase tags shown below.

## 1. Login and session security

- **Search:** `FEATURE: Login` and `FEATURE: Session validation`
- **Frontend:** `components/auth/login-form.tsx`, `app/api/auth/session/route.ts`, `lib/access-control.tsx`
- **Backend file:** External Identity service — verify in backend repository
- **API:** `POST /api/auth/login` → `GET /api/auth/me` and authorization context
- **Permission:** Public login; authenticated session thereafter
- **Database:** External — verify
- **Instructor explanation:** The browser never calls the cloud service directly with an invented URL. The Next.js authentication boundary manages the secure cookie and separately loads effective authorization.
- **Flow:** Sign In → frontend auth route → gateway Identity API → secure cookie → session BFF → protected platform.

## 2. Dashboard and operational cost impact

- **Search:** `FEATURE: Dashboard` and `FEATURE: Dashboard Operational Cost Impact`
- **Frontend:** `components/dashboard/dashboard.tsx`, `components/dashboard/operational-cost-dialog.tsx`
- **Backend file:** External Operations analytics controller/service — verify
- **API:** `GET /api/backend/dashboard` and canonical cost/downtime reads
- **Permission:** `dashboard.view`
- **Database:** External — verify
- **Instructor explanation:** One operational view supplies the cards and charts. A failed background refresh keeps the last valid result, while the cost popup explains production consequences without navigating to a separate Financial module.
- **Flow:** Dashboard load → BFF → gateway analytics → facility-scoped aggregate → normalized cards/charts → optional cost dialog.

## 3. Facility and hierarchy creation

- **Search:** `FEATURE: Facilities creation and production performance`
- **Frontend:** `components/facilities/backend-facilities-workspace.tsx`
- **Backend file:** External Operations controller — verify
- **API:** facility POST followed by hall, line, and station POST routes
- **Permission:** Effective facility-management capability from session
- **Database:** External — verify
- **Instructor explanation:** A facility is the root of the manufacturing hierarchy. The UI creates real canonical nodes and immediately makes them reusable by production, assets, sensors, downtime, and reports.
- **Flow:** Create Facility → facility POST → halls → lines → stations → reload workspace.

## 4. Assets, sensors, and downtime

- **Search:** `FEATURE: Asset creation`, `FEATURE: Sensor creation and telemetry`, `FEATURE: Downtime creation and financial impact`
- **Frontend:** `components/assets/canonical-asset-form.tsx`, `components/sensors/sensors-page.tsx`, `components/downtime/downtime-page.tsx`
- **Backend file:** External Operations controller — verify
- **API:** `POST /api/assets`, `POST /api/sensors/catalog`, `POST /api/downtime/events`
- **Permission:** `assets.create`, `sensors.create`, `downtime.create`
- **Database:** External — verify
- **Instructor explanation:** All three forms reuse canonical facility, station, asset, sensor, and run identifiers, preventing disconnected frontend-only records.
- **Flow:** hierarchy selection → typed request → BFF → canonical service → persisted record → real GET refresh.

## 5. Olive AI chat and analysis

- **Search:** `FEATURE: Olive AI`
- **Frontend:** `components/local-ai/local-ai-page.tsx`
- **Backend file:** External Olive API/agent — verify
- **API:** `POST /api/backend/ai/chat`; related risk, alert, rule, setting, and scan routes
- **Permission:** Effective AI capabilities from session
- **Database:** External — verify
- **Instructor explanation:** Olive combines agentic orchestration—deciding which platform information to inspect—with analysis endpoints that calculate risk, alert, and operational findings from current records.
- **Flow:** Ask Olive → chat API → agent selects supported data sources → analysis → plain-text answer plus source references.

## 6. AI production simulation

- **Search:** `FEATURE: AI data generation`
- **Frontend:** `components/local-ai/data-generation-panel.tsx`, `lib/data-generators.ts`
- **Backend file:** External Olive generator implementation — verify
- **API:** `POST /api/ai/data-generators`; pause/resume/stop and readings/metrics endpoints
- **Permission:** `generator.use` for mutations
- **Database:** External — verify
- **Instructor explanation:** The generator simulates a plant using canonical stations and sensors. Generated readings remain explicitly identified as synthetic and feed the same sensor and production views.
- **Flow:** choose hierarchy/scenario → Generate Data → generator API → persisted readings/metrics → sensor/dashboard refresh.

## 7. Users, roles, and deletion workflow

- **Search:** `FEATURE: User creation and lifecycle`, `FEATURE: Role assignment`, `FEATURE: User deletion request`
- **Frontend:** `components/users/users-page.tsx`, `components/users/user-role-assignments.tsx`, `components/users/sensitive-user-actions.tsx`
- **Backend file:** External Identity controller/effective-access service — verify
- **API:** `POST /api/users`, `PUT /api/users/{id}/roles`, `POST /api/users/{id}/permanent-deletion`
- **Permission:** `users.create`, `users.roles.assign`, `users.delete`
- **Database:** role relationship tables are documented in `feature-code-map.md`; remaining tables require backend verification
- **Instructor explanation:** Role keys come from the service, multiple roles combine into effective permissions, and permanent deletion is separate from disabling an account.
- **Flow:** create identity → one-time temporary password → assign roles/facilities → effective access → audited lifecycle actions.

## 8. Audit and approvals

- **Search:** `FEATURE: Audit Log` and `FEATURE: User deletion approval`
- **Frontend:** `components/audit-log/audit-log-page.tsx`, `components/audit-log/approval-panel.tsx`
- **Backend file:** External approval/audit controller — verify
- **API:** `/api/backend/audit` and `/api/backend/approvals/*`
- **Permission:** Effective audit/approval capabilities
- **Database:** External — verify
- **Instructor explanation:** Audit records are read-only. Sensitive requests expose only service-authorized actions and preserve actor, outcome, and correlation evidence.
- **Flow:** sensitive action → approval request → Audit & Approvals → authorized decision/final action → refreshed history.

## 9. Notifications and preferences

- **Search:** `FEATURE: Authenticated platform shell`
- **Frontend:** `components/layout/platform-shell.tsx`, `components/notifications/notification-drawer.tsx`
- **Backend file:** External notification/profile controllers — verify
- **API:** notification list/read routes and `PATCH /api/profile`
- **Permission:** `notifications.view` for notifications
- **Database:** External — verify
- **Instructor explanation:** The unread badge is derived from recipient-owned records. Opening the drawer acknowledges unread items through the canonical endpoint; theme, language, and accessibility remain user-controlled.
- **Flow:** shell load → notification GET → unread badge → open drawer → read-all → local and service state agree.

## 10. Reports

- **Search:** `FEATURE: Reports`
- **Frontend:** `components/reports/report-center.tsx`, `app/api/backend/reports/export.xlsx/route.ts`
- **Backend file:** External report controller/service — verify
- **API:** `GET /api/reports`; `GET /api/reports/export.xlsx`
- **Permission:** `reports.view`, `reports.export`
- **Database:** External — verify
- **Instructor explanation:** Reports consume shared persisted operational aggregates. Excel downloads pass through a specialized BFF route so authentication and binary response headers are preserved.
- **Flow:** select scope → Export → specialized BFF → report service → Excel response → browser download.

## Backend follow-up

Open the backend repository and add matching `FEATURE:`, `ENDPOINT:`, `PERMISSION:`,
`DATABASE:`, and `CALCULATION:` tags to the verified controller/service methods. Replace
every **External — verify** entry only after locating the real implementation.
