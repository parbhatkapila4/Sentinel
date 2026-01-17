<div align="center">

# Sentinel

**Enterprise Revenue Operations Intelligence Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

*Proactive deal momentum detection and revenue intelligence for enterprise sales operations*

---

</div>

## Executive Summary

Sentinel is an enterprise-grade revenue operations platform engineered to solve a critical blind spot in modern sales management: **silent deal decay**. Traditional CRM systems track status changes but fail to detect the absence of activity, resulting in preventable revenue loss.

This platform provides continuous deal lifecycle monitoring, automated risk assessment, and intelligent intervention recommendations—enabling revenue teams to act before deals stall.

**Core Value Proposition:** Transform reactive deal management into proactive revenue protection through real-time activity monitoring and predictive risk analytics.

---

## Architecture Overview

### System Design Philosophy

Sentinel is architected on a **server-first paradigm** leveraging Next.js 16 App Router with React Server Components. The system implements a three-tier architecture with strict separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│              Presentation Layer                         │
│  Next.js 16 + React Server Components + Client UI       │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│              Application Layer                          │
│  Server Actions + Type-Safe Mutations + Auth Boundary   │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│              Data Layer                                 │
│  PostgreSQL + Prisma ORM + Type-Safe Queries            │
└─────────────────────────────────────────────────────────┘
```

### Architectural Principles

| Principle | Implementation |
|-----------|---------------|
| **Type Safety** | End-to-end TypeScript with Prisma-generated types ensuring compile-time correctness |
| **Security First** | Authentication verified at middleware boundary, enforced at query level with zero-trust data access |
| **Multi-Tenancy** | User-scoped data isolation at database query level with architectural guarantees |
| **Auditability** | Immutable event records with comprehensive timeline tracking for compliance |
| **Performance** | Server-side rendering with selective client-side interactivity for optimal UX |

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework with App Router, Server Components, and Server Actions |
| **React** | 19.2.3 | UI library with concurrent rendering features |
| **TypeScript** | 5.x | Static type checking and enhanced developer experience |

### Infrastructure

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Authentication** | Clerk | Managed authentication with session management and middleware-based route protection |
| **Database** | PostgreSQL | ACID-compliant relational database with robust transaction support |
| **ORM** | Prisma | Type-safe database access with automatic query optimization and migration management |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework for rapid, maintainable UI development |
| **Animation** | Motion | High-performance animation library for smooth UI transitions |

---

## Core Capabilities

### 1. Deal Lifecycle Management

- **Multi-stage Pipeline Support**: Discovery → Qualification → Proposal → Negotiation → Closed Won/Lost
- **Real-time Value Aggregation**: Live pipeline analytics with stage-based value distribution
- **Intelligent Risk Scoring**: Algorithmic assessment based on activity patterns, stage duration, and deal characteristics
- **Automated Status Tracking**: Continuous monitoring of deal progression with stage transition detection

### 2. Activity Intelligence

- **Immutable Event Records**: Complete audit trail of all deal interactions with cryptographic integrity
- **Multi-event Type Support**: Email (sent/received), meetings, calls, custom events with extensible metadata
- **Automatic Timestamp Management**: Self-updating `lastActivityAt` fields with timezone-aware handling
- **JSON Payload Architecture**: Extensible event metadata system for future-proof customization

### 3. Timeline & Audit Trail

- **Chronological Event View**: Immutable timeline records with UUID-based identifiers
- **Metadata Preservation**: Complete event context retention for compliance and forensic analysis
- **Timezone Intelligence**: Accurate timestamp handling across global operations
- **Query Optimization**: Indexed timeline queries for sub-100ms response times

### 4. Predictive Risk Assessment

**Risk Scoring Algorithm** evaluates multiple signals:

- **Temporal Decay**: Time since last activity (exponential decay weighting)
- **Stage Duration**: Time-in-stage analysis with stage-specific thresholds
- **Deal Value**: High-value deal prioritization with weighted risk factors
- **Historical Patterns**: Machine-learning-ready pattern recognition for predictive insights

**Risk Classification:**
- **Low**: Normal progression, no intervention required
- **Medium**: Attention recommended, proactive engagement suggested
- **High**: Immediate action required, deal at risk of stalling

**Action Recommendations** include urgency levels and suggested intervention strategies.

### 5. Analytics & Intelligence

- **Pipeline Value Analytics**: Real-time aggregation across all stages
- **Monthly Revenue Trends**: Time-series analysis with growth rate calculations
- **Stage Distribution Metrics**: Deal concentration analysis by pipeline stage
- **Risk Overview Dashboards**: Executive-level visibility into deal health
- **Growth Rate Calculations**: YoY and MoM comparison analytics

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18.0.0
- **PostgreSQL** ≥ 12.0 (Supabase recommended for development)
- **npm** ≥ 9.0.0

### Installation

```bash
# Clone repository
git clone <repository-url>
cd sentinel

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Initialize database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

Application available at `http://localhost:3000`

### Environment Configuration

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Application
NODE_ENV="development"
```

**Clerk Setup:**
1. Create application at [clerk.com](https://clerk.com)
2. Configure authentication methods (Email, OAuth providers)
3. Retrieve API keys from dashboard
4. Add keys to `.env.local`

---

## Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Production build with optimization
npm run start        # Start production server
npm run lint         # Run ESLint code quality checks
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema changes to database
npm run db:migrate   # Create and apply migration
npm run db:studio    # Open Prisma Studio (database GUI)
```

### Project Structure

```
sentinel/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── actions/            # Server Actions (type-safe mutations)
│   │   ├── api/                # API route handlers
│   │   └── [routes]/           # Page routes
│   ├── components/             # React component library
│   │   ├── ui/                 # Reusable UI primitives
│   │   └── [features]/         # Feature-specific components
│   ├── lib/                    # Core utilities and helpers
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── dealRisk.ts         # Risk calculation engine
│   │   └── timeline.ts          # Timeline management
│   └── middleware.ts           # Next.js middleware (auth boundary)
├── prisma/
│   └── schema.prisma           # Database schema definition
└── public/                     # Static assets
```

### Code Standards

- **TypeScript Strict Mode**: Enabled with zero implicit `any`
- **ESLint Configuration**: Extends Next.js recommended rules with custom enforcement
- **Component Architecture**: Prefer Server Components; Client Components only when necessary
- **Data Mutations**: All mutations via Server Actions with built-in authentication
- **Conventions**: Follow Next.js App Router patterns and React Server Component best practices

---

## Database Schema

### Core Models

**User**
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  surname   String
  email     String   @unique
  password  String   @db.VarChar(255)
  createdAt DateTime @default(now())
  deals     Deal[]
}
```

**Deal**
```prisma
model Deal {
  id        String   @id @default(cuid())
  userId    String
  name      String
  stage     String
  value     Int
  createdAt DateTime @default(now())
  actions   Action[]
  events    DealEvent[]
  timeline  DealTimeline[]
  user      User     @relation(fields: [userId], references: [id])
}
```

**DealEvent** (Activity Tracking)
```prisma
model DealEvent {
  id        String   @id @default(cuid())
  dealId    String
  type      String
  payload   Json
  createdAt DateTime @default(now())
  deal      Deal     @relation(fields: [dealId], references: [id])
}
```

**DealTimeline** (Immutable Audit Trail)
```prisma
model DealTimeline {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  dealId    String    @map("deal_id")
  eventType String    @map("event_type")
  metadata  Json?
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)
  deal      Deal      @relation(fields: [dealId], references: [id])
  
  @@map("DealTimeline")
}
```

**Action** (Risk Recommendations)
```prisma
model Action {
  id        String   @id @default(cuid())
  dealId    String
  type      String
  status    String
  reason    String
  createdAt DateTime @default(now())
  deal      Deal     @relation(fields: [dealId], references: [id])
}
```

---

## Security Architecture

### Authentication & Authorization

**Multi-Layer Security Model:**

1. **Middleware Boundary**: All routes (except auth endpoints) protected by Next.js middleware
2. **Session Validation**: Clerk-managed session verification before request processing
3. **Query-Level Enforcement**: All Prisma queries explicitly scoped by `userId`
4. **Server Action Validation**: Authentication checks in all data mutation endpoints

### Data Isolation

**Zero-Trust Multi-Tenancy:**

Cross-tenant data access is architecturally impossible through:

```typescript
// Example: User-scoped query pattern
const deals = await prisma.deal.findMany({
  where: { userId: authenticatedUserId }, // Enforced at query level
});
```

**Security Guarantees:**
- User identity verified via Clerk session (cryptographic validation)
- All database queries scoped by `userId` (no user-controlled identifiers)
- Server Actions validate authentication before data access
- No direct database access from client components

### Security Best Practices

- **Environment Variables**: Stored in `.env.local` (never committed to version control)
- **SQL Injection Prevention**: Prisma parameterized queries eliminate injection vectors
- **XSS Protection**: React's built-in escaping with Content Security Policy headers
- **CSRF Protection**: SameSite cookies managed by Clerk authentication service
- **Rate Limiting**: Recommended for production deployments (implement at edge/CDN level)

---

## API Reference

### Server Actions

#### `createDeal(formData: FormData)`

Creates a new deal and initializes timeline tracking.

**Parameters:**
- `name: string` - Deal identifier
- `stage: string` - Initial pipeline stage
- `value: number` - Deal value in USD

**Returns:** `Deal` object with calculated risk signals and initial timeline entry

---

#### `getAllDeals()`

Retrieves all deals for authenticated user with real-time risk calculations.

**Returns:** `Deal[]` array with risk scores, recommendations, and activity metadata

---

#### `getDealById(dealId: string)`

Retrieves single deal with complete timeline and event history.

**Parameters:**
- `dealId: string` - Unique deal identifier (UUID)

**Returns:** `Deal` object with nested `events[]` and `timeline[]` arrays

---

#### `updateDealStage(dealId: string, newStage: string)`

Updates deal stage and records immutable timeline event.

**Parameters:**
- `dealId: string` - Unique deal identifier
- `newStage: string` - Target pipeline stage

**Returns:** Updated `Deal` object with new timeline entry

---

### REST API Endpoints

#### `GET /api/auth/me`

Returns authenticated user information.

**Response:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "surname": "string",
    "email": "string"
  }
}
```

---

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Ensure all production environment variables are configured:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Production PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Production Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Production Clerk secret key | Yes |
| `NODE_ENV` | Set to `production` | Yes |

### Database Migrations

For production deployments, use Prisma migrations:

```bash
npm run db:migrate
```

### Recommended Platforms

| Platform | Rationale |
|----------|-----------|
| **Vercel** | Optimized for Next.js with zero-config deployment |
| **Railway** | Integrated PostgreSQL and Next.js hosting |
| **AWS** | EC2 with RDS PostgreSQL for enterprise scale |
| **Google Cloud** | Cloud Run with Cloud SQL for serverless architecture |

### Performance Optimization

- **Image Optimization**: Enable Next.js Image Optimization for static assets
- **CDN Configuration**: Configure CDN for global static asset delivery
- **Connection Pooling**: Enable database connection pooling (PgBouncer recommended)
- **Query Monitoring**: Monitor query performance via Prisma logging
- **Caching Strategy**: Implement Redis caching for frequently accessed data

---

## Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with appropriate type safety
3. Ensure all linting passes: `npm run lint`
4. Update documentation as needed
5. Submit pull request with comprehensive description

### Code Standards

- **TypeScript Strict Mode**: Zero tolerance for `any` types
- **Self-Documenting Code**: Clear variable names and function signatures
- **JSDoc Comments**: Required for all public APIs
- **Test Coverage**: Maintain coverage for critical business logic paths
- **Style Consistency**: Follow existing code patterns and conventions

---

## License

**MIT License** - Copyright (c) 2026 Sentinel

See [LICENSE](LICENSE) file for full license text.

---

<div align="center">

**Sentinel** Enterprise Revenue Operations Intelligence Platform

*Engineered for precision. Built for scale.*

For technical inquiries: parbhat@parbhat.dev

</div>
