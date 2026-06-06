CREATE TABLE "GmailIntegration" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL,
  "tokenType" TEXT NOT NULL DEFAULT 'Bearer',
  "scope" TEXT,
  "expiryDate" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
  "lastSyncAt" TIMESTAMP(3),
  "lastSyncStatus" TEXT,
  "syncErrors" TEXT,
  "totalSynced" INTEGER NOT NULL DEFAULT 0,
  "rotatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GmailIntegration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GmailIntegration_userId_key" ON "GmailIntegration"("userId");
CREATE INDEX "GmailIntegration_userId_idx" ON "GmailIntegration"("userId");
ALTER TABLE "GmailIntegration"
ADD CONSTRAINT "GmailIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "GongIntegration" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "tokenType" TEXT NOT NULL DEFAULT 'Bearer',
  "scope" TEXT,
  "expiryDate" TIMESTAMP(3),
  "apiBaseUrl" TEXT NOT NULL DEFAULT 'https://api.gong.io',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
  "lastSyncAt" TIMESTAMP(3),
  "lastSyncStatus" TEXT,
  "syncErrors" TEXT,
  "totalSynced" INTEGER NOT NULL DEFAULT 0,
  "rotatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GongIntegration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GongIntegration_userId_key" ON "GongIntegration"("userId");
CREATE INDEX "GongIntegration_userId_idx" ON "GongIntegration"("userId");
ALTER TABLE "GongIntegration"
ADD CONSTRAINT "GongIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "EmailMessage" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "dealId" TEXT,
  "externalId" TEXT NOT NULL,
  "threadId" TEXT,
  "subject" TEXT NOT NULL,
  "bodySnippet" TEXT,
  "fromEmail" TEXT,
  "toEmails" TEXT [] DEFAULT ARRAY []::TEXT [],
  "sentAt" TIMESTAMP(3) NOT NULL,
  "sentimentScore" DOUBLE PRECISION,
  "sentimentLabel" TEXT,
  "source" TEXT NOT NULL DEFAULT 'gmail',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmailMessage_userId_externalId_source_key" ON "EmailMessage"("userId", "externalId", "source");
CREATE INDEX "EmailMessage_userId_sentAt_idx" ON "EmailMessage"("userId", "sentAt");
CREATE INDEX "EmailMessage_dealId_sentAt_idx" ON "EmailMessage"("dealId", "sentAt");
CREATE INDEX "EmailMessage_threadId_idx" ON "EmailMessage"("threadId");
ALTER TABLE "EmailMessage"
ADD CONSTRAINT "EmailMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailMessage"
ADD CONSTRAINT "EmailMessage_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
CREATE TABLE "CallTranscript" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "dealId" TEXT,
  "externalId" TEXT NOT NULL,
  "callTitle" TEXT,
  "transcriptSnippet" TEXT,
  "participants" TEXT [] DEFAULT ARRAY []::TEXT [],
  "startedAt" TIMESTAMP(3) NOT NULL,
  "endedAt" TIMESTAMP(3),
  "sentimentScore" DOUBLE PRECISION,
  "sentimentLabel" TEXT,
  "source" TEXT NOT NULL DEFAULT 'gong',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CallTranscript_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CallTranscript_userId_externalId_source_key" ON "CallTranscript"("userId", "externalId", "source");
CREATE INDEX "CallTranscript_userId_startedAt_idx" ON "CallTranscript"("userId", "startedAt");
CREATE INDEX "CallTranscript_dealId_startedAt_idx" ON "CallTranscript"("dealId", "startedAt");
ALTER TABLE "CallTranscript"
ADD CONSTRAINT "CallTranscript_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CallTranscript"
ADD CONSTRAINT "CallTranscript_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE
SET NULL ON UPDATE CASCADE;