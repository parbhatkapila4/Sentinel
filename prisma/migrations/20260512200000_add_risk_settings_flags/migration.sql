ALTER TABLE "UserRiskSettings"
ADD COLUMN "enableStageStall" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "enableChampionDormancy" BOOLEAN NOT NULL DEFAULT false;