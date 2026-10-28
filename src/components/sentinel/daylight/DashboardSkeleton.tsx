import type { CSSProperties } from "react";
import {
  Bone,
  DaylightSkeletonFrame,
  Line,
  TableHeadSkeleton,
} from "./skeleton-parts";
import {
  FIRST_LOOK_COLUMNS,
  TABLE_MIN_WIDTH,
  TOP_DEALS_COLUMNS,
} from "./table-columns";

const AREA_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M0 78 C16 70 30 60 48 46 S82 22 100 12 V100 H0 Z'/%3E%3C/svg%3E\")";

const rowRule = "1px solid var(--dl-row)";

function CellHeader({ title, note }: { title: number; note: number }) {
  return (
    <div className="flex items-center" style={{ gap: 9, height: 21 }}>
      <Bone w={title} h={11} />
      <Bone w={22} h={20} r={6} />
      <Bone w={note} h={9} style={{ marginLeft: "auto" }} />
    </div>
  );
}

function SummarySkeleton() {
  return (
    <section>
      <div className="dl-hero">
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
              w="min(100%, calc(var(--dl-headline-size) * 7.8))"
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
            <Bone w="min(82%, calc(var(--dl-headline-size) * 5.2))" h="0.52em" />
          </div>
        </div>
        <div className="dl-hero-side">
          <div style={{ maxWidth: 560 }}>
            <Line w="100%" lh={24} h={10} />
            <Line w="94%" lh={24} h={10} />
            <Line w="61%" lh={24} h={10} />
          </div>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}
          >
            <Bone w={156} h={36} r={9} />
            <Bone w={138} h={36} r={9} />
          </div>
        </div>
      </div>
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
        <Bone w={92} h={9} />
        <Bone w={184} h={10} />
        <Bone w={46} h={9} style={{ marginLeft: "auto" }} />
      </div>
      <div className="dl-grid">
        {[
          ["92%", "58%"],
          ["88%", "36%"],
          ["95%", "64%"],
          ["84%", "47%"],
        ].map((widths, i) => (
          <div
            key={i}
            className="dl-quarter"
            style={{
              display: "flex",
              gap: 12,
              padding: "14px var(--dl-gutter) 16px",
            }}
          >
            <Line w={15} lh={20} h={8} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Line w={widths[0]} lh={20} />
              <Line w={widths[1]} lh={20} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatRowSkeleton({ value, side }: { value: number; side: "meter" | "chip" }) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        minHeight: 82,
        padding: "13px var(--dl-gutter)",
      }}
    >
      <div>
        <Line w={62} lh={19.5} />
        <Line w={value} lh={33.6} h={22} style={{ marginTop: 1 }} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: side === "meter" ? 8 : 6,
        }}
      >
        {side === "meter" ? (
          <Bone w={124} h={7} r={2} />
        ) : (
          <Bone w={78} h={22} r={6} />
        )}
        <Line w={112} lh={18.75} />
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <section className="dl-grid">
      <div
        className="dl-two-thirds"
        style={{ padding: "20px var(--dl-gutter) 16px" }}
      >
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: "6px 16px", minHeight: 21 }}
        >
          <div className="flex items-center" style={{ gap: 9 }}>
            <Bone w={104} h={11} />
            <Bone w={168} h={9} />
          </div>
          <div className="flex items-center" style={{ gap: 16 }}>
            <Bone w={68} h={9} />
            <Bone w={68} h={9} />
          </div>
        </div>
        <div
          className="flex flex-wrap items-center"
          style={{ gap: "8px 12px", marginTop: 14, minHeight: 48 }}
        >
          <Bone w={172} h={40} r={8} />
          <Bone w={62} h={24} r={7} />
          <Bone w={88} h={9} />
          <Bone w={150} h={9} style={{ marginLeft: "auto" }} />
        </div>
        <div
          style={{
            position: "relative",
            height: "clamp(204px, 15cqw, 300px)",
            marginTop: 12,
          }}
        >
          {[14, "calc(14px + (100% - 48px) / 2)"].map((top, i) => (
            <Bone
              key={i}
              w={26}
              h={8}
              style={{
                position: "absolute",
                left: 10,
                top,
                transform: "translateY(-50%)",
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 44,
              right: 12,
              top: 14,
              bottom: 34,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                right: 0,
                top: 0,
                bottom: 0,
                borderLeft: "1px solid var(--dl-border-strong)",
                backgroundColor: "var(--dl-tint)",
                backgroundImage:
                  "repeating-linear-gradient(135deg, var(--dl-hatch) 0, var(--dl-hatch) 1px, transparent 1px, transparent 7px)",
              }}
            />
            {[
              { top: 0, background: "var(--dl-row)" },
              { top: "50%", background: "var(--dl-row)" },
              { bottom: 0, background: "var(--dl-border-strong)" },
            ].map((line, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: 1,
                  ...line,
                }}
              />
            ))}
            <Bone
              w="40%"
              h="100%"
              r={0}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                WebkitMaskImage: AREA_MASK,
                maskImage: AREA_MASK,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 44,
              right: 12,
              bottom: 0,
              height: 34,
            }}
          >
            {[0, 20, 40, 60, 80, 100].map((x) => (
              <Bone
                key={x}
                w={24}
                h={8}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: 15,
                  transform:
                    x === 100 ? "translateX(-100%)" : "translateX(-50%)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="dl-third dl-stack">
        <StatRowSkeleton value={104} side="meter" />
        <StatRowSkeleton value={92} side="meter" />
        <StatRowSkeleton value={30} side="chip" />
        <StatRowSkeleton value={104} side="meter" />
      </div>
    </section>
  );
}

function AttentionSkeleton() {
  return (
    <div className="dl-grid">
      <section
        className="dl-two-thirds"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: "6px 16px", padding: "18px var(--dl-gutter) 14px" }}
        >
          <div className="flex items-center" style={{ gap: 9, height: 21 }}>
            <Bone w={148} h={11} />
            <Bone w={22} h={20} r={6} />
            <Bone w={172} h={9} />
          </div>
          <Bone w={66} h={9} />
        </div>
        <div style={{ overflowX: "hidden" }}>
          <div style={{ minWidth: TABLE_MIN_WIDTH }}>
            <TableHeadSkeleton
              columns={FIRST_LOOK_COLUMNS}
              widths={[30, 38, 28, 28, 36]}
            />
            {[
              [136, 62, 56, 68, 62],
              [148, 90, 62, 82, 70],
              [104, 96, 62, 82, 60],
              [132, 62, 84, 80, 60],
            ].map(([name, place, stage, risk, value], i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: FIRST_LOOK_COLUMNS,
                  columnGap: 16,
                  alignItems: "center",
                  minHeight: 64,
                  padding: "0 var(--dl-gutter)",
                  borderBottom: i === 3 ? undefined : rowRule,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 11 }}
                >
                  <Bone w={32} h={32} r={9} />
                  <div>
                    <Line w={name} lh={21} h={10} />
                    <Line w={place} lh={19.5} h={8} />
                  </div>
                </div>
                <div>
                  <Line w={stage} lh={19.5} />
                  <Bone w={81} h={3} r={2} style={{ marginTop: 6 }} />
                </div>
                <div>
                  <Line w={26} lh={20} h={10} />
                  <Bone w={48} h={3} r={2} style={{ marginTop: 7 }} />
                </div>
                <div>
                  <Bone w={risk} h={24} r={7} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Bone w={value} h={10} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="flex flex-wrap items-center justify-between"
          style={{
            gap: "4px 16px",
            minHeight: 44,
            marginTop: "auto",
            padding: "8px var(--dl-gutter)",
            background: "var(--dl-tint)",
            borderTop: "1px solid var(--dl-divider)",
          }}
        >
          <Bone w={236} h={9} />
          <Bone w={126} h={9} />
        </div>
      </section>
      <section
        className="dl-third"
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "18px var(--dl-gutter) 0",
        }}
      >
        <div className="flex items-center" style={{ gap: 10, height: 21 }}>
          <Bone w={84} h={11} />
          <Bone w={94} h={9} style={{ marginLeft: "auto" }} />
        </div>
        <Bone w="100%" h={41} r={10} style={{ maxWidth: 680, marginTop: 14 }} />
        <div style={{ maxWidth: 680, marginTop: 14 }}>
          <Line w="100%" lh={24} h={10} />
          <Line w="96%" lh={24} h={10} />
          <Line w="57%" lh={24} h={10} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {[76, 64, 62, 60].map((w, i) => (
            <Bone key={i} w={w} h={22} r={6} />
          ))}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 18 }}>
          <div
            style={{
              margin: "0 calc(var(--dl-gutter) * -1)",
              borderTop: "1px solid var(--dl-divider)",
            }}
          >
            {[
              [96, 104],
              [158, 88],
              [102, 122],
            ].map(([title, sub], i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  minHeight: 44,
                  padding: "6px var(--dl-gutter)",
                  borderTop: i === 0 ? undefined : rowRule,
                }}
              >
                <Bone w={title} h={10} />
                <Bone w={sub} h={9} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SignalsSkeleton() {
  const cell: CSSProperties = { padding: "18px var(--dl-gutter) 8px" };
  return (
    <section className="dl-grid">
      <div className="dl-third" style={cell}>
        <CellHeader title={46} note={118} />
        <div style={{ marginTop: 12 }}>
          {[
            [134, "74%"],
            [146, "72%"],
            [146, "88%"],
          ].map(([name, reason], i) => (
            <div key={i} style={{ padding: "12px 0", borderTop: rowRule }}>
              <div className="flex items-center" style={{ gap: 10, height: 21 }}>
                <Bone w={8} h={8} r={2} style={{ margin: "0 1px" }} />
                <Bone w={name} h={10} />
                <Bone w={48} h={9} style={{ marginLeft: "auto" }} />
              </div>
              <Line
                w={reason}
                lh={20}
                style={{ marginTop: 3, paddingLeft: 20 }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="dl-third" style={cell}>
        <CellHeader title={62} note={132} />
        <div style={{ marginTop: 12 }}>
          {["62%", "86%", "74%"].map((w, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderTop: rowRule,
              }}
            >
              <Bone w={7} h={7} r="50%" style={{ margin: "0 1px 0 2px" }} />
              <Line w={w} lh={21} style={{ flex: 1 }} />
            </div>
          ))}
        </div>
      </div>
      <div className="dl-third" style={cell}>
        <CellHeader title={72} note={84} />
        <div style={{ marginTop: 12 }}>
          {["82%", "68%", "90%"].map((w, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderTop: rowRule,
              }}
            >
              <Bone w={22} h={22} r="50%" />
              <Line w={w} lh={21} style={{ flex: 1 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BreakdownSkeleton() {
  return (
    <div className="dl-grid">
      <section
        className="dl-third"
        style={{ padding: "18px var(--dl-gutter) 20px" }}
      >
        <div className="flex items-start justify-between" style={{ gap: 12 }}>
          <div>
            <Line w={66} lh={21} h={11} />
            <Line w={196} lh={19.5} style={{ marginTop: 1 }} />
          </div>
          <Bone w={24} h={24} r="50%" />
        </div>
        <div
          className="flex flex-wrap items-center"
          style={{ gap: "4px 9px", height: 38, marginTop: 16 }}
        >
          <Bone w={128} h={32} r={7} />
          <Bone w={112} h={9} />
        </div>
        <div style={{ position: "relative", height: 92, marginTop: 18 }}>
          {[31, 64, 91].map((at) => (
            <div
              key={at}
              style={{
                position: "absolute",
                left: `${at}%`,
                top: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 7,
                transform: "translateX(-50%)",
              }}
            >
              <Bone w={34} h={8} />
              <Bone w={42} h={10} />
            </div>
          ))}
          <Bone
            w="100%"
            h={22}
            r={6}
            style={{ position: "absolute", left: 0, top: 45 }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 78,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {[10, 26, 26, 26, 26, 26].map((w, i) => (
              <Bone key={i} w={w} h={8} />
            ))}
          </div>
        </div>
        <div
          className="flex items-center justify-between"
          style={{
            gap: "8px 16px",
            minHeight: 21,
            marginTop: 18,
            paddingTop: 16,
            borderTop: rowRule,
          }}
        >
          <Bone w={72} h={9} />
          <div className="flex items-center" style={{ gap: 10 }}>
            <Bone w={157} h={7} r={2} />
            <Bone w={30} h={10} />
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          <Bone w={86} h={22} r={6} />
          <Bone w={134} h={22} r={6} />
        </div>
      </section>
      <section
        className="dl-third"
        style={{ padding: "18px var(--dl-gutter) 8px" }}
      >
        <Line w={132} lh={21} h={11} />
        <Line w={92} lh={19.5} style={{ marginTop: 1 }} />
        <div style={{ marginTop: 12 }}>
          {[
            [74, "100%"],
            [48, "86%"],
            [68, "59%"],
            [62, "32%"],
            [56, "12%"],
          ].map(([name, fill], i) => (
            <div
              key={i}
              style={{ padding: "9px 0 10px", borderTop: rowRule }}
            >
              <div className="flex items-center" style={{ gap: 10, height: 21 }}>
                <Bone w={name} h={10} />
                <Bone w={34} h={9} style={{ marginLeft: "auto" }} />
                <Bone w={44} h={10} />
              </div>
              <div
                style={{
                  height: 5,
                  marginTop: 7,
                  borderRadius: 3,
                  background: "var(--dl-track)",
                }}
              >
                <Bone w={fill} h={5} r={3} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section
        className="dl-third"
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "18px var(--dl-gutter) 18px",
        }}
      >
        <Line w={150} lh={21} h={11} />
        <Line w={168} lh={19.5} style={{ marginTop: 1 }} />
        <div
          className="flex flex-1 flex-wrap items-center"
          style={{ gap: "12px 18px", marginTop: 10 }}
        >
          <Bone
            w="auto"
            h="auto"
            r="50%"
            style={{ flex: "1 1 133px", maxWidth: 180, aspectRatio: "1 / 1" }}
          />
          <div style={{ flex: "1 1 100px", minWidth: 0 }}>
            {[88, 104, 62, 54, 66, 72].map((w, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  height: 30,
                  borderTop: i === 0 ? undefined : rowRule,
                }}
              >
                <Bone w={w} h={9} />
                <Bone w={8} h={9} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function DealsSkeleton() {
  return (
    <div className="dl-grid dl-grow">
      <section
        className="dl-two-thirds"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: "6px 16px", padding: "18px var(--dl-gutter) 14px" }}
        >
          <div className="flex items-center" style={{ gap: 9, height: 21 }}>
            <Bone w={68} h={11} />
            <Bone w={22} h={20} r={6} />
            <Bone w={98} h={9} />
          </div>
          <Bone w={94} h={9} />
        </div>
        <div style={{ overflowX: "hidden" }}>
          <div style={{ minWidth: TABLE_MIN_WIDTH }}>
            <TableHeadSkeleton
              columns={TOP_DEALS_COLUMNS}
              widths={[8, 30, 38, 28, 36]}
            />
            {[
              [142, 62, "100%"],
              [136, 50, "48%"],
              [128, 84, "38%"],
              [122, 84, "30%"],
              [108, 50, "22%"],
              [96, 62, "18%"],
            ].map(([name, stage, size], i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: TOP_DEALS_COLUMNS,
                  columnGap: 16,
                  alignItems: "center",
                  minHeight: 54,
                  padding: "0 var(--dl-gutter)",
                  borderBottom: i === 5 ? undefined : rowRule,
                }}
              >
                <Bone w={8} h={9} />
                <div
                  style={{ display: "flex", alignItems: "center", gap: 11 }}
                >
                  <Bone w={32} h={32} r={9} />
                  <Bone w={name} h={10} />
                </div>
                <div>
                  <Line w={stage} lh={19.5} />
                  <Bone w={81} h={3} r={2} style={{ marginTop: 5 }} />
                </div>
                <div
                  style={{
                    height: 5,
                    borderRadius: 3,
                    background: "var(--dl-track)",
                  }}
                >
                  <Bone w={size} h={5} r={3} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Bone w={64} h={10} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        className="dl-third"
        style={{ padding: "18px var(--dl-gutter) 14px" }}
      >
        <div className="flex items-start justify-between" style={{ gap: 12 }}>
          <div>
            <Line w={138} lh={21} h={11} />
            <Line w={132} lh={19.5} style={{ marginTop: 1 }} />
          </div>
          <Bone w={56} h={24} r={7} />
        </div>
        {[
          [44, [108, 116]],
          [66, [150, 96]],
          [58, [60]],
        ].map(([day, items], gi) => (
          <div key={gi}>
            <div
              className="flex items-center"
              style={{ gap: 10, height: 28, marginTop: gi === 0 ? 8 : 4 }}
            >
              <Bone w={day as number} h={9} />
              <span
                style={{ flex: 1, height: 1, background: "var(--dl-row)" }}
              />
              <Bone w={62} h={9} />
            </div>
            {(items as number[]).map((title, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "46px 3px minmax(0, 1fr)",
                  columnGap: 12,
                  alignItems: "center",
                  padding: "7px 0",
                }}
              >
                <Bone w={40} h={10} />
                <Bone w={3} h={40.5} r={2} />
                <div>
                  <Line w={title} lh={21} h={10} />
                  <Line w={title + 78} lh={19.5} h={8} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading dashboard" title="Dashboard">
      <SummarySkeleton />
      <OverviewSkeleton />
      <AttentionSkeleton />
      <SignalsSkeleton />
      <BreakdownSkeleton />
      <DealsSkeleton />
    </DaylightSkeletonFrame>
  );
}
