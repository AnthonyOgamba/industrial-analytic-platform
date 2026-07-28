# DIVU frontend consolidation checklist

## A. Header and branding

- [x] Preserve existing DIVU logo
- [x] Restore “DIVU Analytics” in authenticated top bar
- [x] Verify responsive layout
- [x] Verify no branding regression on public pages

## B. Remove dummy, mock, and unsupported content

- [x] Inventory all static mock data
- [x] Remove fake notifications and alerts from reachable production pages
- [x] Remove fake governance records from reachable production pages
- [x] Remove fake report templates and schedules from reachable production pages
- [x] Remove fake audit and activity records from reachable production pages
- [x] Remove fabricated financial and operational values from reachable production pages
- [x] Preserve valid empty states and loading states
- [x] Verify every displayed operational record has a real source in the edited/reachable areas

## C. Settings and profile consolidation

- [x] Inspect current Settings page
- [x] Identify supported personal settings
- [x] Move supported personal settings into Profile
- [x] Remove unsupported settings from Profile
- [x] Remove Settings sidebar item
- [x] Redirect old Settings route safely
- [x] Verify profile persistence
- [x] Verify language selection persistence
- [x] Verify no broken Settings links remain

## D. User lifecycle

- [x] Add clear enabled/disabled status
- [x] Add Disable action
- [x] Add Enable action
- [x] Add permanent deletion action
- [x] Add destructive confirmation dialog
- [ ] Require explicit `DELETE` confirmation phrase
- [x] Integrate deletion approval status
- [x] Prevent self-deletion in UI
- [x] Handle last-super-admin restriction through backend enforcement and UI explanation
- [x] Refresh user data after mutations
- [x] Remove all frontend-only fake lifecycle behavior

## E. User & Access Management information architecture

- [x] Create User & Access Management navigation group
- [x] Place Users under the group
- [x] Place Roles under the group
- [x] Add or map Permissions
- [x] Add or map Access Assignments
- [x] Add or map Access Requests
- [x] Remove duplicate navigation items
- [x] Verify permissions control visibility
- [x] Verify mobile navigation structure

## F. Security Operations and API Security

- [x] Inventory Security Operations features
- [x] Inventory API Security features
- [x] Merge shared components
- [x] Create required tabs
- [x] Remove duplicate cards
- [x] Remove duplicate alerts
- [x] Remove API Security sidebar item
- [x] Redirect old API Security route
- [x] Verify real data sources
- [x] Verify permission-based access
- [x] Verify empty states
- [x] Verify mobile tab behavior

## G. Data Governance

- [x] Keep Data Governance separate
- [x] Retain governance policy registry
- [x] Remove static governance sample records from reachable page
- [x] Add consistent unsupported-capability empty state
- [x] Remove repeated duplicate warnings
- [x] Keep future domains clearly separated
- [ ] Verify policy create/edit/delete against confirmed API
- [x] Verify governance audit links

## H. Audit Log

- [x] Keep Audit Log separate
- [x] Add recent security events link
- [x] Add recent governance activity link
- [x] Remove static page-level activity records from reachable pages
- [ ] Add useful audit filters
- [x] Connect user lifecycle actions through backend audit
- [x] Connect approval actions through backend audit
- [x] Connect asset/sensor/downtime actions through backend audit
- [x] Verify pagination and empty states

## I. Report Center

- [x] Remove fake report templates
- [x] Remove fake report schedules
- [x] Remove unsupported scheduling controls
- [x] Keep real report history
- [x] Keep real Excel export
- [x] Align export scope wording
- [x] Remove unsupported sheet selection
- [ ] Verify export download
- [x] Verify empty and error states

## J. Navigation result

- [x] Update sidebar groups
- [x] Remove standalone API Security
- [x] Remove standalone Settings
- [x] Keep all unrelated routes
- [x] Verify route redirects
- [x] Verify role visibility
- [x] Verify no broken links in edited navigation

## K. Accessibility and UX

- [x] Keyboard-accessible control review
- [x] Dialog accessibility review
- [x] Tab accessibility test
- [x] Status badge accessibility review
- [x] Mobile layout review
- [x] Screen-reader labels review

## L. Verification

- [x] Run lint
- [x] Run build
- [x] Verify admin login, dashboard, session, navigation, and affected pages
- [x] Verify manager login, dashboard, session, navigation, and affected pages
- [x] Verify viewer login, dashboard, session, navigation, and affected pages
- [x] Verify unchanged production pages remain available through production build
- [x] Final review of all checked and blocked items

## Blocked or intentionally unchecked

- Permanent deletion still requires the selected username rather than the literal `DELETE`; changing the existing sensitive-action dialog safely requires a focused follow-up.
- Governance policy create/edit/delete and report download were not mutated during verification to avoid creating or deleting production-like records.
- Audit filters beyond the existing approval/status and page filters require a confirmed filter contract.

## M. User & Access Management correction

- [x] Keep Users as the only User & Access Management sidebar item
- [x] Remove Roles sidebar item
- [x] Remove Permissions sidebar item
- [x] Remove Access Assignments sidebar item
- [x] Remove Access Requests sidebar item
- [x] Keep Users tab
- [x] Add one combined Roles and Permissions tab
- [x] Remove Access Assignments tab
- [x] Remove Access Requests tab
- [x] Redirect old Roles route
- [x] Redirect old Permissions route
- [x] Redirect old Access Assignments route
- [x] Redirect old Access Requests route
- [x] Remove obsolete access-management workspace shell
- [x] Preserve existing backend routes
- [ ] Verify admin access with a live authenticated account
- [ ] Verify manager access with a live authenticated account
- [ ] Verify viewer restrictions with a live authenticated account
- [x] Verify mobile navigation structure
- [x] Verify no redirect loops in the production route build
