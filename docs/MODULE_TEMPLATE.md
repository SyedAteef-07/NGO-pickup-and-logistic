# Adding a future module

Wait until the class agrees on module topics and ownership. Then create one coherent module within the shared backend rather than a separate backend or database.

A module can contain:

```text
server/src/controllers/<resource>.controller.ts   HTTP request/response handling
server/src/services/<resource>.service.ts         Business rules
server/src/repositories/<resource>.repository.ts Database queries
server/src/routes/<resource>.routes.ts            REST route declarations
server/src/types/<resource>.ts                    Backend-only types
```

The controller receives validated input and calls a service. The service coordinates rules and uses a repository for persistence. The repository owns database queries. Routes attach authentication/authorization middleware as required and connect the controller to `/api/v1/<resource>`.

Before implementation, agree on the API contract and decide which request/response types belong in `packages/shared`. Add feature-specific calls next to the centralized client in each frontend. Keep UI state and styling in its own app. Add meaningful tests and document any new environment variables.

These are conceptual paths only. The scaffold intentionally has no real project modules or database schema yet.
