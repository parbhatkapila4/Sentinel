-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "SalesforceIntegration_userId_key" ON "SalesforceIntegration"("userId");

-- CreateIndex
CREATE INDEX "SalesforceIntegration_userId_idx" ON "SalesforceIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HubSpotIntegration_userId_key" ON "HubSpotIntegration"("userId");

-- CreateIndex
CREATE INDEX "HubSpotIntegration_userId_idx" ON "HubSpotIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarIntegration_userId_key" ON "GoogleCalendarIntegration"("userId");

-- CreateIndex
CREATE INDEX "GoogleCalendarIntegration_userId_idx" ON "GoogleCalendarIntegration"("userId");

-- AddForeignKey
ALTER TABLE "SalesforceIntegration" ADD CONSTRAINT "SalesforceIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubSpotIntegration" ADD CONSTRAINT "HubSpotIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleCalendarIntegration" ADD CONSTRAINT "GoogleCalendarIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
