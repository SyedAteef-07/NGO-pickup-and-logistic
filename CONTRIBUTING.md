# Contributing to AaharaConnect

About 20 students may work here at once. Root `AGENTS.md` and `docs/TEAM_OWNERSHIP.md` are mandatory. Agree on a module's API contract and ownership before editing shared files. The integration maintainers own authentication, authorization, shared contracts, migrations, server configuration, root dependencies, CI and deployment.

## Branches

```text
main       Stable, demo-ready code
  ↑
develop    Integration branch
  ↑
feature/<module-or-feature-name>   Team work
```

The repository has `main` and `develop`. Start team feature branches from the current `develop`, and never push feature development directly to `main`.

## Typical workflow

```bash
git checkout develop
git pull origin develop
git checkout -b feature/example-name
# Make focused changes and run relevant checks.
git add .
git commit -m "feat: add example feature"
git push -u origin feature/example-name
```

Open a pull request into `develop`. Ask a teammate to review it, resolve comments, and rerun checks before merging. Promote tested `develop` changes into `main` for demos.

## Team rules

1. Pull the latest `develop` before starting new work.
2. Use descriptive commit messages and focused pull requests.
3. Test the workspace you changed before asking for review; include screenshots for UI changes.
4. Avoid editing another team's module unless you coordinate with them.
5. Never commit secrets, `.env` files, `node_modules`, Expo output, or generated build files.
6. Resolve merge conflicts by understanding both sides; do not blindly accept one side.
7. Add shared request/response contracts to `packages/shared` when multiple workspaces need them.
8. Follow [API contracts](docs/API_CONTRACTS.md), [workflow states](docs/WORKFLOW_STATES.md), and the [module template](docs/MODULE_TEMPLATE.md) for new API modules.
9. Request integration-maintainer review for central files and another team's review when changing its interface. Do not introduce duplicate vehicle, assignment or migration models.
10. Run migration and PostgreSQL integration checks for schema/reservation changes. Preserve mock flows until live endpoints have passed tests.

Run `npm run build:web`, `npm run build:server`, `npm run check:mobile`, and `npm run test:web` when a change could affect more than one workspace.
