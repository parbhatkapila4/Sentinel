import { prisma } from "./prisma";
import { normalizeContactEmail } from "./contact-utils";
import { incrementMetric } from "./metrics";
import { logWarn } from "./logger";

export interface CrmBookCheck {
  isInBook: boolean;
  contactId: string | null;
  source: string | null;
}

function notInBook(): CrmBookCheck {
  return { isInBook: false, contactId: null, source: null };
}

export async function isParticipantInCrmBook(
  userId: string,
  email: string | null | undefined
): Promise<CrmBookCheck> {
  void incrementMetric("crm_permission.check.total", 1);

  const normalized = normalizeContactEmail(email);
  if (!normalized) {
    void incrementMetric("crm_permission.check.out_of_book", 1);
    return notInBook();
  }

  try {
    const contact = await prisma.contact.findUnique({
      where: { userId_email: { userId, email: normalized } },
      select: { id: true, source: true },
    });

    if (contact) {
      void incrementMetric("crm_permission.check.in_book", 1);
      return {
        isInBook: true,
        contactId: contact.id,
        source: contact.source,
      };
    }

    void incrementMetric("crm_permission.check.out_of_book", 1);
    return notInBook();
  } catch (error) {
    void incrementMetric("crm_permission.check.fail_closed", 1);
    logWarn("CRM permission check failed; failing closed", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return notInBook();
  }
}

export interface CrmFilterResult {
  passed: boolean;
  matchedContactIds: string[];
  reason?: string;
}

export async function hasCrmParticipant(
  userId: string,
  userEmail: string,
  participantEmails: (string | null | undefined)[]
): Promise<CrmFilterResult> {
  const normalizedSelf = normalizeContactEmail(userEmail);
  if (!normalizedSelf) {
    void incrementMetric("crm_permission.email_filter.fail_closed", 1);
    logWarn("CRM filter called with invalid user email; failing closed", {
      userId,
    });
    return {
      passed: false,
      matchedContactIds: [],
      reason: "user email invalid",
    };
  }

  const candidates = new Set<string>();
  for (const raw of participantEmails) {
    const norm = normalizeContactEmail(raw);
    if (!norm) continue;
    if (norm === normalizedSelf) continue;
    candidates.add(norm);
  }

  if (candidates.size === 0) {
    void incrementMetric("crm_permission.email_filter.dropped", 1);
    return {
      passed: false,
      matchedContactIds: [],
      reason: "no_external_participants",
    };
  }

  try {
    const results = await batchCheckCrmBook(userId, Array.from(candidates));
    const matchedContactIds: string[] = [];
    for (const check of results.values()) {
      if (check.isInBook && check.contactId) {
        matchedContactIds.push(check.contactId);
      }
    }

    if (matchedContactIds.length > 0) {
      void incrementMetric("crm_permission.email_filter.passed", 1);
      return { passed: true, matchedContactIds };
    }

    void incrementMetric("crm_permission.email_filter.dropped", 1);
    return {
      passed: false,
      matchedContactIds: [],
      reason: "no_crm_contact_match",
    };
  } catch (error) {
    void incrementMetric("crm_permission.email_filter.fail_closed", 1);
    logWarn("CRM filter failed; failing closed", {
      userId,
      candidateCount: candidates.size,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      passed: false,
      matchedContactIds: [],
      reason: "fail_closed_error",
    };
  }
}

export async function batchCheckCrmBook(
  userId: string,
  emails: (string | null | undefined)[]
): Promise<Map<string, CrmBookCheck>> {
  const result = new Map<string, CrmBookCheck>();

  const normalized = new Set<string>();
  for (const raw of emails) {
    const norm = normalizeContactEmail(raw);
    if (norm) normalized.add(norm);
  }

  if (normalized.size === 0) {
    return result;
  }

  void incrementMetric("crm_permission.check.total", normalized.size);

  try {
    const found = await prisma.contact.findMany({
      where: {
        userId,
        email: { in: Array.from(normalized) },
      },
      select: { email: true, id: true, source: true },
    });

    const foundByEmail = new Map(found.map((c) => [c.email, c]));

    let inBookCount = 0;
    for (const email of normalized) {
      const match = foundByEmail.get(email);
      if (match) {
        result.set(email, {
          isInBook: true,
          contactId: match.id,
          source: match.source,
        });
        inBookCount++;
      } else {
        result.set(email, notInBook());
      }
    }

    if (inBookCount > 0) {
      void incrementMetric("crm_permission.check.in_book", inBookCount);
    }
    const outOfBookCount = normalized.size - inBookCount;
    if (outOfBookCount > 0) {
      void incrementMetric("crm_permission.check.out_of_book", outOfBookCount);
    }

    return result;
  } catch (error) {
    void incrementMetric("crm_permission.check.fail_closed", normalized.size);
    logWarn("CRM permission batch check failed; failing closed", {
      userId,
      emailCount: normalized.size,
      error: error instanceof Error ? error.message : String(error),
    });
    for (const email of normalized) {
      result.set(email, notInBook());
    }
    return result;
  }
}
