# Revenue Sentinel

An internal revenue-operations system that tracks sales deals, records activity events, and maintains an auditable timeline of deal momentum.

## Why This Exists

Revenue teams lose deals to silent decay. Deals stall without visible warning signs, and by the time a CRM shows "stale," the opportunity is often unrecoverable. Traditional CRMs track status changes but miss the absence of activity. Spreadsheets lack the structure to detect patterns across deals.

This system addresses the gap between deal creation and deal closure by maintaining a continuous record of deal activity, enabling early detection of momentum loss before it becomes revenue loss.

## What the System Does

- **Deal lifecycle tracking**: Users create and manage deals with stage, value, and status fields
- **Event ingestion**: Records activity events (emails sent/received, meetings held) against deals
- **User-scoped data model**: All deals and events are isolated by authenticated user
- **Auditable activity timeline**: Chronological view of all events for each deal
- **Activity timestamping**: Automatically updates deal `lastActivityAt` when events are recorded

## System Architecture

**Next.js 14 (App Router)**: Server-first architecture with React Server Components for data fetching and server actions for mutations. Chosen for type-safe server/client boundaries and built-in optimizations.

**Clerk Authentication**: Handles user authentication, session management, and middleware-based route protection. Eliminates custom auth implementation and security maintenance burden.

**Prisma ORM + PostgreSQL**: Type-safe database access with automatic query optimization. PostgreSQL provides ACID guarantees and relational integrity for deal-event relationships.

**Server Actions**: All data mutations occur server-side via Next.js server actions, ensuring authentication checks and data validation happen before database access.

**Tailwind CSS**: Utility-first styling for rapid UI development without design system overhead.

## Data Model

**Deals**: Core entity representing a sales opportunity. Contains name, stage, value, status, and timestamp of last activity. Each deal belongs to a single user.

**Events**: Immutable records of activity against deals. Types include email_received, email_sent, and meeting_held. Events contain a JSON payload for extensibility and maintain a timestamp for chronological ordering.

**Actions**: Planned intervention points for deal recovery. Represents recommended or automated actions (follow-up emails, meeting scheduling) with status tracking. Currently defined in schema but not yet implemented in application logic.

**Users**: Authenticated users synced from Clerk. Created automatically on first authentication and serve as the root of all data scoping.

## Security & Multi-Tenancy

All database queries are scoped by `userId` obtained from the authenticated Clerk session. Server actions verify authentication before any database access. Prisma queries explicitly filter by `userId` in every `where` clause.

Middleware protects all routes except authentication endpoints. Unauthenticated requests are redirected before reaching application code. Cross-tenant data access is architecturally impossible because user identity is verified at the authentication boundary and enforced at the query level.

## Local Development

**Prerequisites**: Node.js 18+, PostgreSQL database (Supabase recommended)

**Setup**:

1. Install dependencies: `npm install`
2. Generate Prisma Client: `npm run db:generate`
3. Create `.env.local` with:
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: From Clerk dashboard
   - `CLERK_SECRET_KEY`: From Clerk dashboard
4. Run database migrations: `npm run db:push`
5. Start development server: `npm run dev`

The application will be available at ``.

## Project Status

This is an actively developed internal system. The current implementation provides deal management and event ingestion. Intelligence layers for risk detection and automated actions are added incrementally as patterns emerge from production usage.
