# Development, staging and production setup

## Required services and secrets

Use one Supabase project per environment (development, staging, production) when possible, each with its own PostgreSQL database and Supabase Auth configuration. Enable supported email sign-in and email confirmation. Set the project's URL and publishable key on the Express server; these identify the Auth project but are not an administrator secret. The database connection string is server-only. Never put `DATABASE_URL`, database passwords or Supabase secret/service-role keys in `VITE_` or `EXPO_PUBLIC_` variables. The frontends may later receive only the project URL and publishable key for authentication; their application-data URL remains the Express `/api/v1` URL.

Set `PORT`, `NODE_ENV`, `CORS_ORIGIN`, `DATABASE_URL`, `DATABASE_SSL`, `DATABASE_SSL_CA_PATH`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `LOCATION_RETENTION_DAYS` on the server. The development session-pooler connection was verified with `DATABASE_SSL=true`, the project's downloaded CA certificate, and `rejectUnauthorized=true`. Keep the CA file local or deploy it securely; never disable verification to make a connection pass. `SUPABASE_URL` must be the project API origin (`https://PROJECT_REF.supabase.co`), not the dashboard page. Set `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` for web and the corresponding `EXPO_PUBLIC_*` values for mobile. Only the project API URL and publishable key may be client-visible. Copy workspace `.env.example` files for local development; deploy secrets through the hosting platform, never Git. Use the Supabase Connect panel's server connection or session-pooler URI appropriate for a persistent Node process and keep the pool small. Test staging separately before production.
When using the `pg` client's `DATABASE_SSL` options, do not add conflicting `sslmode` parameters to the URL; provide the trusted CA path if the host certificate needs one.

## Migration procedure

1. Use a separate database and backup for each environment. Confirm the connection target, schema permissions, and extension `btree_gist` availability.
2. Run `npm ci` from the repository root with Node 22.13 or newer.
3. Set the **server** `DATABASE_URL` and SSL settings. From the root run `npm run migrate:status --workspace server`, inspect pending SQL and existing data, then `npm run migrate:up --workspace server`, then `npm run migrate:status --workspace server`. Development currently has `001_core.sql`, `002_modules.sql`, and `003_vehicle_details.sql` applied. Never edit those applied files; staging/production must apply `003` separately after review.
4. Apply to development first, then staging after tests, then production during a reviewed release window. Never run two migration jobs at once; the runner also takes a PostgreSQL advisory lock and records checksums.
5. Applied SQL files are immutable. Correct a defect with a new forward migration; restore from a tested backup if necessary. Review data migrations separately from schema-only changes.

The migration runner uses the repository's `server/db/migrations` directory and the connection string of the current environment. It does not create Supabase projects. The `app` schema is private to Express; do not expose it through Supabase's Data API or place DB credentials in clients. The third migration adds backward-compatible vehicle specifications and maintenance history and guards reservations against inactive vehicles or downtime.

## First administrator

After a trusted maintainer signs up with a **confirmed email**, call `GET /api/v1/me` with their Supabase Auth access token so `app.app_users` creates a DONOR row. An integration maintainer then uses a privileged SQL session against the correct environment to promote **that exact verified `auth_user_id`**:

```sql
UPDATE app.app_users SET role = 'ADMIN', updated_at = now()
WHERE auth_user_id = '<verified-auth-user-uuid>' AND role = 'DONOR';
```

Confirm exactly one row changed and record the bootstrap in the release log. After bootstrap, only an ADMIN may grant VOLUNTEER or ADMIN via `PATCH /api/v1/admin/users/:id/role`; that endpoint writes an audit event. Do not add an environment variable that silently grants admin by email.

## Runtime and pilot checks

Build with `npm run build:shared`, `npm run build:server`, `npm run build:web`; run `npm run check:mobile`, `npm run lint:mobile`, `npm run test:web`, and `npm run test:server`. `GET /api/v1/health` is liveness; `/api/v1/health/ready` checks the database. Monitor request IDs, 5xx/409 rates, pool saturation, auth failures and migration version. Run `npm run prune:locations --workspace server` daily once tracking is enabled; location writers must set `expires_at` using `LOCATION_RETENTION_DAYS` and require active pickup plus consent. No continuous background GPS is required.
The reservation integration test runs only with `TEST_DATABASE_URL` naming a dedicated database ending in `_test` and `ALLOW_TEST_DATABASE_MUTATION=true`; CI supplies an ephemeral `aahara_test` database. Never point it at staging or production.

Before any real-user pilot, complete and test domain endpoints, frontend auth and mock-to-live mappings, donor safety review, assignment transitions, failure recovery, authorization, explicit tracking consent, data retention, backup restore and staging end-to-end flows. This foundation alone is **not** production ready.

The web Settings page and the mobile login screen's separate shared-API action can authenticate with Supabase when their public settings are configured; mobile keeps sessions in Expo-compatible AsyncStorage. The original sign-in and explicit demo path still use local mock data. The web admin screen requires a server-owned ADMIN role for its Auth connection; a DONOR token cannot become ADMIN through client state. Rotate temporary test passwords after use and remove local `SUPABASE_TEST_EMAIL`/`SUPABASE_TEST_PASSWORD` entries when no longer needed.
