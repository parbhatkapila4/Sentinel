CREATE TABLE "SalesforceIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "instanceUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SalesforceIntegration_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "HubSpotIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "portalId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HubSpotIntegration_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "GoogleCalendarIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "calendarId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GoogleCalendarIntegration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SalesforceIntegration_userId_key" ON "SalesforceIntegration"("userId");
CREATE INDEX "SalesforceIntegration_userId_idx" ON "SalesforceIntegration"("userId");
CREATE UNIQUE INDEX "HubSpotIntegration_userId_key" ON "HubSpotIntegration"("userId");
CREATE INDEX "HubSpotIntegration_userId_idx" ON "HubSpotIntegration"("userId");
CREATE UNIQUE INDEX "GoogleCalendarIntegration_userId_key" ON "GoogleCalendarIntegration"("userId");
CREATE INDEX "GoogleCalendarIntegration_userId_idx" ON "GoogleCalendarIntegration"("userId");
ALTER TABLE "SalesforceIntegration"
ADD CONSTRAINT "SalesforceIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HubSpotIntegration"
ADD CONSTRAINT "HubSpotIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoogleCalendarIntegration"
ADD CONSTRAINT "GoogleCalendarIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;