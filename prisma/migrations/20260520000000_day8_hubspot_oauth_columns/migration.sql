ALTER TABLE "HubSpotIntegration"
ALTER COLUMN "apiKey" DROP NOT NULL,
    ADD COLUMN "authMethod" TEXT NOT NULL DEFAULT 'api_key',
    ADD COLUMN "accessToken" TEXT,
    ADD COLUMN "refreshToken" TEXT,
    ADD COLUMN "tokenExpiresAt" TIMESTAMP(3),
    ADD COLUMN "scopes" TEXT;