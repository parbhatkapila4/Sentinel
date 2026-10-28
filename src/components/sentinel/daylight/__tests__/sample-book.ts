import { RISK_REASONS } from "@/lib/config";
import type { BookDeal } from "../book";


const DAY = 86_400_000;

export const NOW = new Date(2026, 9, 27, 14, 5).getTime();

type Row = [
  id: string,
  name: string,
  location: string,
  value: number,
  stage: string,
  risk: number,
  status: string,
  createdDaysAgo: number,
  idleDays: number,
  action: string | null,
  urgency: string | null,
  dueInDays: number | null,
  reason: string | null,
];

const ROWS: Row[] = [
  ["d01", "Quantum Industries", "Germany", 250_000, "proposal", 0.71, "at_risk", 34, 12, "Schedule a pricing review", "high", -3, RISK_REASONS.NO_ACTIVITY],
  ["d02", "Pinnacle Solutions", "Canada", 35_000, "discover", 0.82, "at_risk", 40, 19, "Re-engage the champion", "high", -6, RISK_REASONS.NO_ACTIVITY],
  ["d03", "Meridian Health", "United States", 310_000, "negotiation", 0.66, "at_risk", 58, 9, "Send the revised order form", "high", -1, RISK_REASONS.NEGOTIATION_STALLED],
  ["d04", "Vertex Robotics", "Japan", 185_000, "negotiation", 0.63, "at_risk", 47, 6, "Answer the security questionnaire", "medium", 2, RISK_REASONS.COMPETITIVE_PRESSURE],
  ["d05", "Northwind Trading", "United Kingdom", 140_000, "proposal", 0.55, "at_risk", 31, 8, "Loop in their finance lead", "medium", 4, RISK_REASONS.HIGH_VALUE],
  ["d06", "TechStart Inc", "India", 45_000, "proposal", 0.52, "active", 25, 4, "Confirm the pilot scope", "medium", 5, null],
  ["d07", "Horizon Labs", "Australia", 95_000, "negotiation", 0.44, "active", 22, 3, "Book the legal review", "medium", 6, null],
  ["d08", "Harbor Bank", "Singapore", 220_000, "qualify", 0.48, "active", 16, 2, "Map the buying committee", "low", 7, null],
  ["d09", "Nexus Partners", "Singapore", 55_000, "qualify", 0.28, "active", 5, 1, "Send two case studies", "low", 3, null],
  ["d10", "Acme Corporation", "United States", 75_000, "negotiation", 0.22, "active", 18, 1, "Draft the contract", "low", 2, null],
  ["d11", "Global Systems Ltd", "Australia", 120_000, "qualify", 0.18, "active", 3, 0, "Run the discovery call", "low", 1, null],
  ["d12", "Lumen Analytics", "Netherlands", 28_000, "discover", 0.31, "active", 6, 2, "Qualify the budget", "low", 4, null],
  ["d13", "Bluepeak Logistics", "Canada", 64_000, "discover", 0.36, "active", 11, 5, "Share the ROI model", "low", 6, null],
  ["d14", "Sable Security", "Israel", 82_000, "proposal", 0.34, "active", 29, 3, "Walk them through the proposal", "medium", 2, null],
  ["d15", "Keystone Energy", "United States", 410_000, "qualify", 0.39, "active", 13, 2, "Confirm the decision timeline", "medium", 5, null],
  ["d16", "Apex Ventures", "United Kingdom", 180_000, "closed_won", 0, "closed", 75, 12, null, null, null, null],
  ["d17", "Orbit Freight", "Germany", 96_000, "closed_won", 0, "closed", 61, 20, null, null, null, null],
  ["d18", "Brightline Media", "France", 42_000, "closed_won", 0, "closed", 44, 6, null, null, null, null],
  ["d19", "Cedar & Pine Retail", "Canada", 58_000, "closed_lost", 0, "closed", 52, 9, null, null, null, null],
  ["d20", "Atlas Biotech", "Switzerland", 130_000, "closed_lost", 0, "closed", 70, 15, null, null, null, null],
];

export function sampleBook(nowMs: number = NOW): BookDeal[] {
  return ROWS.map(
    ([id, name, location, value, stage, risk, status, created, idle, action, urgency, due, reason]) => ({
      id,
      name,
      stage,
      status,
      value,
      riskScore: risk,
      createdAt: nowMs - created * DAY - 3_600_000,
      lastActivityAt: nowMs - idle * DAY - 3_600_000,
      location,
      action,
      urgency,
      actionDueAt: due === null ? null : nowMs + due * DAY + 3_600_000,
      overdueDays: due !== null && due < 0 ? -due : null,
      riskReason: reason,
      riskStartedAt: null,
      isDemo: false,
    })
  );
}

export function bookDeal(overrides: Partial<BookDeal> & Pick<BookDeal, "id" | "name">): BookDeal {
  return {
    stage: "qualify",
    status: "active",
    value: 10_000,
    riskScore: 0.2,
    createdAt: NOW - 10 * DAY,
    lastActivityAt: NOW - 2 * DAY,
    location: null,
    action: null,
    urgency: null,
    actionDueAt: null,
    overdueDays: null,
    riskReason: null,
    riskStartedAt: null,
    isDemo: false,
    ...overrides,
  };
}
