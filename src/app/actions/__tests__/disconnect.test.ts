import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
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
  decryptIntegrationSecret: vi.fn((v: string) => v),
}));
vi.mock("@/app/actions/integrations", () => ({
  logIntegrationAction: vi.fn(),
}));

import { disconnectGoogleCalendar } from "@/app/actions/google-calendar";
import { disconnectSlack } from "@/app/actions/slack";

beforeEach(() => {
  resetPrismaMock();
  resetAuthMock();
});

describe("disconnect deletes every stored token", () => {
  it("disconnectGoogleCalendar deletes the OAuth calendar row even when no legacy row exists", async () => {
    prismaMock.googleCalendarIntegration.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Record not found", {
        code: "P2025",
        clientVersion: "test",
      })
    );

    await disconnectGoogleCalendar();

    expect(prismaMock.googleCalendarIntegration.delete).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
    });
    expect(prismaMock.calendarIntegration.delete).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
    });
  });

  it("disconnectSlack deletes the bot token and the incoming-webhook rows", async () => {
    await disconnectSlack();

    expect(prismaMock.slackEventsSubscription.deleteMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
    });
    expect(prismaMock.slackIntegration.deleteMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
    });
  });
});
