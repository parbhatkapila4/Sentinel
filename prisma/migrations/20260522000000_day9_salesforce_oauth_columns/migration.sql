ALTER TABLE "SalesforceIntegration"
ALTER COLUMN "consumerKey" DROP NOT NULL,
    ALTER COLUMN "consumerSecret" DROP NOT NULL,
    ADD COLUMN "authMethod" TEXT NOT NULL DEFAULT 'client_credentials',
    ADD COLUMN "refreshToken" TEXT,
    ADD COLUMN "scopes" TEXT;