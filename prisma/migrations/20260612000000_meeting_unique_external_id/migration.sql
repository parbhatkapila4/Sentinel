-- Deduplicate existing Meeting rows that share (userId, externalId) BEFORE adding the unique
-- index, otherwise CREATE UNIQUE INDEX would fail on pre-existing duplicates created while the
-- google_calendar sync had no unique guard (manual find-then-create could race/repeat).
--
-- Rows with a NULL externalId are never touched (NULLs are distinct under a unique index, and
-- manually-created meetings legitimately have no externalId). Within each duplicate group we
-- KEEP one row and delete the rest, preferring:
--   1. a row already linked to a deal (dealId IS NOT NULL) so we never orphan a deal link,
--   2. then the earliest createdAt,
--   3. then the lowest id (stable tie-break).
-- Nothing references Meeting.id (Meeting only points outward at Deal via dealId), so deleting
-- duplicate rows is safe.
DELETE FROM "Meeting"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "userId", "externalId"
        ORDER BY ("dealId" IS NOT NULL) DESC, "createdAt" ASC, "id" ASC
      ) AS rn
    FROM "Meeting"
    WHERE "externalId" IS NOT NULL
  ) ranked
  WHERE ranked.rn > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_userId_externalId_key" ON "Meeting"("userId", "externalId");
