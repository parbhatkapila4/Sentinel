DO $$
DECLARE updated_count integer := 0;
BEGIN
UPDATE "Deal"
SET "stage" = CASE
    WHEN "stage" = 'Discovery' THEN 'discover'
    WHEN "stage" = 'Qualification' THEN 'qualify'
    WHEN "stage" = 'Proposal' THEN 'proposal'
    WHEN "stage" = 'Negotiation' THEN 'negotiation'
    WHEN "stage" = 'Closed Won' THEN 'closed_won'
    WHEN "stage" = 'Closed Lost' THEN 'closed_lost'
    ELSE "stage"
  END
WHERE "stage" IN (
    'Discovery',
    'Qualification',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost'
  );
GET DIAGNOSTICS updated_count = ROW_COUNT;
RAISE NOTICE 'Canonical stage backfill updated % rows in Deal',
updated_count;
END $$;