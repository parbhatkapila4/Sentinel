module.exports = [
  // header row
  { id: "akickerA", text: "INGESTION PIPELINE", font: "jbm500", size: 11.5, tracking: 3, anchor: "start" },
  { id: "akickerDot", text: "·", font: "jbm500", size: 11.5, anchor: "start" },
  { id: "akickerB", text: "CRM-GATED", font: "jbm500", size: 11.5, tracking: 3, anchor: "start" },
  { id: "afig", text: "FIG. 02 · DATA FLOW", font: "jbm400", size: 11.5, tracking: 1.5, anchor: "end" },

  // zone labels
  { id: "azSources", text: "SOURCES", font: "jbm500", size: 11, tracking: 2, anchor: "start" },
  { id: "azOutcome", text: "OUTCOME", font: "jbm500", size: 11, tracking: 2, anchor: "start" },
  { id: "azSync", text: "CRM SYNC · READ-ONLY", font: "jbm500", size: 11, tracking: 2, anchor: "start" },

  // sources
  { id: "aGmail", text: "Gmail", font: "jbm400", size: 13, anchor: "start" },
  { id: "aCal", text: "Calendar", font: "jbm400", size: 13, anchor: "start" },
  { id: "aSlack", text: "Slack", font: "jbm400", size: 13, anchor: "start" },

  // gate callout
  { id: "acall1", text: "hasCrmParticipant()", font: "jbm500", size: 13, anchor: "start" },
  { id: "acall2", text: "FAIL-CLOSED · PII-BLIND", font: "jbm400", size: 11, tracking: 1, anchor: "start" },
  { id: "akept", text: "participant in CRM", font: "jbm400", size: 11.5, anchor: "middle" },

  // persisted box
  { id: "aPersistTitle", text: "Persisted message", font: "sg500", size: 17, anchor: "start" },
  { id: "aP1", text: "Email · Calendar · Slack", font: "jbm400", size: 11.5, anchor: "start" },
  { id: "aP2", text: "+ matched contact ids", font: "jbm400", size: 11.5, anchor: "start" },
  { id: "aP3a", text: "outcome:", font: "jbm400", size: 11.5, anchor: "start" },
  { id: "aP3b", text: "passed", font: "jbm500", size: 11.5, anchor: "start" },

  // dropped annotation
  { id: "aDrop1", text: "DROPPED · no CRM match", font: "jbm500", size: 12, anchor: "end" },
  { id: "aDrop2", text: "outcome metric only · no write", font: "jbm400", size: 11, anchor: "end" },

  // crm sync
  { id: "aHub", text: "HubSpot", font: "jbm400", size: 12, anchor: "start" },
  { id: "aSf", text: "Salesforce", font: "jbm400", size: 12, anchor: "start" },
  { id: "aBook", text: "Contact book", font: "sg500", size: 14, anchor: "middle" },
  { id: "aBook2", text: "Postgres", font: "jbm400", size: 11, anchor: "middle" },
  { id: "aBook3", text: "unique(userId, email)", font: "jbm400", size: 10.5, anchor: "middle" },
  { id: "aLookup", text: "lookup", font: "jbm400", size: 11, anchor: "start" },

  // title block
  { id: "atbL1", text: "RULE", font: "jbm500", size: 11, tracking: 1.5, anchor: "start" },
  { id: "atbV1", text: "ingest only if a participant exists in the CRM", font: "jbm400", size: 11.5, anchor: "start" },
  { id: "atbL2", text: "REF", font: "jbm500", size: 11, tracking: 1.5, anchor: "start" },
  { id: "atbV2", text: "src/lib/crm-permission.ts", font: "jbm400", size: 11.5, anchor: "start" },
  { id: "atbL3", text: "VERIFY", font: "jbm500", size: 11, tracking: 1.5, anchor: "start" },
  { id: "atbV3", text: "docs/verify-crm-permission-filter.md", font: "jbm400", size: 11.5, anchor: "start" },
];
