import crypto from "node:crypto";
const SIGNING_KEY_ENV = "INTEGRATION_ENCRYPTION_KEY";

function getSigningKey(): Buffer {
  const raw = process.env[SIGNING_KEY_ENV];
  if (!raw) {
    throw new Error(
      `${SIGNING_KEY_ENV} is required to sign and verify state cookies`
    );
  }
  return Buffer.from(raw, "base64");
}

export function signCookieValue(payload: unknown): string {
  const json = JSON.stringify(payload);
  const payloadB64 = Buffer.from(json, "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSigningKey())
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifyCookieValue<T = unknown>(
  raw: string | undefined
): T | null {
  if (!raw) return null;
  const dotIdx = raw.lastIndexOf(".");
  if (dotIdx <= 0 || dotIdx === raw.length - 1) return null;

  const payloadB64 = raw.slice(0, dotIdx);
  const providedSig = raw.slice(dotIdx + 1);

  let expectedSig: string;
  try {
    expectedSig = crypto
      .createHmac("sha256", getSigningKey())
      .update(payloadB64)
      .digest("base64url");
  } catch {
    return null;
  }

  const providedBuf = Buffer.from(providedSig, "base64url");
  const expectedBuf = Buffer.from(expectedSig, "base64url");
  if (providedBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return null;

  try {
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
