# Contributing to Sentinel

Thank you for your interest in contributing. This document covers how to get started, branch naming, PR checks, and code style.

## Getting Started

- **Get the repo**: Clone the repository and run locally. For full setup (env vars, database, migrations), see [DEPLOYMENT.md](DEPLOYMENT.md).
- **Quick local run**: `npm install`, copy `.env.example` to `.env.local`, fill required vars, `npx prisma generate`, `npx prisma migrate dev`, `npm run dev`.

## Branch Naming

Use descriptive branches:

- `feature/<name>` — New features
- `fix/<name>` — Bug fixes
- `docs/<name>` — Documentation only

Examples: `feature/export-csv`, `fix/deal-risk-edge-case`, `docs/api-examples`.

## Before Submitting a PR

Run these locally before opening a pull request:

1. **Lint**: `npm run lint`
2. **Tests**: `npm run test` (or `npm run test:run`). Unit tests use Vitest; mocks are in `src/test/mocks/`.
3. **Build**: `npm run build`

Fix any failures. Optionally run E2E tests: `npm run test:e2e` (requires app running and env configured). Run E2E: `npm run test:e2e`.

## PR Guidelines

- **Description**: Clearly describe what changed and why.
- **Issues**: Link to an issue if the PR addresses one (e.g. "Fixes #123").
- **Scope**: Keep changes focused; prefer several small PRs over one large one.
- **Docs**: Update README or other docs if you change setup, APIs, or behavior that users rely on.

## Accessibility

We aim for WCAG 2.1 AA. Use the skip link, keyboard navigation, and screen reader testing when adding or changing UI. See [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md).

## Code Style

- **TypeScript**: Use strict TypeScript; follow existing patterns in `src/`.
- **Formatting**: Use the project’s existing formatter/linter (ESLint is configured; run `npm run lint`).
- **Structure**: Place API routes under `src/app/api/`, core logic in `src/lib/`, reusable UI in `src/components/`. See [ARCHITECTURE.md](ARCHITECTURE.md) for an overview.

## Questions

- **Issues & discussions**: Open a [GitHub Issue](https://github.com/parbhatkapila4/Sentinel/issues) or use GitHub Discussions if the project has them.
- **Docs**: See [README](README.md), [ARCHITECTURE.md](ARCHITECTURE.md), and in-app [Developer Docs](/docs/developers) and [API Reference](/api-docs).
