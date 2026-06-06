ALTER TABLE "SalesforceIntegration" DROP COLUMN "apiKey",
    ADD COLUMN "consumerKey" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "consumerSecret" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "accessToken" TEXT,
    ADD COLUMN "accessTokenExpiresAt" TIMESTAMP(3),
    ADD COLUMN "lastContactsSyncedAt" TIMESTAMP(3),
    ADD COLUMN "totalContactsSynced" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SalesforceIntegration"
ALTER COLUMN "consumerKey" DROP DEFAULT,
    ALTER COLUMN "consumerSecret" DROP DEFAULT;