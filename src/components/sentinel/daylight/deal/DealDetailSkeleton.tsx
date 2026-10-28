import type { CSSProperties } from "react";
import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";

const rowRule = "1px solid var(--dl-row)";

const bodyStyle: CSSProperties = { padding: "0 var(--dl-gutter) 20px" };
function HeadBones({ title, sub, button }: { title: number; sub?: number; button?: number | number[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "6px 16px",
        padding: "18px var(--dl-gutter) 14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, height: 21 }}>
        <Bone w={title} h={11} />
        {sub !== undefined && <Bone w={sub} h={9} />}
      </div>
      {button !== undefined && (
        <div style={{ display: "flex", gap: 8 }}>
          {(Array.isArray(button) ? button : [button]).map((w, i) => (
            <Bone key={i} w={w} h={30} r={8} />
          ))}
        </div>
      )}
    </div>
  );
}

function KvBones({ rows }: { rows: Array<[number, number]> }) {
  return (
    <>
      {rows.map(([label, value], i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 45.5,
            borderTop: rowRule,
          }}
        >
          <Bone w={label} h={9} />
          <Bone w={value} h={11} />
        </div>
      ))}
    </>
  );
}

function MarkRows({ rows }: { rows: number[] }) {
  return (
    <>
      {rows.map((w, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: 9, height: 35.25, borderTop: rowRule }}
        >
          <Bone w={8} h={8} r={2} />
          <Bone w={w} h={9} />
        </div>
      ))}
    </>
  );
}

function HeroBones() {
  return (
    <section className="dl-hero">
      <div className="dl-hero-lead">
        <div style={{ display: "flex", alignItems: "center", height: 20, margin: "0 0 14px" }}>
          <Bone w={74} h={9} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Bone w={84} h={26} r={999} />
          <Bone w={152} h={26} r={999} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "var(--dl-headline-size)",
            marginTop: 16,
          }}
        >
          <Bone
            w="min(100%, calc(var(--dl-headline-size) * 5.6))"
            h="calc(var(--dl-headline-size) * 0.7)"
            r={8}
          />
        </div>
        <div className="dl-hero-clause" style={{ marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", height: "1.2em" }}>
            <Bone w="min(82%, calc(var(--dl-headline-size) * 6.4))" h="0.52em" />
          </div>
          <div className="dl-narrow-only" style={{ alignItems: "center", height: "1.2em" }}>
            <Bone w="22%" h="0.52em" />
          </div>
        </div>
      </div>
      <div className="dl-hero-side">
        <div style={{ maxWidth: 560 }}>
          <Line w="100%" lh={24} h={10} />
          <div className="dl-mid-hide">
            <Line w="64%" lh={24} h={10} />
          </div>
        </div>
        <div className="dl-hero-actions">
          <Bone w={124} h={36} r={9} />
          <Bone w={112} h={36} r={9} />
        </div>
      </div>
    </section>
  );
}

function KpiBones({
  stage = false,
  label,
  captionHeight = 18.75,
  wraps = false,
}: {
  stage?: boolean;
  label: number;
  captionHeight?: number;
  wraps?: boolean;
}) {
  return (
    <div className="dl-kpi dl-quarter">
      <Line w={label} lh={19.5} />
      {stage ? (
        <>
          <Bone w="min(100%, 220px)" h={36} r={9} style={{ marginTop: 6 }} />
          <Bone w={81} h={3} r={2} style={{ marginTop: 8 }} />
        </>
      ) : (
        <>
          <div
            className="dl-kpi-value"
            style={{ display: "flex", alignItems: "center", height: "1.15em", marginTop: 4 }}
          >
            <Bone w={label === 36 ? 150 : 92} h="0.68em" r={6} />
          </div>
          <Line w={150} lh={captionHeight} h={8} style={{ marginTop: 6 }} />
          {wraps && (
            <div className="dl-narrow-only">
              <Line w={24} lh={18.75} h={8} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SplitBones() {
  return (
    <div className="dl-dd-split">
      <div>
        <Line w={110} lh={19.5} h={8} />
        <Line w={220} lh={24.7} h={13} style={{ marginTop: 4 }} />
        <Line w={200} lh={20.25} h={9} style={{ marginTop: 4 }} />
        <Line w={52} lh={19.5} h={8} style={{ marginTop: 16 }} />
        <Bone w={96} h={20} r={6} style={{ marginTop: 6 }} />
      </div>
      <div>
        <Line w={110} lh={19.5} h={8} />
        <div style={{ marginTop: 6 }}>
          <MarkRows rows={[230, 200]} />
        </div>
        <Bone w="100%" h={7} r={2} style={{ marginTop: 14 }} />
        <Line w={190} lh={19.5} h={8} style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}

function BriefBones() {
  return (
    <div style={{ ...bodyStyle, display: "grid", gap: 14 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <Line w={i === 1 ? 64 : 48} lh={15.75} h={7} />
          <Line w={i % 2 === 0 ? "96%" : "88%"} lh={22.4} style={{ marginTop: 3 }} />
          {i === 1 && <Line w="54%" lh={22.4} />}
          <div className="dl-narrow-only">
            <Line w={i === 1 ? "40%" : "62%"} lh={22.4} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityBones() {
  return (
    <div style={bodyStyle}>
      {[260, 120, 110, 100, 170, 100, 150, 160].map((w, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 41.25,
            borderTop: rowRule,
          }}
        >
          <Bone w={8} h={8} r={2} />
          <span style={{ flex: "1 1 auto" }}>
            <Bone w={w} h={9} />
          </span>
          <Bone w={66} h={8} />
        </div>
      ))}
    </div>
  );
}

function ForecastBones() {
  return (
    <div style={bodyStyle}>
      <Line w={84} lh={19.5} h={8} />
      <div style={{ display: "flex", alignItems: "center", height: 37.4, marginTop: 2 }}>
        <Bone w={78} h={24} r={6} />
      </div>
      <Bone w="100%" h={7} r={2} style={{ marginTop: 8 }} />
      <div style={{ marginTop: 14 }}>
        <KvBones rows={[[130, 56], [80, 60]]} />
      </div>
      <Line w={96} lh={19.5} h={8} style={{ marginTop: 14 }} />
      <div style={{ marginTop: 6 }}>
        <MarkRows rows={[180, 170, 200]} />
      </div>
      <Line w={250} lh={19.5} h={8} style={{ marginTop: 14 }} />
      <div style={{ marginTop: 6 }}>
        {[120, 110, 130, 100, 116].map((w, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto 52px",
              alignItems: "center",
              gap: 10,
              height: 41,
              borderTop: rowRule,
            }}
          >
            <Bone w={w} h={9} />
            <Bone w={38} h={20} r={6} />
            <span style={{ display: "flex", justifyContent: "flex-end" }}>
              <Bone w={44} h={9} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeetingBones() {
  return (
    <div style={bodyStyle}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "56px minmax(0, 1fr) auto",
          gap: 12,
          padding: "12px 0",
          borderTop: rowRule,
        }}
      >
        <Bone w={56} h={52} r={9} />
        <div>
          <Line w={110} lh={20.25} h={10} />
          <Line w={170} lh={18.75} h={8} style={{ marginTop: 2 }} />
          <Line w={80} lh={18.75} h={8} style={{ marginTop: 2 }} />
        </div>
        <Bone w={46} h={30} r={8} />
      </div>
    </div>
  );
}

export function DealDetailSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading deal" title="Deals">
      <HeroBones />
      <div className="dl-grid">
        <KpiBones stage label={36} />
        <KpiBones label={36} wraps />
        <KpiBones label={64} captionHeight={20.25} />
        <KpiBones label={84} />
      </div>
      <div className="dl-grid dl-grow">
        <div className="dl-two-thirds dl-dd-col">
          <div className="dl-dd-sec">
            <HeadBones title={70} sub={62} />
            <SplitBones />
          </div>
          <div className="dl-dd-sec">
            <HeadBones title={64} sub={240} button={70} />
            <BriefBones />
          </div>
          <div className="dl-dd-sec dl-grow">
            <HeadBones title={60} sub={56} button={[111, 88, 103]} />
            <ActivityBones />
          </div>
        </div>
        <div className="dl-third dl-dd-col">
          <div className="dl-dd-sec">
            <HeadBones title={64} sub={66} />
            <ForecastBones />
          </div>
          <div className="dl-dd-sec">
            <HeadBones title={70} sub={56} button={100} />
            <MeetingBones />
          </div>
          <div className="dl-dd-sec">
            <HeadBones title={52} />
            <div style={bodyStyle}>
              <KvBones rows={[[60, 110], [56, 76], [40, 100], [76, 120], [44, 96], [48, 72]]} />
            </div>
          </div>
          <div className="dl-dd-sec dl-grow">
            <div
              style={{
                ...bodyStyle,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                paddingTop: 18,
              }}
            >
              <div>
                <Line w={110} lh={21} h={10} />
                <Line w={170} lh={19.5} h={8} />
              </div>
              <Bone w={90} h={30} r={8} />
            </div>
          </div>
        </div>
      </div>
    </DaylightSkeletonFrame>
  );
}
