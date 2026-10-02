# AaharaConnect collaboration rules

This repository uses one Express API and one Supabase-hosted PostgreSQL database. Read `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, and `docs/TEAM_OWNERSHIP.md` before changing cross-module behavior.

## Mandatory boundaries

- Preserve the existing Vite and Expo screens, routes, mock flows, branding, assets, and npm workspace commands unless the task explicitly calls for a change.
- Work only in files owned by the assigned module. Do not edit another team's module or make unrelated formatting changes.
- Do not create another backend, database, ORM, assignment table, vehicle registry, or migration system.
- Volunteer Management owns profiles, availability, and teams; Food and Donor owns donor requests and food facts; Pickup and Logistics owns assignments, reservations, containers, and pickup transitions. Vehicle Tracking and Management owns authorized locations, consent, active trips, and retention. Vehicle Details Maintenance owns the one canonical vehicle/driver registry, specifications, availability, and maintenance. Neither vehicle team owns assignment persistence.
- Module 5 reads current vehicle assignments through Module 3's reviewed projection; it must not store duplicate assigned-volunteer or employee lists. Reuse canonical people. Module 1 owns volunteer contact data; any employee-specific profile must link to a person. Do not add an EMPLOYEE login role without approval.
- Authentication, authorization, database schema and migrations, shared contracts, server configuration, root dependencies, CI, and deployment are centrally owned. Request integration-maintainer review for changes to them.
- Agree on API DTOs, statuses, permissions, and ownership before changing a cross-module interface. Application data must go through Express; never connect a frontend directly to application tables.
- Treat Supabase Auth identity as verified only after server-side token verification. The application role comes from the server database. Client role selectors, IDs, and mock records grant no access.
- Validate requests at the API boundary, authorize each operation, and use database transactions for multi-resource changes. Do not claim food is safe automatically.
- Keep mock-to-API replacement explicit, screen by screen, after endpoint and integration tests pass.
- Run relevant builds, type checks, unit and integration tests. Include UI screenshots for visible changes, migration impact and rollback notes for schema changes, and affected teams in pull requests. Never commit secrets or generated files.

`apps/mobile/AGENTS.md` adds Expo-specific instructions for work in that app.
