CREATE TABLE "SlackMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "slackEventId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "channelType" TEXT NOT NULL,
    "messageTs" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "text" TEXT,
    "matchedCrmContacts" TEXT [] NOT NULL DEFAULT ARRAY []::TEXT [],
    "rawEvent" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SlackMessage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SlackMessage_userId_slackEventId_key" ON "SlackMessage"("userId", "slackEventId");
CREATE INDEX "SlackMessage_userId_receivedAt_idx" ON "SlackMessage"("userId", "receivedAt");
ALTER TABLE "SlackMessage"
ADD CONSTRAINT "SlackMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SlackMessage"
ADD CONSTRAINT "SlackMessage_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "SlackEventsSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;