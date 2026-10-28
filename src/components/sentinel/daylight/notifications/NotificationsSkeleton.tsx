import { DividerRow } from "../blocks";
import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";
import { NOTIFICATIONS_DECK } from "./model";
import { RowsSkeleton } from "./RowsSkeleton";

const LINE_BARS =
  "repeating-linear-gradient(to bottom, transparent 0 7px, #000 7px 17px, transparent 17px 24px)";

function HeroSkeleton({ actions }: { actions: number[] }) {
  return (
    <section className="dl-hero">
      <div className="dl-hero-lead">
        <Bone w={96} h={26} r={999} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "var(--dl-headline-size)",
            marginTop: 16,
          }}
        >
          <Bone
            w="min(100%, calc(var(--dl-headline-size) * 6.2))"
            h="calc(var(--dl-headline-size) * 0.7)"
            r={8}
          />
        </div>
        <div
          className="dl-hero-clause"
          style={{ display: "flex", alignItems: "center", height: "1.2em", marginTop: 8 }}
        >
          <Bone w="min(82%, calc(var(--dl-headline-size) * 5.4))" h="0.52em" />
        </div>
      </div>
      <div className="dl-hero-side">
        <div style={{ position: "relative", maxWidth: 560 }}>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "transparent",
              userSelect: "none",
            }}
          >
            {NOTIFICATIONS_DECK}
          </p>
          <span
            className="dl-skel"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 0,
              maskImage: LINE_BARS,
              WebkitMaskImage: LINE_BARS,
            }}
          />
        </div>
        <div className="dl-hero-actions">
          {actions.map((w, i) => (
            <Bone key={i} w={w} h={36} r={9} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CountsSkeleton() {
  return (
    <div className="dl-grid">
      {[48, 36, 44, 58].map((label, i) => (
        <div key={i} className="dl-kpi">
          <Line w={label} lh={19.5} />
          <div
            className="dl-kpi-value"
            style={{ display: "flex", alignItems: "center", height: "1.15em", marginTop: 4 }}
          >
            <Bone w={i === 3 ? 36 : 28} h="0.68em" r={6} />
          </div>
          <Line w={[96, 52, 92, 76][i]} lh={18.75} h={8} style={{ marginTop: 6 }} />
        </div>
      ))}
    </div>
  );
}

function ViewBarSkeleton() {
  return (
    <div className="dl-viewbar">
      <div className="dl-viewbar-tabs" style={{ alignItems: "center" }}>
        <Bone w={20} h={12} />
        <Bone w={74} h={12} />
      </div>
      <div className="dl-viewbar-controls">
        <div
          className="dl-filter-field dl-nt-search"
          style={{ boxShadow: "none", borderColor: "transparent", padding: 0 }}
        >
          <Bone w="100%" h="100%" r={10} />
        </div>
        <Bone w={50} h={9} />
      </div>
    </div>
  );
}

export function NotificationsSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading notifications" title="Notifications">
      <HeroSkeleton actions={[112, 157]} />
      <CountsSkeleton />
      <ViewBarSkeleton />
      <div className="dl-grow">
        <DividerRow>
          <Bone w={40} h={8} />
        </DividerRow>
        <RowsSkeleton rows={2} />
        <DividerRow>
          <Bone w={64} h={8} />
        </DividerRow>
        <RowsSkeleton rows={3} />
      </div>
    </DaylightSkeletonFrame>
  );
}
