# API guidelines

## Paths and methods

All endpoints use `/api/v1/<plural-resource>`. Use lowercase resource names and IDs in path segments. Add `/api/v2` only for a breaking contract change.

| Method | Meaning | Typical success |
| --- | --- | --- |
| `GET` | Read a resource or collection | `200` |
| `POST` | Create a resource | `201` |
| `PATCH` | Change selected fields | `200` |
| `DELETE` | Remove a resource | `204` when no body is returned |

Use `400` for malformed input, `401` for missing authentication, `403` for forbidden actions, `404` for missing resources, `409` for conflicts, and `500` for unexpected server failures. A `204` response has no JSON body; other responses follow the envelopes below.

## Response envelopes

Success:

```json
{ "success": true, "data": { "id": "example-id" } }
```

Error:

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "A readable explanation." } }
```

Error `code` is stable for client logic; `message` explains the issue to a person. Never leak stack traces or database errors to clients. Use `packages/shared` for contracts that web, mobile, and server all need.

## Adding an endpoint

1. Agree on the path, request shape, response shape, and ownership with the other teams.
2. Add or update generic/shared types when multiple workspaces use them.
3. Add a route in the owning `server/src/modules/<module>/routes.ts`; keep HTTP concerns in a controller. Shared auth and health routes remain in `server/src/routes`.
4. Put business rules in a service and database access in a repository.
5. Add validation, authorization where needed, error cases, and tests for the behavior.
6. Use the web/mobile API clients for frontend integration and update this documentation if conventions change.

The foundation implements `GET /api/v1/health/ready`, `GET /api/v1/me`, and `PATCH /api/v1/admin/users/:id/role`. Module 3 also implements the read-only, ADMIN-only `GET /api/v1/vehicles/:id/assignments` projection. Five module boundaries are mounted; the other domain endpoints remain unimplemented. See `API_CONTRACTS.md` for approved DTOs, authorization and planned endpoints. Do not describe a planned endpoint as implemented.
