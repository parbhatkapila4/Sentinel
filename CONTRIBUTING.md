# Contributing to Sentinel

Thank you for your interest in contributing. This document covers how to get started, branch naming, PR checks, and code style.

## Getting Started

- **Get the repo**: Clone the repository and run locally. For full setup (env vars, database, migrations), see [DEPLOYMENT.md](DEPLOYMENT.md).
- **Quick local run**: `npm install`, copy `.env.example` to `.env.local`, fill required vars, `npx prisma generate`, `npx prisma migrate dev`, `npm run dev`.

## Branch Naming

Use descriptive branches:

- `feature/<name>` - New features
- `fix/<name>` - Bug fixes
- `docs/<name>` - Documentation only

Examples: `feature/export-csv`, `fix/deal-risk-edge-case`, `docs/api-examples`.

## Before Submitting a PR

Run these locally before opening a pull request:

1. **Mandatory local quality gate**: `npm run verify`
2. **Build (optional but recommended)**: `npm run build`

Fix any failures. E2E tests are optional and should not be treated as a default gate unless explicitly requested: `npm run test:e2e`.

### Optional: manual GitHub Actions

The repo includes a **manual-only** workflow (trigger: `workflow_dispatch`) that runs the same gate as locally: `npm run verify` (same as `npm run verify:ci`). It does **not** run on push or pull request, so commits and PRs stay clean unless you run it. To use it: **GitHub → Actions → “Verify (manual)” → Run workflow**. Prefer passing `npm run verify` on your machine before every push.

### GitHub status checks and the red X

- **This repo’s workflows** do not auto-run on `push` or `pull_request`; nothing in `.github/workflows/` should add a check to every commit by default.
- A **red X on a PR** can still come from **repository settings**, not from these files:
  - **Branch protection → Require status checks**: if a check name is required but no workflow produces it (or the workflow was skipped), GitHub can show failing / pending expectations. Fix: **Settings → Branches → edit the rule → Status checks** — either remove obsolete required checks or align the name with a workflow you actually run.
  - **“No required checks”** means branch protection is not waiting on a specific job; optional Actions you run manually still appear under the Actions tab only when you trigger them.

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
