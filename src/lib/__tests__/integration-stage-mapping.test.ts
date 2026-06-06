import { describe, expect, it } from "vitest";
import { mapHubSpotDealToDeal } from "@/lib/hubspot";
import { mapSalesforceOpportunityToDeal } from "@/lib/salesforce";

function hubspotDeal(dealstage: string) {
  return {
    id: "hs-1",
    properties: {
      dealname: "Acme",
      amount: "1000",
      dealstage,
      closedate: null,
      hubspot_owner_id: null,
    },
  };
}

function salesforceOpp(StageName: string) {
  return {
    Id: "op-1",
    Name: "Opportunity",
    Amount: 2500,
    StageName,
    CloseDate: "2026-06-01",
    OwnerId: "user-sf",
  };
}

describe("integration stage normalization", () => {
  describe("mapHubSpotDealToDeal", () => {
    it("maps HubSpot pipeline stages to canonical lowercase stages", () => {
      const samples: Array<[string, string]> = [
        ["appointmentscheduled", "discover"],
        ["qualifiedtobuy", "qualify"],
        ["presentationscheduled", "proposal"],
        ["decisionmakerboughtin", "proposal"],
        ["contractsent", "negotiation"],
        ["closedwon", "closed_won"],
        ["closedlost", "closed_lost"],
      ];

      for (const [hubspotStage, expected] of samples) {
        const mapped = mapHubSpotDealToDeal(hubspotDeal(hubspotStage), "user-1");
        expect(mapped.stage).toBe(expected);
      }
    });

    it("defaults unknown stages to canonical 'discover'", () => {
      const mapped = mapHubSpotDealToDeal(
        hubspotDeal("something-custom"),
        "user-1"
      );
      expect(mapped.stage).toBe("discover");
    });
  });

  describe("mapSalesforceOpportunityToDeal", () => {
    it("maps Salesforce StageName values to canonical lowercase stages", () => {
      const samples: Array<[string, string]> = [
        ["Prospecting", "discover"],
        ["Qualification", "qualify"],
        ["Needs Analysis", "discover"],
        ["Value Proposition", "proposal"],
        ["Proposal/Price Quote", "proposal"],
        ["Negotiation/Review", "negotiation"],
        ["Closed Won", "closed_won"],
        ["Closed Lost", "closed_lost"],
      ];

      for (const [stageName, expected] of samples) {
        const mapped = mapSalesforceOpportunityToDeal(
          salesforceOpp(stageName),
          "user-1"
        );
        expect(mapped.stage).toBe(expected);
      }
    });

    it("defaults unknown Salesforce stages to canonical 'discover'", () => {
      const mapped = mapSalesforceOpportunityToDeal(
        salesforceOpp("Mystery Stage"),
        "user-1"
      );
      expect(mapped.stage).toBe("discover");
    });
  });
});
