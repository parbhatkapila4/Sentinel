CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleEventId" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "organizerEmail" TEXT,
    "attendees" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "status" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CalendarEvent_userId_googleEventId_key" ON "CalendarEvent"("userId", "googleEventId");
CREATE INDEX "CalendarEvent_userId_startTime_idx" ON "CalendarEvent"("userId", "startTime");
ALTER TABLE "CalendarEvent"
ADD CONSTRAINT "CalendarEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;