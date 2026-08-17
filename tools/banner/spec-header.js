module.exports = [
  // left column
  { id: "kickerA", text: "REVENUE INTELLIGENCE", font: "jbm500", size: 11.5, tracking: 3, anchor: "start" },
  { id: "kickerDot", text: "·", font: "jbm500", size: 11.5, anchor: "start" },
  { id: "kickerB", text: "CRM-GATED", font: "jbm500", size: 11.5, tracking: 3, anchor: "start" },
  { id: "wordmark", text: "Sentinel", font: "sg700", size: 80, tracking: -1.2, anchor: "start" },
  { id: "tagline", text: "CRM is the permission layer", font: "sg500", size: 26, tracking: 0, anchor: "start" },
  { id: "taglineDot", text: ".", font: "sg700", size: 26, anchor: "start" },
  { id: "support", text: "A message is ingested only if a participant already exists in your CRM.", font: "sg500", size: 15.5, tracking: 0.1, anchor: "start" },

  // schematic
  { id: "fig", text: "FIG. 01 · INGESTION GATE", font: "jbm400", size: 11.5, tracking: 1.5, anchor: "end" },
  { id: "srcGmail", text: "Gmail", font: "jbm400", size: 12.5, anchor: "end" },
  { id: "srcCal", text: "Calendar", font: "jbm400", size: 12.5, anchor: "end" },
  { id: "srcSlack", text: "Slack", font: "jbm400", size: 12.5, anchor: "end" },
  { id: "callout1", text: "hasCrmParticipant()", font: "jbm500", size: 12.5, anchor: "end" },
  { id: "callout2", text: "FAIL-CLOSED · PII-BLIND", font: "jbm400", size: 11, tracking: 1, anchor: "end" },
  { id: "persisted", text: "PERSISTED", font: "jbm500", size: 12, tracking: 2, anchor: "middle" },
  { id: "persistedSub", text: "+ matched contacts", font: "jbm400", size: 11, anchor: "middle" },
  { id: "dropped", text: "DROPPED · no CRM match", font: "jbm500", size: 12, anchor: "end" },
  { id: "droppedSub", text: "metric only · no write", font: "jbm400", size: 11, anchor: "end" },

  // title block
  { id: "tbL1", text: "STACK", font: "jbm500", size: 11, tracking: 1.5, anchor: "start" },
  { id: "tbV1", text: "Next.js 16 · TypeScript · Prisma · Postgres · Clerk · Redis", font: "jbm400", size: 11.5, anchor: "start" },
  { id: "tbL2", text: "REF", font: "jbm500", size: 11, tracking: 1.5, anchor: "start" },
  { id: "tbV2", text: "src/lib/crm-permission.ts", font: "jbm400", size: 11.5, anchor: "start" },
  { id: "tbL3", text: "INGEST", font: "jbm500", size: 11, tracking: 1.5, anchor: "start" },
  { id: "tbV3", text: "READ-ONLY", font: "jbm400", size: 11.5, anchor: "start" },
  { id: "tbL4", text: "LICENSE", font: "jbm500", size: 11, tracking: 1.5, anchor: "start" },
  { id: "tbV4", text: "MIT", font: "jbm400", size: 11.5, anchor: "start" },
];
