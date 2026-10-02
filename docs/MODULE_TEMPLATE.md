# Implementing an approved module

The five confirmed owners and their server folders are in `TEAM_OWNERSHIP.md`. Add each module within the shared backend rather than a separate backend or database.

A module can add files inside its existing boundary:

```text
server/src/modules/<module>/routes.ts      REST route declarations
server/src/modules/<module>/controller.ts  HTTP request/response handling
server/src/modules/<module>/service.ts     Business rules and reviewed service interface
server/src/modules/<module>/repository.ts  Database queries for that module's tables
server/src/modules/<module>/types.ts       Backend-only types, if needed
```

The controller receives validated input and calls a service. The service coordinates rules and uses a repository for persistence. The repository owns database queries. Routes attach authentication/authorization middleware as required and connect the controller to `/api/v1/<resource>`.

Before implementation, agree on the API contract and add cross-app request/response schemas to `packages/shared` through integration-maintainer review. Add feature-specific calls next to the centralized client in each frontend. Keep UI state and styling in its own app. Add meaningful tests and document any new environment variables.

The `server/src/modules/{volunteers,food,pickups,tracking,vehicles}` folders are the mounted ownership boundaries. Only Module 3's read-only vehicle assignment projection is implemented; domain CRUD and dispatch workflows remain future work. Module 4's `tracking` folder never owns canonical vehicles, and Module 5's `vehicles` folder never persists assignment rosters. All migrations remain centrally owned.
