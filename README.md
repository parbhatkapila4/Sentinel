# Revenue Sentinel

Enterprise-grade revenue operations platform for tracking sales pipeline health, detecting deal momentum decay, and maintaining comprehensive audit trails of deal activity.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Core Features](#core-features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Database Schema](#database-schema)
- [Security](#security)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Revenue Sentinel addresses a critical gap in revenue operations: the detection of deal momentum decay before it becomes revenue loss. Traditional CRM systems track status changes but fail to capture the absence of activity, leading to silent deal decay. This platform maintains continuous activity monitoring, enabling proactive intervention when deals show signs of stalling.

The system provides comprehensive deal lifecycle management, automated risk assessment, and intelligent action recommendations based on activity patterns and deal characteristics.

## Architecture

Revenue Sentinel is built on a server-first architecture leveraging Next.js App Router with React Server Components. The application follows a three-tier architecture:

- **Presentation Layer**: Next.js 16 with React Server Components and Client Components for interactive UI
- **Application Layer**: Server Actions for type-safe data mutations with built-in authentication checks
- **Data Layer**: PostgreSQL database with Prisma ORM for type-safe database access

### Design Principles

- **Type Safety**: End-to-end TypeScript with Prisma-generated types
- **Security First**: Authentication verified at middleware boundary, enforced at query level
- **Multi-Tenancy**: User-scoped data isolation at the database query level
- **Auditability**: Immutable event records with comprehensive timeline tracking
- **Performance**: Server-side rendering with selective client-side interactivity

## Technology Stack

### Core Framework
- **Next.js 16.1.1**: React framework with App Router, Server Components, and Server Actions
- **React 19.2.3**: UI library with latest concurrent features
- **TypeScript 5**: Static type checking and enhanced developer experience

### Authentication & Authorization
- **Clerk**: Managed authentication service with session management and middleware-based route protection

### Database & ORM
- **PostgreSQL**: Relational database with ACID guarantees
- **Prisma**: Type-safe ORM with automatic query optimization and migration management

### Styling & UI
- **Tailwind CSS 4**: Utility-first CSS framework
- **Motion**: Animation library for smooth UI transitions
- **Lucide React**: Icon library

### Development Tools
- **ESLint**: Code linting and quality enforcement
- **Prisma Studio**: Database management and inspection tool

## Core Features

### Deal Management
- Create, update, and track sales deals with stage, value, and status fields
- Multi-stage pipeline support (Discovery, Qualification, Proposal, Negotiation, Closed Won/Lost)
- Real-time deal value aggregation and pipeline analytics
- Deal risk scoring based on activity patterns and stage duration

### Activity Tracking
- Immutable event records for all deal interactions
- Support for multiple event types (email sent/received, meetings, calls, custom events)
- Automatic `lastActivityAt` timestamp updates
- JSON payload support for extensible event metadata

### Timeline & Audit Trail
- Chronological view of all events for each deal
- Immutable timeline records with UUID-based identifiers
- Metadata preservation for compliance and analysis
- Timezone-aware timestamp handling

### Risk Assessment
- Automated risk scoring algorithm based on:
  - Time since last activity
  - Stage duration
  - Deal value
  - Historical patterns
- Risk level classification (Low, Medium, High)
- Primary risk reason identification
- Action recommendations with urgency levels

### Analytics & Reporting
- Pipeline value aggregation
- Monthly revenue trends
- Deal stage distribution
- Risk overview dashboards
- Growth rate calculations

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **PostgreSQL**: Version 12 or higher (Supabase recommended for development)
- **npm**: Version 9.0.0 or higher (or equivalent package manager)

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd sentinel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sentinel?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Application
NODE_ENV="development"
```

### 4. Database Setup

Generate Prisma Client:

```bash
npm run db:generate
```

Apply database schema:

```bash
npm run db:push
```

For production environments, use migrations:

```bash
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable API key | Yes | - |
| `CLERK_SECRET_KEY` | Clerk secret API key | Yes | - |
| `NODE_ENV` | Application environment | No | `development` |

### Database Connection

The `DATABASE_URL` follows the PostgreSQL connection string format:

```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=[schema]
```

For Supabase, the connection string is available in the project settings under Database.

### Clerk Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Configure authentication methods (Email, OAuth providers)
3. Retrieve API keys from the Clerk dashboard
4. Add keys to `.env.local`

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Generate Prisma Client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and apply migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Project Structure

```
sentinel/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── actions/         # Server Actions
│   │   ├── api/             # API routes
│   │   └── [routes]/        # Route handlers
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   └── [features]/      # Feature-specific components
│   ├── lib/                 # Utility functions and helpers
│   └── middleware.ts        # Next.js middleware
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
└── [config files]          # Configuration files
```

### Code Style

- TypeScript strict mode enabled
- ESLint configuration extends Next.js recommended rules
- Prefer Server Components over Client Components
- Use Server Actions for all data mutations
- Follow Next.js App Router conventions

## Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  surname   String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  deals     Deal[]
}
```

### Deal Model

```prisma
model Deal {
  id        String   @id @default(cuid())
  userId    String
  name      String
  stage     String
  value     Int
  createdAt DateTime @default(now())
  actions   Action[]
  user      User     @relation(fields: [userId], references: [id])
  events    DealEvent[]
  timeline  DealTimeline[]
}
```

### DealEvent Model

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

### DealTimeline Model

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

### Action Model

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

## Security

### Authentication

All routes except authentication endpoints are protected by Next.js middleware. Unauthenticated requests are redirected to the sign-in page before reaching application code.

### Authorization

User identity is verified at the authentication boundary and enforced at the database query level. All Prisma queries explicitly filter by `userId`:

```typescript
const deals = await prisma.deal.findMany({
  where: { userId: authenticatedUserId },
});
```

### Data Isolation

Cross-tenant data access is architecturally impossible because:
1. User identity is verified via Clerk session
2. All database queries are scoped by `userId`
3. Server Actions validate authentication before data access
4. No user-controlled identifiers are used in queries

### Security Best Practices

- Environment variables stored in `.env.local` (never committed)
- SQL injection prevention via Prisma parameterized queries
- XSS protection via React's built-in escaping
- CSRF protection via SameSite cookies (Clerk managed)
- Rate limiting recommended for production deployments

## API Reference

### Server Actions

#### `createDeal(formData: FormData)`

Creates a new deal and initializes timeline.

**Parameters:**
- `name: string` - Deal name
- `stage: string` - Pipeline stage
- `value: number` - Deal value in USD

**Returns:** Deal object with calculated risk signals

#### `getAllDeals()`

Retrieves all deals for the authenticated user with risk calculations.

**Returns:** Array of deal objects with risk scores and recommendations

#### `getDealById(dealId: string)`

Retrieves a single deal with full timeline and events.

**Parameters:**
- `dealId: string` - Unique deal identifier

**Returns:** Deal object with events and timeline

#### `updateDealStage(dealId: string, newStage: string)`

Updates deal stage and records timeline event.

**Parameters:**
- `dealId: string` - Unique deal identifier
- `newStage: string` - New pipeline stage

### API Routes

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

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Setup

Ensure all production environment variables are configured:
- `DATABASE_URL` - Production PostgreSQL connection
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Production Clerk key
- `CLERK_SECRET_KEY` - Production Clerk secret
- `NODE_ENV=production`

### Database Migrations

For production deployments, use Prisma migrations:

```bash
npm run db:migrate
```

### Recommended Platforms

- **Vercel**: Optimized for Next.js deployments
- **Railway**: PostgreSQL and Next.js hosting
- **AWS**: EC2 with RDS PostgreSQL
- **Google Cloud**: Cloud Run with Cloud SQL

### Performance Considerations

- Enable Next.js Image Optimization
- Configure CDN for static assets
- Enable database connection pooling
- Monitor query performance via Prisma logging
- Implement caching strategies for frequently accessed data

## Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with appropriate tests
3. Ensure all linting passes: `npm run lint`
4. Update documentation as needed
5. Submit pull request with clear description

### Code Standards

- Follow TypeScript strict mode
- Write self-documenting code with clear variable names
- Add JSDoc comments for public APIs
- Maintain test coverage for critical paths
- Follow existing code style and patterns

## License

Proprietary - All rights reserved

---

**Revenue Sentinel** - Enterprise Revenue Operations Platform

For technical support or inquiries, contact the development team.
