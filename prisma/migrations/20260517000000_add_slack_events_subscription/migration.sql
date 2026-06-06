CREATE TABLE "SlackEventsSubscription" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "teamId"     TEXT NOT NULL,
    "botToken"   TEXT NOT NULL,
    "botUserId"  TEXT NOT NULL,
    "selfEmail"  TEXT,
    "isActive"   BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SlackEventsSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SlackEventsSubscription_teamId_key"
    ON "SlackEventsSubscription"("teamId");

CREATE UNIQUE INDEX "SlackEventsSubscription_userId_teamId_key"
    ON "SlackEventsSubscription"("userId", "teamId");

ALTER TABLE "SlackEventsSubscription"
    ADD CONSTRAINT "SlackEventsSubscription_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
