import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(null),
  }),
}));

import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit-log";

describe("audit-log", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe("logAuditEvent", () => {
    it("calls prisma.auditLog.create with userId, action, resource", async () => {
      prismaMock.auditLog.create.mockResolvedValue({} as never);

      await logAuditEvent("user-1", AUDIT_ACTIONS.DEAL_DELETED, "deal", "deal-123");

      expect(prismaMock.auditLog.create).toHaveBeenCalledTimes(1);
      const call = prismaMock.auditLog.create.mock.calls[0][0];
      expect(call.data.userId).toBe("user-1");
      expect(call.data.action).toBe(AUDIT_ACTIONS.DEAL_DELETED);
      expect(call.data.resource).toBe("deal");
      expect(call.data.resourceId).toBe("deal-123");
    });

    it("passes metadata when provided", async () => {
      prismaMock.auditLog.create.mockResolvedValue({} as never);
      const metadata = { oldValue: 100, newValue: 200 };

      await logAuditEvent("user-1", "deal.value_changed", "deal", "deal-1", metadata);

      expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-1",
          action: "deal.value_changed",
          resource: "deal",
          resourceId: "deal-1",
          metadata,
        }),
      });
    });
  });

  describe("AUDIT_ACTIONS", () => {
    it("has expected action constants", () => {
      expect(AUDIT_ACTIONS.DEAL_DELETED).toBe("deal.deleted");
      expect(AUDIT_ACTIONS.USER_DELETED).toBe("user.deleted");
      expect(AUDIT_ACTIONS.TEAM_CREATED).toBe("team.created");
    });
  });
});
