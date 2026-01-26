-- Run these commands to add the nextAction and nextActionReason columns to the Deal table
ALTER TABLE "Deal"
ADD COLUMN IF NOT EXISTS "nextAction" TEXT;
ALTER TABLE "Deal"
ADD COLUMN IF NOT EXISTS "nextActionReason" TEXT;