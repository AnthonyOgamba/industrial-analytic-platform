# Important button inventory

This inventory covers presentation and business actions, not decorative icon-only controls.
Permissions reflect checks visible in frontend code; the backend remains authoritative.

| Visible Button Text | Page | File | Handler | API/Action | Permission | Success Result | Failure Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sign In | Login | `components/auth/login-form.tsx` | `submit` | `POST /api/auth/login`, then session GET | Public | Redirect to password change or destination | Inline generic login error |
| Create Facility | Operations | `components/facilities/backend-facilities-workspace.tsx` | facility dialog `submit` | Create facility, halls, lines, stations | Effective facility create capability | Hierarchy reloads | Error identifies possible partial hierarchy |
| Create Asset | Assets | `components/assets/canonical-asset-form.tsx` | `submit` | `POST /api/backend/assets` | `assets.create` | Modal closes and assets reload | Inline form error |
| Create Sensor | Sensors | `components/sensors/sensors-page.tsx` | `submit` | `POST /api/backend/sensors/catalog` | `sensors.create` | Catalog reloads | Inline form error |
| Create Downtime | Downtime | `components/downtime/downtime-page.tsx` | downtime `submit` | `POST /api/backend/downtime/events` | `downtime.create` | Events reload | Inline form error |
| Generate Data | Olive AI | `components/local-ai/data-generation-panel.tsx` | `create` | `dataGeneratorsApi.create` | `generator.use` | Generator inventory/readings reload | Generator error state |
| Ask Olive | Olive AI | `components/local-ai/local-ai-page.tsx` | `send` | `POST /api/backend/ai/chat` | Effective AI page capability | Assistant response appended | Retryable chat error |
| Create User | Users | `components/users/users-page.tsx` | `create` | `POST /api/backend/users` | `users.create` | One-time temporary password shown; users reload | Inline modal error |
| Save role assignments | Users / Roles | `components/users/user-role-assignments.tsx` | `save` | `PUT /api/backend/users/{id}/roles` | `users.roles.assign` | Effective permissions and users reload | Inline assignment error |
| Permanently Delete | Sensitive user actions | `components/users/sensitive-user-actions.tsx` | `requestDeletion` | `POST /api/backend/users/{id}/permanent-deletion` | `users.delete` | Request status displayed | Dialog remains with error |
| Final Delete | Audit & Approvals | `components/audit-log/approval-panel.tsx` | `submit` | Canonical approval/final-action endpoint | Effective delete/approval capability | Queue and history refresh | Inline approval error |
| Approve | Audit & Approvals | `components/audit-log/approval-panel.tsx` | `submit` | Canonical approval endpoint | Effective approval capability | Request moves to service-returned state | Inline approval error |
| Reject | Audit & Approvals | `components/audit-log/approval-panel.tsx` | `submit` | Canonical rejection endpoint | Effective approval capability | Request moves to Rejected | Inline approval error |
| View Cost Impact | Dashboard | `components/dashboard/dashboard.tsx` | opens `OperationalCostDialog` | Client dialog; dialog loads canonical data | `dashboard.view` | Accessible modal opens | Dashboard remains visible |
| Retry | Multiple pages | dashboard/assets/sensors/reports shared patterns | page-specific `load` | Repeats the same canonical GET | Page permission | Current data replaces error | Error state remains; session preserved |
| Refresh | Multiple pages | dashboard, reports, sensors, audit, facilities | page-specific `load` | Repeats canonical GET | Page permission | Latest service data rendered | Existing resilient data/error behavior retained |
| Export report | Reports | `components/reports/report-center.tsx` | `exportWorkbook` | `/api/backend/reports/export.xlsx` | `reports.export` | Browser downloads `.xlsx` | Export error shown |
| Toggle Theme | Platform shell | `components/layout/platform-shell.tsx` | theme setter | Browser preference/local storage | Authenticated shell | Theme class updates | Existing theme retained |
| Accessibility | Platform shell/profile | `components/layout/platform-shell.tsx` | accessibility preference setters | DOM classes and profile preference where supported | Authenticated user | Motion/contrast/text preference applied | Existing accessible defaults retained |
| Language selector | Login/shell/profile | auth language and `PlatformShell` | language setter / `changeLanguage` | Local storage and `PATCH /api/backend/profile` | Public on login; authenticated for profile persistence | Interface language changes | Local selection remains if profile save fails |
| Notifications | Platform shell | `components/layout/platform-shell.tsx` | opens drawer | Drawer loads recipient notifications | `notifications.view` | Drawer opens and unread count can clear | Shell remains usable with notification error |
| Mark all read | Notifications | `components/notifications/notification-drawer.tsx` | `markAll` | `POST /api/backend/notifications/read-all` | `notifications.view` | All current recipient items marked read | Drawer error shown |
| Logout / Log Out | Account/profile | platform shell/profile | logout handler | `POST /api/auth/logout` | Authenticated user | Cookie cleared and login shown | Existing session/error handling applies |

## Search tags

Useful searches: `BUTTON:`, `HANDLER:`, `API:`, `PERMISSION:`, `SESSION:`, and
`ERROR:`. The central feature paths also use `FEATURE:`, `PAGE:`, and `COMPONENT:`.
