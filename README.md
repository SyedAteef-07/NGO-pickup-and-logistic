# AaharaConnect

AaharaConnect is a college food-rescue project. This repository includes two working frontend prototypes: a coordinator web dashboard and a volunteer/donor mobile app. Business screens still use local mock data. The shared Express foundation has verified Supabase Auth token handling, server-owned roles, PostgreSQL migrations and five module boundaries. Only a read-only Module 3 vehicle-assignment projection is implemented; domain CRUD and dispatch workflows are not yet live.

## Repository map

```text
apps/web/        Vite + React + TypeScript coordinator prototype
apps/mobile/     Expo + React Native + Expo Router prototype
server/          Express + TypeScript API foundation and SQL migrations
packages/shared/ Zod and TypeScript API contracts
docs/            Architecture, API rules, and module guide
.github/         Pull request template
```

The web and mobile apps remain separate workspaces with their existing screens, styles, routes and mock interactions. A development Supabase project is connected; production integration is not complete.

## Prerequisites

- Node.js 22.13 or newer within the 22.x line, and npm
- Expo Go or an Android/iOS emulator for mobile testing

## Install

From the repository root:

```bash
npm install
```

This installs all npm workspaces. Use the root lockfile for team installs (`npm ci` in clean checkouts). The mobile app uses a newer React version than the web app; npm keeps each workspace's required version.

## Run

In separate terminals from the repository root:

```bash
npm run web       # Vite at http://localhost:5173
npm run mobile    # Expo dev server; scan its QR code or use an emulator
npm run server    # API at http://localhost:4000/api/v1
```

Health check: `GET http://localhost:4000/api/v1/health`; database readiness: `/api/v1/health/ready`.

## Check builds

```bash
npm run build:web
npm run build:server
npm run check:mobile
npm run lint:mobile
npm run test:web
npm run test:server
```

The web prototype also supports `npm run preview --workspace apps/web` after its build. The API production command is `npm run start --workspace server` after `npm run build:server`.

## Environment setup

Copy each example into that same workspace, then adjust values:

```text
server/.env.example       → server/.env
apps/web/.env.example     → apps/web/.env
apps/mobile/.env.example  → apps/mobile/.env
```

The root [.env.example](.env.example) is a reference list. The server reads `PORT`, `NODE_ENV`, `CORS_ORIGIN`, `DATABASE_URL`, certificate-verified SSL settings, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `LOCATION_RETENTION_DAYS`. Web reads `VITE_API_BASE_URL`, `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; mobile reads the corresponding `EXPO_PUBLIC_*` variables. The API base URLs end at `/api/v1`; the Supabase URLs are project API origins, not dashboard pages. For Expo on a physical phone, replace `localhost` with your computer's reachable LAN address. Never put database credentials or secrets in `VITE_` or `EXPO_PUBLIC_` variables because they are exposed to the client.

The web Settings page and the mobile login screen's separate shared-API action can authenticate with Supabase through centralized Auth adapters. The original mobile sign-in, explicit demo access, and business records stay local until the owning domain APIs and tests exist. See [deployment](docs/DEPLOYMENT.md) for database, migration and first-admin setup, and [team ownership](docs/TEAM_OWNERSHIP.md) for the five-module division.

## Working together

Feature work starts from `develop`, goes into `feature/<name>` branches, and reaches `main` after integration and testing. See [CONTRIBUTING.md](CONTRIBUTING.md). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API_GUIDELINES.md](docs/API_GUIDELINES.md), and [docs/MODULE_TEMPLATE.md](docs/MODULE_TEMPLATE.md) before adding a new module.

Follow root [AGENTS.md](AGENTS.md), [team ownership](docs/TEAM_OWNERSHIP.md), [API contracts](docs/API_CONTRACTS.md), [data model](docs/DATA_MODEL.md), and [workflow states](docs/WORKFLOW_STATES.md). The original web prototype's demo instructions remain in [apps/web/README.md](apps/web/README.md).
