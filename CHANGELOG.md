# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) where applicable.

## [Unreleased]

- (Upcoming changes go here.)

## [0.1.0] - 2026-01-30

### Added

- **Rate limiting**: API rate limiting (Redis-backed where configured).
- **Monitoring**: Sentry integration for error and performance monitoring.
- **Caching**: Redis-backed cache for deal lists and risk summaries (`withCache`, short TTL per user).
- **Error handling**: Centralized error types and handling; DB connection retry and pool handling.
- **Security**: Audit logging for deal and team actions; Content-Security-Policy and security headers (CSP, HSTS, etc.).
- **Real-time events**: SSE stream at `/api/events` and `useRealtime` hook for live deal/notification updates.
- **Documentation**:
  - [ARCHITECTURE.md](ARCHITECTURE.md) — System overview, tech stack, directory structure, data flow, caching, security.
  - [DEPLOYMENT.md](DEPLOYMENT.md) — Prerequisites, local setup, Vercel deployment, env vars, post-deploy checks.
  - [CONTRIBUTING.md](CONTRIBUTING.md) — How to run locally, branch naming, PR checks, code style.
  - [docs/API.md](docs/API.md) — API index and links to full OpenAPI spec at `/api-docs`.
  - [CHANGELOG.md](CHANGELOG.md) — This file.

### Changed

- (No notable changes in this release.)

### Fixed

- (No notable fixes in this release.)

### Security

- Audit logging for sensitive deal and team operations.
- CSP and security headers in Next.js config; request size limit in middleware.

---

For setup and usage, see [README](README.md). For API details, see [API Reference](/api-docs) and [docs/API.md](docs/API.md).
