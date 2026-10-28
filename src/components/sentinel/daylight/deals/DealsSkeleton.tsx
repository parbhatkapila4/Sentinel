import {
  Bone,
  DaylightSkeletonFrame,
  Line,
} from "../skeleton-parts";
import { tableHeadStyle } from "../ui";

const rowRule = "1px solid var(--dl-row)";

function HeroSkeleton() {
  return (
    <section className="dl-hero">
      <div className="dl-hero-lead">
        <Bone w={128} h={26} r={999} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "var(--dl-headline-size)",
            marginTop: 16,
          }}
        >
          <Bone
            w="min(100%, calc(var(--dl-headline-size) * 8.4))"
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
          <Bone w="min(78%, calc(var(--dl-headline-size) * 4.6))" h="0.52em" />
        </div>
      </div>
      <div className="dl-hero-side">
        <div style={{ maxWidth: 560 }}>
          <Line w="100%" lh={24} h={10} />
          <Line w="96%" lh={24} h={10} />
          <span className="dl-mid-hide" style={{ display: "block" }}>
            <Line w="58%" lh={24} h={10} />
          </span>
        </div>
        <div className="dl-hero-actions">
          <Bone w={106} h={36} r={9} />
          <Bone w={111} h={36} r={9} />
        </div>
      </div>
    </section>
  );
}

function TotalsSkeleton() {
  return (
    <div className="dl-grid">
      {[
        { label: 52, value: 96, chip: false },
        { label: 40, value: 96, chip: false },
        { label: 44, value: 96, chip: false },
        { label: 88, value: 22, chip: true },
      ].map((cell, i) => (
        <div key={i} className="dl-kpi">
          <Line w={cell.label} lh={19.5} />
          <div
            className="dl-kpi-value"
            style={{
              display: "flex",
              alignItems: "center",
              height: "1.15em",
              marginTop: 4,
            }}
          >
            <Bone w={cell.value} h="0.68em" r={6} />
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "6px 10px",
              marginTop: cell.chip ? 7 : 11,
            }}
          >
            {cell.chip ? (
              <Bone w={82} h={22} r={6} />
            ) : (
              <Bone w={124} h={7} r={2} />
            )}
            <Line w={104} lh={18.75} h={8} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StageFlowSkeleton() {
  return (
    <section>
      <div
        className="flex flex-wrap items-center"
        style={{
          gap: "4px 12px",
          minHeight: 38,
          padding: "8px var(--dl-gutter)",
          background: "var(--dl-tint)",
          borderBottom: "1px solid var(--dl-divider)",
        }}
      >
        <Line w={75} lh={16.5} />
        <span
          className="dl-wide-only"
          style={{ display: "flex", alignItems: "center", height: 20.25 }}
        >
          <Bone w={206} h={10} />
        </span>
        <span
          className="dl-narrow-only"
          style={{ display: "flex", alignItems: "center", height: 20.25 }}
        >
          <Bone w={118} h={10} />
        </span>
        <div
          className="flex flex-wrap items-center"
          style={{ gap: "4px 14px", marginLeft: "auto" }}
        >
          {[57, 60, 40, 40].map((w, i) => (
            <span
              key={i}
              className="dl-wide-only"
              style={{ display: "flex", alignItems: "center", height: 18.75 }}
            >
              <Bone w={w} h={8} />
            </span>
          ))}
          <Line w={98} lh={18.75} h={8} />
        </div>
      </div>
      <div className="dl-grid">
        {[
          { label: 58, bar: "12%" },
          { label: 50, bar: "58%" },
          { label: 60, bar: "100%" },
          { label: 66, bar: "56%" },
          { label: 30, bar: "60%" },
          { label: 28, bar: "0%" },
        ].map((cell, i) => (
          <div key={i} className="dl-stage">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                height: 21,
              }}
            >
              <Bone w={cell.label} h={10} />
              <Bone w={i < 4 ? 65 : 52} h={i < 4 ? 3 : 9} r={2} />
            </div>
            <div
              className="dl-stage-count"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: "1.1em",
                marginTop: 6,
              }}
            >
              <Bone w="0.62em" h="0.7em" r={5} />
              <Bone w={34} h={9} />
            </div>
            <div
              className="dl-wide-only"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 19.5,
                marginTop: 3,
              }}
            >
              <Bone w={42} h={9} />
              <Bone w={26} h={9} />
            </div>
            <div
              style={{
                height: 8,
                marginTop: 11,
                borderRadius: 2,
                background: "var(--dl-track)",
              }}
            >
              <Bone w={cell.bar} h={8} r={2} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const ROWS: Array<{
  name: number;
  place: number;
  stage: number;
  owner: number;
  action: number;
}> = [
  { name: 134, place: 58, stage: 56, owner: 72, action: 162 },
  { name: 142, place: 86, stage: 58, owner: 82, action: 174 },
  { name: 96, place: 104, stage: 58, owner: 72, action: 148 },
  { name: 128, place: 52, stage: 78, owner: 66, action: 166 },
  { name: 112, place: 70, stage: 50, owner: 82, action: 112 },
  { name: 132, place: 86, stage: 78, owner: 66, action: 112 },
  { name: 138, place: 62, stage: 50, owner: 76, action: 112 },
  { name: 102, place: 104, stage: 72, owner: 72, action: 112 },
];

function ListSkeleton() {
  return (
    <section className="dl-fill">
      <div className="dl-viewbar">
        <div className="dl-viewbar-tabs" style={{ alignItems: "center" }}>
          {[46, 71, 72, 75].map((w, i) => (
            <Bone key={i} w={w} h={12} />
          ))}
        </div>
        <div className="dl-viewbar-controls">
          <Bone w={160} h={36} r={10} className="dl-wide-only" />
          <Bone w={112} h={44} r={11} className="dl-narrow-only" />
          <div
            className="dl-filter-field"
            style={{ boxShadow: "none", borderColor: "transparent", padding: 0 }}
          >
            <Bone w="100%" h="100%" r={10} />
          </div>
        </div>
      </div>

      <div className="dl-deals-table dl-fill">
        <div
          className="dl-deal-grid"
          style={{ ...tableHeadStyle, borderTop: 0 }}
        >
          <Bone w={15} h={15} r={3} />
          <Bone w={30} h={8} />
          <Bone w={38} h={8} />
          <Bone w={28} h={8} />
          <span className="dl-col-owner">
            <Bone w={40} h={8} />
          </span>
          <span className="dl-col-action">
            <Bone w={78} h={8} />
          </span>
          <span className="dl-col-activity">
            <Bone w={84} h={8} />
          </span>
          <span style={{ display: "flex", justifyContent: "flex-end" }}>
            <Bone w={36} h={8} />
          </span>
          <span />
        </div>
        <div
          className="dl-deal-rows"
          style={{ maxHeight: `calc(${ROWS.length} * var(--dl-row-max))` }}
        >
          {ROWS.map((row, i) => (
            <div
              key={i}
              className="dl-deal-grid"
              style={{
                minHeight: 62,
                borderBottom: i === ROWS.length - 1 ? undefined : rowRule,
              }}
            >
              <Bone w={15} h={15} r={3} />
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <Bone w={32} h={32} r={9} />
                <div>
                  <Line w={row.name} lh={21} h={10} />
                  <Line w={row.place} lh={19.5} h={8} />
                </div>
              </div>
              <div>
                <Line w={row.stage} lh={19.5} />
                <Bone w={81} h={3} r={2} style={{ marginTop: 6 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Bone w={76} h={24} r={7} />
                <Bone w={26} h={8} className="dl-col-score" />
              </div>
              <div
                className="dl-col-owner"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <Bone w={24} h={24} r="50%" />
                <Bone w={row.owner} h={9} />
              </div>
              <div className="dl-col-action">
                <Line w={row.action} lh={20.25} />
                {i < 4 && <Line w={78} lh={18} h={8} />}
              </div>
              <div className="dl-col-activity">
                <Line w={68} lh={19.5} />
                <Bone w={48} h={3} r={2} style={{ marginTop: 6 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Bone w={64} h={10} />
              </div>
              <span style={{ display: "flex", justifyContent: "center" }}>
                <Bone w={16} h={4} r={2} />
              </span>
            </div>
          ))}
        </div>
        <div className="dl-deal-rest" />
      </div>

      <div className="dl-deals-cards dl-fill">
        {ROWS.map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "32px minmax(0, 1fr) auto",
              columnGap: 11,
              rowGap: 4,
              alignItems: "center",
              padding: "13px var(--dl-gutter) 14px",
              borderBottom: i === ROWS.length - 1 ? undefined : rowRule,
            }}
          >
            <Bone w={32} h={32} r={9} />
            <Bone w={row.name} h={11} />
            <Bone w={60} h={11} />
            <Line w={row.place + 62} lh={19.5} h={8} style={{ gridColumn: 2 }} />
            <Bone w={52} h={9} style={{ justifySelf: "end" }} />
            <Line w={row.action - 20} lh={19.5} h={8} style={{ gridColumn: 2 }} />
            <Bone w={66} h={8} style={{ justifySelf: "end" }} />
          </div>
        ))}
      </div>

      <div
        className="flex flex-wrap items-center justify-between"
        style={{
          gap: "4px 16px",
          minHeight: 44,
          padding: "8px var(--dl-gutter)",
          background: "var(--dl-tint)",
          borderTop: "1px solid var(--dl-divider)",
          borderBottom: "1px solid var(--dl-divider)",
        }}
      >
        <Bone w={148} h={9} />
        <Bone w={132} h={9} />
      </div>
    </section>
  );
}

export function DealsSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading deals" title="Deals">
      <HeroSkeleton />
      <TotalsSkeleton />
      <StageFlowSkeleton />
      <ListSkeleton />
    </DaylightSkeletonFrame>
  );
}
