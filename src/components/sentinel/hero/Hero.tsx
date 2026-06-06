import type { BriefingItem } from "../types";
import type { LeadHeadline } from "../derive";
import { IssueColumn } from "./IssueColumn";
import { LeadColumn } from "./LeadColumn";
import { BriefingAside } from "./BriefingAside";

interface HeroProps {
  issueNumber: number;
  dateLine: string;
  weatherLine: string;
  metaLines: string[];
  kicker: string;
  headline: LeadHeadline;
  briefingItems: BriefingItem[];
}

export function Hero({
  issueNumber,
  dateLine,
  weatherLine,
  metaLines,
  kicker,
  headline,
  briefingItems,
}: HeroProps) {
  return (
    <section
      className="grid grid-cols-1 lg:grid-cols-[minmax(180px,1fr)_minmax(0,2.6fr)_minmax(280px,1.2fr)] gap-10 lg:gap-14 px-6 sm:px-10 lg:px-14 py-12 lg:py-16 border-b"
      style={{ borderColor: "var(--rule)" }}
      aria-label="Issue lead"
    >
      <IssueColumn
        issueNumber={issueNumber}
        dateLine={dateLine}
        weatherLine={weatherLine}
        metaLines={metaLines}
      />
      <LeadColumn kicker={kicker} headline={headline} />
      <BriefingAside items={briefingItems} />
    </section>
  );
}
