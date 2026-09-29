# Architecture

```text
 Web App ─────┐
              ├── REST /api/v1 ──> One Express Backend ──> One relational database (later)
 Mobile App ──┘                         │
        └──── shared TypeScript contracts ┘
```

Both applications must communicate with the **same backend and database**. Today they use independent local mock data while the API has only a health endpoint. Do not add separate web/mobile backends or databases.

| Layer | Responsibility | Location |
| --- | --- | --- |
| Presentation | Screens, forms, navigation, UI state | `apps/web`, `apps/mobile` |
| API/controller | Receive HTTP requests, validate input, choose status codes | `server/src/routes`, `server/src/controllers` |
| Service | Business rules and coordination | `server/src/services` |
| Repository | Database reads and writes | `server/src/repositories` |
| Shared package | Common API contracts, future shared enums/constants | `packages/shared` |
| Database | Persistent project data when a schema is agreed | Future single relational database |

The generic clients at `apps/web/src/api/client.ts` and `apps/mobile/src/api/client.ts` own base URL configuration, JSON parsing, and API errors. Add feature-specific calls there later; do not scatter `fetch` calls through components. Shared contracts should describe cross-app wire formats, not force web and mobile to share UI code.

The backend loads and validates environment configuration in `server/src/config/env.ts`. It provides CORS, JSON parsing, request logging, a versioned route group, 404 handling, central error handling, and graceful shutdown. `DATABASE_URL` is reserved but no database library or schema has been chosen. Once selected, initialize one connection in backend infrastructure and access it through repositories and services.

Authentication is still demo-only in the frontends. Future session/token helpers belong in `server/src/utils` or a dedicated infrastructure area, authentication checks in `server/src/middleware`, and role authorization at the route/service boundary. Replace the existing mobile demo role selection only when real authentication is designed; do not treat its local state as security.
