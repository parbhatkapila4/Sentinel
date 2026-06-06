export const MAX_ATTACHMENTS = 4;
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
export const MAX_INPUT_CHARS = 4000;

export const ACCEPTED_FILE_TYPES =
  "image/*,application/pdf,.pdf,.txt,.md,.csv,.json,.xml,.yaml,.yml,.js,.ts,.tsx,.jsx,.py,.java,.go,.rb,.php,.sql";

export interface AIAttachment {
  name: string;
  type: string;
  size: number;
  data: string;
}

export type Mode = "RESEARCH" | "DRAFT" | "FAST";
export const MODES: Mode[] = ["RESEARCH", "DRAFT", "FAST"];

export function clampInput(v: string): string {
  return v.length > MAX_INPUT_CHARS ? v.slice(0, MAX_INPUT_CHARS) : v;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(typeof r.result === "string" ? r.result : "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
