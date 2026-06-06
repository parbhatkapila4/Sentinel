import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type ClaimStatus =
  | "implemented"
  | "planned"
  | "explicitly_not_supported";

export type ProductClaim = {
  section: string;
  claim_id: string;
  claim_text: string;
  status: ClaimStatus;
  evidence_paths: string[];
  last_verified_at: string;
};

const CLAIM_FILE = "PRODUCT_CLAIMS.md";

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseProductClaimsMarkdown(markdown: string): ProductClaim[] {
  const lines = markdown.split(/\r?\n/);
  let currentSection = "Uncategorized";
  const claims: ProductClaim[] = [];
  let inJsonFence = false;
  let jsonBuffer: string[] = [];

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1]!.trim();
      continue;
    }

    if (!inJsonFence && line.trim() === "```json") {
      inJsonFence = true;
      jsonBuffer = [];
      continue;
    }

    if (inJsonFence && line.trim() === "```") {
      const parsed = JSON.parse(jsonBuffer.join("\n")) as Omit<
        ProductClaim,
        "section"
      >;
      claims.push({
        section: currentSection,
        ...parsed,
      });
      inJsonFence = false;
      jsonBuffer = [];
      continue;
    }

    if (inJsonFence) {
      jsonBuffer.push(line);
    }
  }

  return claims;
}

export function loadProductClaims(): ProductClaim[] {
  const abs = resolve(process.cwd(), CLAIM_FILE);
  const markdown = readFileSync(abs, "utf8");
  const claims = parseProductClaimsMarkdown(markdown);

  for (const claim of claims) {
    if (!claim.claim_id) {
      throw new Error(`Claim missing claim_id in ${CLAIM_FILE}`);
    }
    if (!claim.claim_text) {
      throw new Error(`Claim ${claim.claim_id} missing claim_text`);
    }
    if (!isIsoDate(claim.last_verified_at)) {
      throw new Error(
        `Claim ${claim.claim_id} has invalid last_verified_at ${claim.last_verified_at}`
      );
    }
    if (!Array.isArray(claim.evidence_paths) || claim.evidence_paths.length === 0) {
      throw new Error(`Claim ${claim.claim_id} missing evidence_paths`);
    }
  }

  return claims;
}
