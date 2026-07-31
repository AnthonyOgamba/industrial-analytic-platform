# DIVU feature code map

Search the repository using the feature names or the uppercase trace tags. Routes in the
backend column are verified from frontend calls. Controller, service, and database entries
marked **External — verify** cannot be proven from this frontend repository and must not be
treated as invented implementation detail. No Jira IDs were present in the repository.

| Feature | Frontend Page | Component/Button | Handler | Frontend API | Backend Endpoint | Controller | Service | Database Tables | Permission | Jira Item |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Login | `/login` | `LoginForm` / Sign In | `submit` | `apiRequest` | `POST /api/auth/login` | External — verify Identity controller | External — verify | External — verify | Public | Not yet mapped |
| Session validation | Protected routes | `AuthorizationProvider` | session bootstrap | `requestBackend` BFF | `GET /api/auth/me`; `GET /api/auth/me/authorization-context` | External — verify Identity controller | Effective authorization service (external — verify) | External — verify | Authenticated session | Not yet mapped |
| Dashboard | `/` | `Dashboard` / Refresh | `load` | `apiRequest` | `GET /api/dashboard` through `/api/backend/dashboard` | External — verify Operations controller | External — verify analytics service | External — verify | `dashboard.view` | Not yet mapped |
| Operational Cost Impact popup | `/` | `OperationalCostDialog` / View Cost Impact | `load` | `apiRequest` | Dashboard cost aggregate and canonical downtime routes through `/api/backend` | External — verify Operations controller | External — verify | External — verify | `dashboard.view`; service may require cost-data authorization | Not yet mapped |
| Facilities creation | `/operations` | facility creation dialog / Create Facility | `submit` | `apiRequest` | `POST /api/facilities`, then hall, line, and station endpoints | External — verify Operations controller | External — verify | External — verify | Capability supplied by session; see component guard | Not yet mapped |
| Asset creation | `/assets` | `CanonicalAssetForm` / Create Asset | `submit` | `apiRequest` | `POST /api/assets` | External — verify Operations controller | External — verify | External — verify | `assets.create` | Not yet mapped |
| Sensor creation | `/sensors` | `SensorForm` / Create Sensor | `submit` | `apiRequest` | `POST /api/sensors/catalog` | External — verify Operations controller | External — verify | External — verify | `sensors.create` | Not yet mapped |
| Downtime creation | `/downtime` | downtime form / Create Downtime | `submit` | `apiRequest` | `POST /api/downtime/events` | External — verify Operations controller | External — verify | External — verify | `downtime.create` | Not yet mapped |
| Olive chat | `/local-ai` | `ChatPanel` / Ask Olive | `send` | `apiRequest` | `POST /api/ai/chat` | External — verify Olive API | External agentic/analysis service — verify | External — verify | AI page/read capability from session | Not yet mapped |
| AI data generation | `/local-ai` | `DataGenerationPanel` / Generate Data | `create` | `dataGeneratorsApi.create` | `POST /api/ai/data-generators` | External — verify Olive API | Generator service (external — verify) | External — verify | `generator.use` | Not yet mapped |
| User creation | `/users` | `CreateUserModal` / Create User | `create` | `apiRequest` | `POST /api/users` | External — verify Identity controller | External — verify | External — verify | `users.create` | Not yet mapped |
| Role assignment | `/users?tab=roles` | `UserRoleAssignments` / Save role assignments | `save` | `apiRequest` | `PUT /api/users/{userId}/roles`; `GET .../effective-permissions` | External — verify Identity controller | Effective authorization service (external — verify) | `user_role_assignments`, `platform_roles`, `role_permissions` (contract supplied externally) | `users.roles.assign` | Not yet mapped |
| User deletion request | Users sensitive actions | `SensitiveUserActions` / Permanently Delete | `requestDeletion` | `apiRequest` | `POST /api/users/{userId}/permanent-deletion` | External — verify Identity controller | External approval workflow — verify | External — verify | `users.delete` | Not yet mapped |
| User deletion approval | `/audit` | `ApprovalPanel` / Final Delete, Approve, Reject | `submit` | `apiRequest` | `/api/approvals/*` through `/api/backend` | External — verify approval controller | External approval workflow — verify | External — verify | Effective approval/deletion permission | Not yet mapped |
| Audit Log | `/audit` | `AuditLogPage` / filters, details, export | `load` | `apiRequest` | `GET /api/audit` | External — verify Operations controller | External — verify | External — verify | Audit view capability | Not yet mapped |
| Accessibility controls | Platform shell/profile | account accessibility menu | preference setters | Browser storage/profile API | `PATCH /api/profile` where persisted | External — verify Identity controller | Profile service — external, verify | External — verify | Authenticated user | Not yet mapped |
| Language selection | Login/platform shell/profile | language selector | `changeLanguage` / auth language setter | `apiRequest` where authenticated | `PATCH /api/profile` | External — verify Identity controller | Profile service — external, verify | External — verify | Authenticated user; login selector is public | Not yet mapped |
| Notifications | Platform shell drawer | Bell / Mark read / Mark all read | drawer `load`, `markRead`, `markAll` | `apiRequest` | `GET /api/notifications`; `PATCH /api/notifications/{id}/read`; `POST /api/notifications/read-all` | External — verify Operations controller | External notification fan-out — verify | External — verify | `notifications.view` | Not yet mapped |
| Reports | `/reports` | `ReportCenter` / Export report | `exportWorkbook` | `pageApi`, export BFF | `GET /api/reports`; `GET /api/reports/export.xlsx` | External — verify Operations controller | External report service — verify | External — verify | `reports.view`; `reports.export` | Not yet mapped |

## Proxy boundary

`/api/backend/[...path]` is the generic same-origin BFF. The browser calls
`/api/backend/...`; the route removes that frontend prefix and forwards the authenticated
request to the configured gateway. Specialized BFF routes exist for AI events, report
workbook export, and multipart data import.

## Traceability gaps

- Backend source is not included in this repository, so controller method names, service
  class names, SQL/calculation code, and most physical table names remain to be mapped in
  the backend repository.
- No Jira identifiers were found; all Jira entries remain `Not yet mapped`.
- Facility creation is currently a sequence of canonical calls rather than one atomic
  frontend request; the component reports a partial-hierarchy error if a child call fails.
