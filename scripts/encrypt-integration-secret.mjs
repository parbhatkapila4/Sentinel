import crypto from "node:crypto";

const PREFIX = "enc:v1:";
const AES_KEY_BYTES = 32;
const AES_IV_BYTES = 12;

const plaintext = process.argv[2];
if (!plaintext) {
  console.error(
    'Usage: node scripts/encrypt-integration-secret.mjs "<plaintext>"'
  );
  process.exit(1);
}

const raw = process.env.INTEGRATION_ENCRYPTION_KEY;
if (!raw) {
  console.error(
    "INTEGRATION_ENCRYPTION_KEY env var not set. Source it from .env.local first."
  );
  process.exit(1);
}

const key = Buffer.from(raw, "base64");
if (key.length !== AES_KEY_BYTES) {
  console.error(
    `INTEGRATION_ENCRYPTION_KEY must decode to exactly ${AES_KEY_BYTES} bytes (got ${key.length}).`
  );
  process.exit(1);
}

const iv = crypto.randomBytes(AES_IV_BYTES);
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const encrypted = Buffer.concat([
  cipher.update(plaintext, "utf8"),
  cipher.final(),
]);
const authTag = cipher.getAuthTag();

console.log(
  PREFIX +
    iv.toString("base64") +
    ":" +
    authTag.toString("base64") +
    ":" +
    encrypted.toString("base64")
);
