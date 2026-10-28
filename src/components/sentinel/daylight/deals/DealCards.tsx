import Link from "next/link";
import type { CSSProperties } from "react";
import { fullCurrency } from "../format";
import { Monogram } from "../ui";
import { DemoTag, RiskDot } from "./cells";
import { relativeAge, riskTone, stageLabel, type DealRow } from "./model";

const ellipsis: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export function DealCards({ deals, nowMs }: { deals: DealRow[]; nowMs: number }) {
  return (
    <ul className="dl-deals-cards dl-fill">
      {deals.map((deal, i) => {
        const tone = riskTone(deal.riskScore, deal.status);
        const place = [stageLabel(deal.stage), deal.location]
          .filter(Boolean)
          .join(" · ");
        return (
          <li
            key={deal.id}
            style={{
              borderBottom:
                i === deals.length - 1 ? undefined : "1px solid var(--dl-row)",
            }}
          >
            <Link
              href={`/deals/${deal.id}`}
              className="dl-row"
              style={{
                display: "grid",
                gridTemplateColumns: "32px minmax(0, 1fr) auto",
                columnGap: 11,
                rowGap: 4,
                alignItems: "center",
                padding: "13px var(--dl-gutter) 14px",
                color: "inherit",
              }}
            >
              <Monogram name={deal.name} />
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  minWidth: 0,
                }}
              >
                <span style={{ ...ellipsis, fontSize: 14.5, fontWeight: 600 }}>
                  {deal.name}
                </span>
                {deal.isDemo && <DemoTag />}
              </span>
              <span
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fullCurrency(deal.value)}
              </span>
              <span
                style={{
                  ...ellipsis,
                  gridColumn: 2,
                  fontSize: 13,
                  color: "var(--dl-muted)",
                }}
              >
                {place}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifySelf: "end",
                  gap: 6,
                  fontSize: 12.5,
                  fontWeight: 500,
                }}
              >
                <RiskDot color={tone.color} />
                {tone.label}
              </span>
              <span
                style={{
                  ...ellipsis,
                  gridColumn: 2,
                  fontSize: 13,
                  color: deal.action ? "var(--dl-text-2)" : "var(--dl-muted)",
                }}
              >
                {deal.action ?? "No action needed"}
              </span>
              <span
                style={{
                  justifySelf: "end",
                  fontSize: 12.5,
                  color: "var(--dl-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {relativeAge(deal.lastActivityAt, nowMs)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
