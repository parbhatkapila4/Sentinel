import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";

const { authMock, currentUserMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  currentUserMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
  currentUser: currentUserMock,
}));

import { distinctEmail, getAuthenticatedUserId } from "@/lib/auth";

const EMAIL = "founder@example.com";

function emailTaken() {
  return Object.assign(new Error("Unique constraint failed on the fields: (`email`)"), {
    code: "P2002",
    meta: { modelName: "User", target: ["email"] },
  });
}

function signIn(userId: string, email: string | null = EMAIL) {
  authMock.mockResolvedValue({ userId });
  currentUserMock.mockResolvedValue({
    firstName: "Ada",
    lastName: "Lovelace",
    username: null,
    emailAddresses: email ? [{ emailAddress: email }] : [],
  });
  prismaMock.user.findUnique.mockResolvedValue(null);
}

describe("account record provisioning", () => {
  beforeEach(() => {
    resetPrismaMock();
    authMock.mockReset();
    currentUserMock.mockReset();
  });

  it("creates the record with the sign-in email when it is free", async () => {
    signIn("user_free00000001");
    prismaMock.user.upsert.mockResolvedValue({ id: "user_free00000001" } as never);

    await expect(getAuthenticatedUserId()).resolves.toBe("user_free00000001");

    expect(prismaMock.user.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.upsert.mock.calls[0][0].create).toMatchObject({
      id: "user_free00000001",
      name: "Ada",
      surname: "Lovelace",
      email: EMAIL,
    });
  });

  it("still creates a record when the email belongs to another user id", async () => {
    const userId = "user_taken0000ABCD1234";
    signIn(userId);
    prismaMock.user.upsert
      .mockRejectedValueOnce(emailTaken())
      .mockResolvedValueOnce({ id: userId } as never);

    await expect(getAuthenticatedUserId()).resolves.toBe(userId);

    expect(prismaMock.user.upsert).toHaveBeenCalledTimes(2);
    const retry = prismaMock.user.upsert.mock.calls[1][0];
    expect(retry.where).toEqual({ id: userId });
    expect(retry.create.id).toBe(userId);
    expect(retry.create.email).toBe("founder+abcd1234@example.com");
  });

  it("does not retry on other database errors", async () => {
    signIn("user_other000000001");
    prismaMock.user.upsert.mockRejectedValue(
      Object.assign(new Error("Unique constraint failed on the fields: (`id`)"), {
        code: "P2002",
        meta: { target: ["id"] },
      })
    );

    await expect(getAuthenticatedUserId()).resolves.toBe("user_other000000001");

    expect(prismaMock.user.upsert).toHaveBeenCalledTimes(1);
  });

  it("leaves an existing record alone", async () => {
    authMock.mockResolvedValue({ userId: "user_exists00000001" });
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_exists00000001" } as never);

    await expect(getAuthenticatedUserId()).resolves.toBe("user_exists00000001");

    expect(currentUserMock).not.toHaveBeenCalled();
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });
});

describe("distinctEmail", () => {
  it("adds a tag that keeps the mailbox the same", () => {
    expect(distinctEmail("founder@example.com", "user_37h6Mj0GHCbFlBTXrYqBW00cVsp")).toBe(
      "founder+bw00cvsp@example.com"
    );
  });

  it("gives accounts without an email a placeholder that can never be delivered", () => {
    expect(distinctEmail("", "user_37h6Mj0GHCbFlBTXrYqBW00cVsp")).toBe(
      "user-bw00cvsp@no-email.invalid"
    );
  });

  it("differs per user id", () => {
    expect(distinctEmail(EMAIL, "user_aaaaaaaa11111111")).not.toBe(
      distinctEmail(EMAIL, "user_aaaaaaaa22222222")
    );
  });
});
