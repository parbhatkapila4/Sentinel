ALTER TABLE "HubSpotIntegration"
    ADD COLUMN "lastContactsSyncedAt" TIMESTAMP(3),
    ADD COLUMN "totalContactsSynced"  INTEGER NOT NULL DEFAULT 0;
