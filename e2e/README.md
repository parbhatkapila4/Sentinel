# E2E Tests (Playwright)

## Run

```bash
npm run test:e2e       # headless
npm run test:e2e:ui    # UI mode
npm run test:e2e:headed # headed browsers
```

## Scope

E2E tests target **public pages only** (e.g. homepage, navigation). All tests run without authentication.

**Authenticated E2E tests are skipped** because Clerk auth requires special setup (hosted UI, test users, etc.) and is difficult to automate. **Server Actions and dashboard logic are covered by Vitest integration tests** instead (`src/app/actions/__tests__/deals.test.ts`, `src/lib/__tests__/dealRisk.test.ts`, etc.).
