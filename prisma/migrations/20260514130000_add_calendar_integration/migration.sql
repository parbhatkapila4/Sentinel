CREATE TABLE "CalendarIntegration" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "accessToken"   TEXT NOT NULL,
    "refreshToken"  TEXT NOT NULL,
    "expiryDate"    TIMESTAMP(3) NOT NULL,
    "email"         TEXT,
    "scope"         TEXT NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalendarIntegration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CalendarIntegration_userId_key"
    ON "CalendarIntegration"("userId");

CREATE INDEX "CalendarIntegration_userId_idx"
    ON "CalendarIntegration"("userId");

ALTER TABLE "CalendarIntegration"
    ADD CONSTRAINT "CalendarIntegration_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
