import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";
import {
  HEALTHIEST_COLUMNS,
  RANKED_MIN_WIDTH,
  STAGE_CHART_COLUMNS,
  STAGE_CHART_MIN_WIDTH,
  TIER_COLUMN_GAP,
  TIER_COLUMNS,
} from "../table-columns";
import { tableHeadStyle } from "../ui";

const rowRule = "1px solid var(--dl-row)";

function HeroSkeleton() {
  return (
    <section className="dl-hero">
      <div className="dl-hero-lead">
        <Bone w={118} h={26} r={999} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "var(--dl-headline-size)",
            marginTop: 16,
          }}
        >
          <Bone
            w="min(100%, calc(var(--dl-headline-size) * 8.2))"
            h="calc(var(--dl-headline-size) * 0.7)"
            r={8}
          />
        </div>
        <div
          className="dl-hero-clause"
          style={{
            display: "flex",
            alignItems: "center",
            height: "1.2em",
            marginTop: 8,
          }}
        >
          <Bone w="min(82%, calc(var(--dl-headline-size) * 5.6))" h="0.52em" />
        </div>
      </div>
      <div className="dl-hero-side">
        <div style={{ maxWidth: 560 }}>
          <Line w="100%" lh={24} h={10} />
          <Line w="92%" lh={24} h={10} />
          <span className="dl-wide-only dl-mid-hide" style={{ display: "block" }}>
            <Line w="54%" lh={24} h={10} />
          </span>
        </div>
        <div className="dl-hero-actions">
          <Bone w={122} h={36} r={9} />
          <Bone w={111} h={36} r={9} />
        </div>
      </div>
    </section>
  );
}

function RangeBarSkeleton() {
  return (
    <div className="dl-viewbar">
      <div className="dl-viewbar-tabs dl-tabs-tight" style={{ alignItems: "center" }}>
        {[68, 76, 76, 78].map((w, i) => (
          <Bone key={i} w={w} h={12} />
        ))}
      </div>
      <div className="dl-viewbar-controls dl-wide-only">
        <Line w={300} lh={19.5} />
      </div>
    </div>
  );
}

function KeyNumbersSkeleton() {
  return (
    <div className="dl-grid">
      {[50, 84, 52, 78, 62, 82].map((label, i) => (
        <div key={i} className="dl-kpi dl-kpi-6">
          <Line w={label} lh={19.5} />
          <div
            className="dl-kpi-value"
            style={{
              display: "flex",
              alignItems: "center",
              height: "1.15em",
              marginTop: 4,
            }}
          >
            <Bone w={i === 3 || i === 5 ? 24 : 92} h="0.68em" r={6} />
          </div>
          <div style={{ display: "flex", marginTop: 11 }}>
            <Bone w={124} h={7} r={2} />
          </div>
          <Line w={98} lh={18.75} h={8} style={{ marginTop: 7 }} />
        </div>
      ))}
    </div>
  );
}

function HeadSkeleton({ title, sub, right }: { title: number; sub: number; right?: number }) {
  return (
    <>
      <div
        className="dl-wide-only flex flex-wrap items-center justify-between"
        style={{ gap: "6px 16px", padding: "18px var(--dl-gutter) 14px" }}
      >
        <div className="flex items-center" style={{ gap: 9, height: 21 }}>
          <Bone w={title} h={11} />
          <Bone w={sub} h={9} />
        </div>
        {right !== undefined && <Bone w={right} h={9} />}
      </div>
      <div
        className="dl-narrow-only flex items-center"
        style={{
          gap: 12,
          height: 42,
          padding: "0 var(--dl-gutter)",
          background: "var(--dl-tint)",
          borderBottom: "1px solid var(--dl-divider)",
        }}
      >
        <Bone w={70} h={9} />
        <Bone w={Math.min(sub, 150)} h={10} />
      </div>
    </>
  );
}

const STAGE_BARS = ["12%", "58%", "98%", "57%", "60%"];

function StageChartSkeleton() {
  return (
    <section
      className="dl-two-thirds"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <HeadSkeleton title={62} sub={176} right={168} />
      <div className="dl-wide-only" style={{ overflowX: "hidden" }}>
        <div style={{ minWidth: STAGE_CHART_MIN_WIDTH }}>
          <div style={{ ...tableHeadStyle, gridTemplateColumns: STAGE_CHART_COLUMNS }}>
            <Bone w={36} h={8} />
            <Bone w="100%" h={8} />
            <span style={{ display: "flex", justifyContent: "flex-end" }}>
              <Bone w={36} h={8} />
            </span>
            <span style={{ display: "flex", justifyContent: "flex-end" }}>
              <Bone w={34} h={8} />
            </span>
            <Bone w={78} h={8} />
          </div>
          {STAGE_BARS.map((bar, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: STAGE_CHART_COLUMNS,
                columnGap: 16,
                alignItems: "center",
                minHeight: 54,
                padding: "0 var(--dl-gutter)",
                borderBottom: i === STAGE_BARS.length - 1 ? undefined : rowRule,
              }}
            >
              <div>
                <Line w={[58, 50, 60, 66, 30][i]} lh={20.25} />
                <Bone w={81} h={3} r={2} style={{ marginTop: 5 }} />
              </div>
              <div>
                <Bone w={bar} h={8} r="0 3px 3px 0" />
              </div>
              <span style={{ display: "flex", justifyContent: "flex-end" }}>
                <Bone w={62} h={10} />
              </span>
              <span style={{ display: "flex", justifyContent: "flex-end" }}>
                <Bone w={10} h={9} />
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Bone w={48} h={3} r={2} />
                <Bone w={46} h={9} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="dl-narrow-only">
        {STAGE_BARS.map((bar, i) => (
          <div
            key={i}
            style={{
              padding: "13px var(--dl-gutter) 14px",
              borderBottom: i === STAGE_BARS.length - 1 ? undefined : rowRule,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 21,
              }}
            >
              <Bone w={[58, 50, 60, 66, 30][i]} h={10} />
              <Bone w={62} h={10} />
            </div>
            <div
              style={{
                height: 8,
                marginTop: 8,
                borderRadius: 2,
                background: "var(--dl-track)",
              }}
            >
              <Bone w={bar} h={8} r="0 3px 3px 0" />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 18.75,
                marginTop: 8,
              }}
            >
              <Bone w={44} h={8} />
              <Bone w={118} h={8} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskMixSkeleton() {
  return (
    <section className="dl-third">
      <HeadSkeleton title={58} sub={132} />
      <div className="dl-mix-bar">
        <Bone w="100%" h={12} r={3} />
      </div>
      <div
        className="dl-wide-only"
        style={{ ...tableHeadStyle, gridTemplateColumns: TIER_COLUMNS, columnGap: TIER_COLUMN_GAP }}
      >
        <Bone w={28} h={8} />
        <span style={{ display: "flex", justifyContent: "flex-end" }}>
          <Bone w={34} h={8} />
        </span>
        <span style={{ display: "flex", justifyContent: "flex-end" }}>
          <Bone w={36} h={8} />
        </span>
        <span style={{ display: "flex", justifyContent: "flex-end" }}>
          <Bone w={36} h={8} />
        </span>
      </div>
      {[44, 60, 58].map((label, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: TIER_COLUMNS,
            columnGap: TIER_COLUMN_GAP,
            alignItems: "center",
            minHeight: 62,
            padding: "0 var(--dl-gutter)",
            borderBottom: i === 2 ? undefined : rowRule,
          }}
        >
          <div>
            <Line w={label} lh={20.25} h={10} />
            <Line w={96} lh={18.75} h={8} style={{ marginTop: 1 }} />
          </div>
          <span style={{ display: "flex", justifyContent: "flex-end" }}>
            <Bone w={14} h={16} />
          </span>
          <span style={{ display: "flex", justifyContent: "flex-end" }}>
            <Bone w={28} h={9} />
          </span>
          <span style={{ display: "flex", justifyContent: "flex-end" }}>
            <Bone w={44} h={10} />
          </span>
        </div>
      ))}
    </section>
  );
}

function RankedSkeleton({
  rows,
  title,
  sub,
  note = false,
}: {
  rows: number;
  title: number;
  sub: number;
  note?: boolean;
}) {
  return (
    <section
      className="dl-half"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <HeadSkeleton title={title} sub={sub} />
      <div className="dl-wide-only" style={{ overflowX: "hidden" }}>
        <div style={{ minWidth: RANKED_MIN_WIDTH }}>
          <div style={{ ...tableHeadStyle, gridTemplateColumns: HEALTHIEST_COLUMNS }}>
            <Bone w={8} h={8} />
            <Bone w={30} h={8} />
            <Bone w={38} h={8} />
            <Bone w={28} h={8} />
            <span style={{ display: "flex", justifyContent: "flex-end" }}>
              <Bone w={36} h={8} />
            </span>
          </div>
          {Array.from({ length: rows }, (_, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: HEALTHIEST_COLUMNS,
                columnGap: 16,
                alignItems: "center",
                minHeight: 62,
                padding: "0 var(--dl-gutter)",
                borderBottom: rowRule,
              }}
            >
              <Bone w={8} h={9} />
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <Bone w={32} h={32} r={9} />
                <div>
                  <Line w={[128, 142, 116, 122][i % 4]} lh={21} h={10} />
                  <Line w={[96, 112, 84, 70][i % 4]} lh={19.5} h={8} />
                </div>
              </div>
              <div>
                <Line w={[58, 62, 78, 50][i % 4]} lh={19.5} />
                <Bone w={81} h={3} r={2} style={{ marginTop: 6 }} />
              </div>
              <Bone w={["100%", "67%", "42%", "31%"][i % 4]} h={5} r={3} />
              <span style={{ display: "flex", justifyContent: "flex-end" }}>
                <Bone w={62} h={10} />
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="dl-narrow-only">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "32px minmax(0, 1fr) auto",
              columnGap: 11,
              rowGap: 4,
              alignItems: "center",
              padding: "13px var(--dl-gutter) 14px",
              borderBottom: rowRule,
            }}
          >
            <Bone w={32} h={32} r={9} />
            <Bone w={[128, 142, 116, 122][i % 4]} h={11} />
            <Bone w={60} h={11} />
            <Line w={132} lh={19.5} h={8} style={{ gridColumn: 2 }} />
            <Bone w={52} h={9} style={{ justifySelf: "end" }} />
            {note && (
              <Line w={168} lh={19.5} h={8} style={{ gridColumn: "2 / 4" }} />
            )}
          </div>
        ))}
      </div>
      {note && (
        <div style={{ padding: "16px var(--dl-gutter) 20px" }}>
          <Line w={248} lh={19.5} h={8} />
        </div>
      )}
    </section>
  );
}

export function AnalyticsSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading analytics" title="Analytics">
      <HeroSkeleton />
      <RangeBarSkeleton />
      <div className="dl-fill">
        <KeyNumbersSkeleton />
        <div className="dl-grid">
          <StageChartSkeleton />
          <RiskMixSkeleton />
        </div>
        <div className="dl-grid dl-grow">
          <RankedSkeleton rows={2} title={132} sub={176} note />
          <RankedSkeleton rows={4} title={112} sub={138} />
        </div>
      </div>
    </DaylightSkeletonFrame>
  );
}
