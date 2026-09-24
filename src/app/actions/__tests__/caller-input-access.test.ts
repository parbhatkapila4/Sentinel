import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";
import {
  mockGetAuthenticatedUserId,
  TEST_USER_ID,
  resetAuthMock,
} from "@/test/mocks/auth";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: () => mockGetAuthenticatedUserId(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/integration-secrets", () => ({
  encryptIntegrationSecret: vi.fn((v: string) => `ENC:${v}`),
  decryptIntegrationSecret: vi.fn((v: string) =>
    v.startsWith("ENC:") ? v.slice(4) : v
  ),
}));
vi.mock("@/lib/plan-enforcement", () => ({
  enforceWebhookLimit: vi.fn(),
}));
vi.mock("@/lib/plans", () => ({
  incrementUsage: vi.fn(),
}));
vi.mock("@/lib/audit-log", () => ({
  logAuditEvent: vi.fn(),
  AUDIT_ACTIONS: {},
}));
vi.mock("@/app/actions/integrations", () => ({
  logIntegrationAction: vi.fn(),
}));

import { createWebhook, updateWebhook } from "@/app/actions/webhooks";
import {
  createSlackIntegration,
  updateSlackIntegration,
} from "@/app/actions/slack";
import { updateGmailSettings } from "@/app/actions/gmail";
import { updateGoogleCalendarSettings } from "@/app/actions/google-calendar";
import { updateHubSpotSettings } from "@/app/actions/hubspot";
import { updateSalesforceSettings } from "@/app/actions/salesforce";
import { ForbiddenError } from "@/lib/errors";
import { TEAM_ROLES } from "@/lib/config";

const FOREIGN_TEAM_ID = "team-someone-else";

beforeEach(() => {
  resetPrismaMock();
  resetAuthMock();
});

describe("creating with a teamId requires membership of that team", () => {
  const creates = [
    {
      action: "createWebhook",
      run: (teamId: string) =>
        createWebhook({
          name: "Deals feed",
          url: "https://example.com/hook",
          events: ["deal.created"],
          teamId,
        }),
      create: () => prismaMock.webhook.create,
    },
    {
      action: "createSlackIntegration",
      run: (teamId: string) =>
        createSlackIntegration({
          webhookUrl: "https://hooks.slack.com/services/T/B/X",
          notifyOn: ["deal.at_risk"],
          teamId,
        }),
      create: () => prismaMock.slackIntegration.create,
    },
  ];

  it.each(creates)(
    "$action rejects a team the caller is not a member of",
    async ({ run, create }) => {
      prismaMock.teamMember.findUnique.mockResolvedValue(null);

      await expect(run(FOREIGN_TEAM_ID)).rejects.toBeInstanceOf(ForbiddenError);
      expect(prismaMock.teamMember.findUnique).toHaveBeenCalledWith({
        where: {
          userId_teamId: { userId: TEST_USER_ID, teamId: FOREIGN_TEAM_ID },
        },
        select: { role: true },
      });
      expect(create()).not.toHaveBeenCalled();
    }
  );

  it.each(creates)(
    "$action still creates for a team the caller belongs to",
    async ({ run, create }) => {
      prismaMock.teamMember.findUnique.mockResolvedValue({
        role: TEAM_ROLES.MEMBER,
      } as never);
      create().mockResolvedValue({
        id: "row-1",
        name: "Deals feed",
        url: "https://example.com/hook",
        events: [],
      } as never);

      await run("team-mine");

      expect(create()).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: TEST_USER_ID,
          teamId: "team-mine",
        }),
      });
    }
  );
});

describe("update actions write only the fields they are meant to change", () => {
  const injected = {
    userId: "attacker-user",
    teamId: FOREIGN_TEAM_ID,
    secret: "attacker-chosen-secret",
    accessToken: "plaintext-access-token",
    refreshToken: "plaintext-refresh-token",
  };

  const updates = [
    {
      action: "updateWebhook",
      run: () => {
        const payload = { name: "Renamed", isActive: false, ...injected };
        return updateWebhook("wh-1", payload);
      },
      written: () => prismaMock.webhook.updateMany.mock.calls[0]?.[0].data,
      expected: { name: "Renamed", isActive: false },
    },
    {
      action: "updateSlackIntegration",
      run: () => {
        const payload = {
          webhookUrl: "https://hooks.slack.com/services/T/B/new",
          isActive: false,
          ...injected,
        };
        return updateSlackIntegration("slack-1", payload);
      },
      written: () =>
        prismaMock.slackIntegration.updateMany.mock.calls[0]?.[0].data,
      expected: {
        webhookUrl: "ENC:https://hooks.slack.com/services/T/B/new",
        isActive: false,
      },
    },
    {
      action: "updateGmailSettings",
      run: () => {
        const payload = { syncEnabled: false, ...injected };
        return updateGmailSettings(payload);
      },
      written: () => prismaMock.gmailIntegration.update.mock.calls[0]?.[0].data,
      expected: { syncEnabled: false },
    },
    {
      action: "updateGoogleCalendarSettings",
      run: () => {
        const payload = { syncEnabled: false, ...injected };
        return updateGoogleCalendarSettings(payload);
      },
      written: () =>
        prismaMock.googleCalendarIntegration.update.mock.calls[0]?.[0].data,
      expected: { syncEnabled: false },
    },
    {
      action: "updateHubSpotSettings",
      run: () => {
        const payload = { syncEnabled: false, ...injected };
        return updateHubSpotSettings(payload);
      },
      written: () =>
        prismaMock.hubSpotIntegration.update.mock.calls[0]?.[0].data,
      expected: { syncEnabled: false },
    },
    {
      action: "updateSalesforceSettings",
      run: () => {
        const payload = { syncEnabled: false, ...injected };
        return updateSalesforceSettings(payload);
      },
      written: () =>
        prismaMock.salesforceIntegration.update.mock.calls[0]?.[0].data,
      expected: { syncEnabled: false },
    },
  ];

  it.each(updates)(
    "$action drops extra fields from the payload",
    async ({ run, written, expected }) => {
      prismaMock.webhook.findFirst.mockResolvedValue({
        id: "wh-1",
        userId: TEST_USER_ID,
        teamId: null,
        name: "Deals feed",
        url: "https://example.com/hook",
        secret: "original-secret",
        events: ["deal.created"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await run();

      expect(written()).toEqual(expected);
    }
  );
});
