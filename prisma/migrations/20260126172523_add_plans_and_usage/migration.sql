-- CreateTable
CREATE TABLE "UserPlan" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "planType" TEXT NOT NULL,
  "planName" TEXT NOT NULL,
  "maxDeals" INTEGER NOT NULL,
  "maxTeamMembers" INTEGER NOT NULL,
  "maxApiCalls" INTEGER NOT NULL,
  "maxWebhooks" INTEGER NOT NULL,
  "maxIntegrations" INTEGER NOT NULL,
  "features" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserPlan_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "UsageTracking" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "planId" TEXT,
  "metricType" TEXT NOT NULL,
  "currentCount" INTEGER NOT NULL DEFAULT 0,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "lastResetAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UsageTracking_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "UserPlan_userId_key" ON "UserPlan"("userId");
-- CreateIndex
CREATE INDEX "UserPlan_userId_idx" ON "UserPlan"("userId");
-- CreateIndex
CREATE INDEX "UserPlan_planType_idx" ON "UserPlan"("planType");
-- CreateIndex
CREATE INDEX "UsageTracking_userId_metricType_idx" ON "UsageTracking"("userId", "metricType");
-- CreateIndex
CREATE INDEX "UsageTracking_userId_periodStart_idx" ON "UsageTracking"("userId", "periodStart");
-- CreateIndex
CREATE INDEX "UsageTracking_periodEnd_idx" ON "UsageTracking"("periodEnd");
-- CreateIndex
CREATE UNIQUE INDEX "UsageTracking_userId_metricType_periodStart_key" ON "UsageTracking"("userId", "metricType", "periodStart");
-- AddForeignKey
ALTER TABLE "UserPlan"
ADD CONSTRAINT "UserPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "UsageTracking"
ADD CONSTRAINT "UsageTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "UsageTracking"
ADD CONSTRAINT "UsageTracking_planId_fkey" FOREIGN KEY ("planId") REFERENCES "UserPlan"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- Set all existing users to free plan
INSERT INTO "UserPlan" (
    "id",
    "userId",
    "planType",
    "planName",
    "maxDeals",
    "maxTeamMembers",
    "maxApiCalls",
    "maxWebhooks",
    "maxIntegrations",
    "features",
    "createdAt",
    "updatedAt"
  )
SELECT gen_random_uuid(),
  u.id,
  'free',
  'Free',
  25,
  1,
  100,
  1,
  1,
  '["basic_risk_detection", "email_notifications", "7_day_history"]'::json,
  NOW(),
  NOW()
FROM "User" u
WHERE NOT EXISTS (
    SELECT 1
    FROM "UserPlan" up
    WHERE up."userId" = u.id
  );