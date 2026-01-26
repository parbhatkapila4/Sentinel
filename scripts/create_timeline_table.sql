-- Run these commands in your database SQL editor to create the DealTimeline table
DROP TABLE IF EXISTS "DealTimeline" CASCADE;
CREATE TABLE "DealTimeline" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id text NOT NULL,
  event_type text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE "DealTimeline"
ADD CONSTRAINT "DealTimeline_deal_id_fkey" FOREIGN KEY (deal_id) REFERENCES "Deal"(id) ON DELETE RESTRICT ON UPDATE CASCADE;