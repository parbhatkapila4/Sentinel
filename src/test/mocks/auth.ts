import { vi } from "vitest";

export const TEST_USER_ID = "test-user-id-cuid";

export const mockGetAuthenticatedUserId = vi.fn();

export function setupAuthMock() {
  mockGetAuthenticatedUserId.mockResolvedValue(TEST_USER_ID);
}

export function resetAuthMock() {
  mockGetAuthenticatedUserId.mockReset();
  mockGetAuthenticatedUserId.mockResolvedValue(TEST_USER_ID);
}
