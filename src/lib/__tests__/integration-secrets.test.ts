import { describe, it, expect, beforeEach } from "vitest";
import {
  decryptIntegrationSecret,
  encryptIntegrationSecret,
} from "@/lib/integration-secrets";

describe("integration-secrets", () => {
  beforeEach(() => {
    process.env.INTEGRATION_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString(
      "base64"
    );
  });

  it("encrypts and decrypts round-trip", () => {
    const plaintext = "sf-prod-api-key";
    const encrypted = encryptIntegrationSecret(plaintext);

    expect(encrypted).toContain("enc:v1:");
    expect(encrypted).not.toContain(plaintext);
    expect(decryptIntegrationSecret(encrypted)).toBe(plaintext);
  });

  it("supports backward compatibility with plaintext rows", () => {
    const plaintext = "legacy-plaintext-secret";
    expect(decryptIntegrationSecret(plaintext)).toBe(plaintext);
  });

  it("fails on missing encryption key for encrypted values", () => {
    const encrypted = encryptIntegrationSecret("value");
    delete process.env.INTEGRATION_ENCRYPTION_KEY;

    expect(() => decryptIntegrationSecret(encrypted)).toThrow(
      "INTEGRATION_ENCRYPTION_KEY is required"
    );
  });
});
