# Foundation change inventory

This inventory records the files changed for the approved shared-foundation task on the `handoff` branch. Domain CRUD and frontend mock-to-live integration remain future work.

## Created

```text
.github/CODEOWNERS
.github/workflows/ci.yml
AGENTS.md
apps/mobile/src/api/auth.ts
apps/web/src/api/auth.ts
docs/API_CONTRACTS.md
docs/DATA_MODEL.md
docs/DEPLOYMENT.md
docs/FOUNDATION_CHANGELOG.md
docs/TEAM_OWNERSHIP.md
docs/WORKFLOW_STATES.md
packages/shared/src/contracts/auth.ts
packages/shared/src/contracts/common.ts
packages/shared/src/contracts/food.ts
packages/shared/src/contracts/pickups.ts
packages/shared/src/contracts/vehicles.ts
packages/shared/src/contracts/volunteers.ts
server/db/migrations/001_core.sql
server/db/migrations/002_modules.sql
server/src/auth/appUsers.ts
server/src/auth/supabase.ts
server/src/db/migrate.ts
server/src/db/pool.ts
server/src/db/pruneLocations.ts
server/src/middleware/authenticate.ts
server/src/middleware/authorize.ts
server/src/middleware/validate.ts
server/src/modules/food/routes.ts
server/src/modules/pickups/routes.ts
server/src/modules/vehicles/routes.ts
server/src/modules/volunteers/routes.ts
server/src/routes/auth.ts
server/src/test/api.test.ts
server/src/test/contracts.test.ts
server/test/reservations.integration.test.ts
```

## Modified

```text
.env.example
.github/pull_request_template.md
CONTRIBUTING.md
README.md
apps/mobile/.env.example
apps/web/.env.example
docs/API_GUIDELINES.md
docs/ARCHITECTURE.md
docs/MODULE_TEMPLATE.md
package-lock.json
package.json
packages/shared/package.json
packages/shared/src/index.ts
packages/shared/tsconfig.json
server/.env.example
server/package.json
server/src/app.ts
server/src/config/env.ts
server/src/middleware/errorHandler.ts
server/src/middleware/notFound.ts
server/src/routes/health.ts
server/src/routes/index.ts
server/src/server.ts
server/src/utils/response.ts
```

No existing web page, mobile screen, route, asset, or mock dataset was changed. No commit or push was made.

## Supabase verification and five-module follow-up

The development session-pooler connection passed a certificate-verified `SELECT 1` using the configured CA. Existing `001_core.sql` and `002_modules.sql` checksums matched the development ledger and their tables/overlap constraints were present. A forward-only `003_vehicle_details.sql` migration was then reviewed and applied; the migration status command reports all three applied. A rollback-only development transaction verified maintenance/status and downtime/reservation conflicts in both directions, plus the canonical assignment projection; follow-up counts confirmed no vehicle or assignment probe rows remained. No production database was accessed.

The configured Auth URL initially pointed to a dashboard page; the ignored local server `.env` was corrected to the matching project API origin. A confirmed development identity signed in successfully, `GET /me` returned the server-owned DONOR role, and a donor role-change attempt was denied. The first-admin SQL was dry-run and rolled back. Live ADMIN and VOLUNTEER sessions were unavailable, so those live role cases remain for integration testing. The web Settings page and mobile login now have optional Supabase Auth flows, while original demo sign-in and business data remain mocked.

Module 4 now has the separate `server/src/modules/tracking` boundary; the original `vehicles` module is Module 5's canonical registry. Module 3 serves a read-only current-assignment projection for a vehicle. Shared contracts, ownership rules and documentation reflect five teams. No complete domain CRUD or dispatch workflow was added.

The tracked `server/.env.example` had been filled with a live-looking development credential in the working tree. It was replaced with placeholders before this task's final validation; the committed `HEAD` example contained no real credential. Temporary Auth test credentials were removed from ignored `server/.env` after verification. Rotate the development database password and the shared temporary Auth test password before merging. Ignored local `.env` files are not part of Git.

### Files touched by this follow-up

- Auth and client configuration: `.env.example`, `server/.env.example`, `apps/web/.env.example`, `apps/mobile/.env.example`, `apps/web/package.json`, `apps/mobile/package.json`, `package-lock.json`, `server/src/auth/supabase.ts`, `apps/web/src/api/auth.ts`, `apps/mobile/src/api/auth.ts`, `apps/web/src/vite-env.d.ts`.
- Existing UI integration: `apps/web/src/pages/Settings.tsx`, `apps/web/src/polish.css`, `apps/web/src/lib/i18n.ts`, `apps/mobile/src/components/common/LoginScreen.tsx`, `apps/mobile/src/context/AppContext.tsx`, `apps/mobile/src/constants/translations.ts`.
- Five-module code and schema: `server/db/migrations/003_vehicle_details.sql`, `server/src/modules/tracking/routes.ts`, `server/src/modules/vehicles/routes.ts`, `server/src/modules/pickups/routes.ts`, `server/src/modules/pickups/vehicleAssignments.ts`, `server/src/routes/index.ts`, `packages/shared/src/contracts/tracking.ts`, `packages/shared/src/contracts/vehicles.ts`, `packages/shared/src/contracts/pickups.ts`.
- Tests: `server/src/test/api.test.ts`, `server/src/test/contracts.test.ts`, `server/src/test/envExamples.test.ts`, `server/src/test/supabase.test.ts`, `server/test/reservations.integration.test.ts`, `server/test/vehicleBoundaries.integration.test.ts`.
- Ownership and documentation: `AGENTS.md`, `.github/CODEOWNERS`, `README.md`, `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, `docs/DATA_MODEL.md`, `docs/DEPLOYMENT.md`, `docs/TEAM_OWNERSHIP.md`, `docs/API_GUIDELINES.md`, `docs/MODULE_TEMPLATE.md`, `docs/FOUNDATION_CHANGELOG.md`.

Ignored local `server/.env`, `apps/web/.env` and `apps/mobile/.env` were also adjusted for this development project. No `.env` file is tracked or should be staged.
