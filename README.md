# AaharaConnect

AaharaConnect is a college food-rescue project. This repository currently includes two working frontend prototypes: a coordinator web dashboard and a volunteer/donor mobile app. They use local mock data today. The API scaffold is ready for future teams to connect both apps to one backend and one database.

## Repository map

```text
apps/web/        Vite + React + TypeScript coordinator prototype
apps/mobile/     Expo + React Native + Expo Router prototype
server/          Express + TypeScript API scaffold
packages/shared/ Generic TypeScript API response contracts
docs/            Architecture, API rules, and module guide
.github/         Pull request template
```

The web and mobile apps are preserved as separate workspaces. Their existing screens, styles, routes, mock data, and local interactions remain in place. No production API or database is connected yet.

## Prerequisites

- Node.js 22.13 or newer and npm
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

Health check: `GET http://localhost:4000/api/v1/health`.

## Check builds

```bash
npm run build:web
npm run build:server
npm run check:mobile
npm run lint:mobile
npm run test:web
```

The web prototype also supports `npm run preview --workspace apps/web` after its build. The API production command is `npm run start --workspace server` after `npm run build:server`.

## Environment setup

Copy each example into that same workspace, then adjust values:

```text
server/.env.example       → server/.env
apps/web/.env.example     → apps/web/.env
apps/mobile/.env.example  → apps/mobile/.env
```

The root [.env.example](.env.example) is a reference list. The server reads `PORT`, `NODE_ENV`, `CORS_ORIGIN`, and the reserved optional `DATABASE_URL`. The web API client reads `VITE_API_BASE_URL`; the mobile API client reads `EXPO_PUBLIC_API_BASE_URL`. Both URLs should end at `/api/v1`. For Expo on a physical phone, replace `localhost` with your computer's LAN address reachable by that phone. Do not put secrets in `VITE_` or `EXPO_PUBLIC_` variables because they are exposed to the client.

The current UI still uses mock state. Setting API URLs does not turn on backend integration by itself; future modules should use the centralized clients in `apps/web/src/api/` and `apps/mobile/src/api/`.

## Working together

Feature work starts from `develop`, goes into `feature/<name>` branches, and reaches `main` after integration and testing. See [CONTRIBUTING.md](CONTRIBUTING.md). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API_GUIDELINES.md](docs/API_GUIDELINES.md), and [docs/MODULE_TEMPLATE.md](docs/MODULE_TEMPLATE.md) before adding a new module.

The original web prototype's demo instructions are in [apps/web/README.md](apps/web/README.md).
