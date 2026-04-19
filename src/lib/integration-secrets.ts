import crypto from "crypto";

const INTEGRATION_SECRET_PREFIX = "enc:v1:";
const INTEGRATION_SECRET_KEY_ENV = "INTEGRATION_ENCRYPTION_KEY";
const AES_KEY_BYTES = 32;
const AES_IV_BYTES = 12;

function getIntegrationEncryptionKey(): Buffer {
  const raw = process.env[INTEGRATION_SECRET_KEY_ENV];
  if (!raw) {
    throw new Error(
      `${INTEGRATION_SECRET_KEY_ENV} is required to decrypt encrypted integration secrets`
    );
  }

  let key: Buffer;
  try {
    key = Buffer.from(raw, "base64");
  } catch {
    throw new Error(
      `${INTEGRATION_SECRET_KEY_ENV} must be base64-encoded 32-byte key`
    );
  }

  if (key.length !== AES_KEY_BYTES) {
    throw new Error(
      `${INTEGRATION_SECRET_KEY_ENV} must decode to exactly 32 bytes`
    );
  }

  return key;
}

function isEncryptedIntegrationSecret(value: string): boolean {
  return value.startsWith(INTEGRATION_SECRET_PREFIX);
}

export function encryptIntegrationSecret(plaintext: string): string {
  if (!plaintext) return plaintext;
  if (isEncryptedIntegrationSecret(plaintext)) return plaintext;

  const key = getIntegrationEncryptionKey();
  const iv = crypto.randomBytes(AES_IV_BYTES);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${INTEGRATION_SECRET_PREFIX}${iv.toString("base64")}:${authTag.toString(
    "base64"
  )}:${encrypted.toString("base64")}`;
}

export function decryptIntegrationSecret(value: string): string {
  if (!value) return value;
  if (!isEncryptedIntegrationSecret(value)) {
    return value;
  }

  const payload = value.slice(INTEGRATION_SECRET_PREFIX.length);
  const [ivB64, authTagB64, encryptedB64] = payload.split(":");
  if (!ivB64 || !authTagB64 || !encryptedB64) {
    throw new Error("Encrypted integration secret has invalid format");
  }

  const key = getIntegrationEncryptionKey();
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
