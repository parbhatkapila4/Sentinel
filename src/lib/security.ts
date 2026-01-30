
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return String(input);
  }

  let sanitized = input
    .replace(/\0/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "");

  return sanitized.trim();
}

export function sanitizeHtml(html: string): string {
  if (typeof html !== "string") {
    return "";
  }

  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");

  sanitized = sanitized.replace(/javascript:/gi, "").replace(/data:text\/html/gi, "");

  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");

  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  sanitized = sanitized.replace(/<embed\b[^<]*>/gi, "");

  return sanitized;
}


export function validateEmail(email: string): boolean {
  if (typeof email !== "string") {
    return false;
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (email.length > 254) {
    return false;
  }

  const parts = email.split("@");
  if (parts.length !== 2) {
    return false;
  }

  const localPart = parts[0];
  const domain = parts[1];

  if (localPart.length > 64) {
    return false;
  }

  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  if (typeof url !== "string") {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string {
  if (typeof url !== "string") {
    return "";
  }

  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return "";
    }
    return urlObj.toString();
  } catch {
    return "";
  }
}

export function escapeSql(input: string): string {
  if (typeof input !== "string") {
    return String(input);
  }

  return input.replace(/'/g, "''");
}

export function validateLength(input: string, maxLength: number): string {
  if (typeof input !== "string") {
    return "";
  }

  if (input.length > maxLength) {
    return input.substring(0, maxLength);
  }

  return input;
}

export function validateAlphanumeric(
  input: string,
  allowedChars: string = ""
): boolean {
  if (typeof input !== "string") {
    return false;
  }

  const pattern = new RegExp(`^[a-zA-Z0-9${allowedChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]+$`);
  return pattern.test(input);
}

export function sanitizeForJson(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}
