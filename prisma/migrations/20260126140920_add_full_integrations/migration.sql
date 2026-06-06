ALTER TABLE "Deal" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "source" TEXT;

ALTER TABLE "GoogleCalendarIntegration" ADD COLUMN     "lastSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastSyncStatus" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "calendarId" SET NOT NULL;

ALTER TABLE "HubSpotIntegration" ADD COLUMN     "lastSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastSyncStatus" TEXT,
ADD COLUMN     "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "syncErrors" TEXT,
ADD COLUMN     "totalSynced" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "SalesforceIntegration" ADD COLUMN     "lastSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastSyncStatus" TEXT,
ADD COLUMN     "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "syncErrors" TEXT,
ADD COLUMN     "totalSynced" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "IntegrationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "integration" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealId" TEXT,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "attendees" TEXT[],
    "location" TEXT,
    "meetingLink" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IntegrationLog_userId_integration_idx" ON "IntegrationLog"("userId", "integration");

CREATE INDEX "IntegrationLog_createdAt_idx" ON "IntegrationLog"("createdAt");

CREATE INDEX "Meeting_userId_idx" ON "Meeting"("userId");

CREATE INDEX "Meeting_dealId_idx" ON "Meeting"("dealId");

CREATE INDEX "Meeting_startTime_idx" ON "Meeting"("startTime");

CREATE INDEX "Meeting_externalId_idx" ON "Meeting"("externalId");

CREATE INDEX "Deal_externalId_idx" ON "Deal"("externalId");

ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
