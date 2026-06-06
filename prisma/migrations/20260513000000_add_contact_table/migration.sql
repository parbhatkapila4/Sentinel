CREATE TABLE "Contact" (
    "id"           TEXT      NOT NULL,
    "userId"       TEXT      NOT NULL,
    "email"        TEXT      NOT NULL,
    "firstName"    TEXT,
    "lastName"     TEXT,
    "fullName"     TEXT,
    "phone"        TEXT,
    "companyName"  TEXT,
    "source"       TEXT      NOT NULL,
    "externalId"   TEXT      NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Contact"
    ADD CONSTRAINT "Contact_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Contact_userId_email_key"
    ON "Contact"("userId", "email");

CREATE UNIQUE INDEX "Contact_userId_source_externalId_key"
    ON "Contact"("userId", "source", "externalId");

CREATE INDEX "Contact_userId_idx"
    ON "Contact"("userId");
