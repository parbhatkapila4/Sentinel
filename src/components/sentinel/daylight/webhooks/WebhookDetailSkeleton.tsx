import { CellHeadSkeleton } from "../page-skeleton";
import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";
import { tableHeadStyle } from "../ui";
import { COPY, DELIVERY_COLUMNS } from "./parts";
import { BackHeroSkeleton, RowLabelSkeleton, SectionHeadSkeleton } from "./WebhooksSkeleton";

const DELIVERY_ROWS = [96, 84, 88, 102, 96];

export function WebhookDetailBodySkeleton() {
  return (
    <div aria-hidden style={{ display: "contents" }}>
      <BackHeroSkeleton back={82} chip={58} deck={286} actions={[96, 74]} />
      <section className="dl-st-sec">
        <SectionHeadSkeleton title={104} sub={COPY.configSub} right={48} />
        <div className="dl-st-row">
          <RowLabelSkeleton label={96} />
          <Bone w="100%" h={36} r={9} />
        </div>
        <div className="dl-st-row">
          <RowLabelSkeleton label={52} sub={COPY.eventsNote} />
          <span style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[86, 94, 82].map((w, i) => (
              <Bone key={i} w={w} h={20} r={6} />
            ))}
          </span>
        </div>
        <div className="dl-st-row">
          <RowLabelSkeleton label={48} sub={COPY.statusNote} />
          <span style={{ display: "flex" }}>
            <Bone w={40} h={20} r={6} />
          </span>
        </div>
        <div className="dl-st-row">
          <RowLabelSkeleton label={104} sub={COPY.secretNote} />
          <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <Bone w="auto" h={36} r={9} style={{ flex: "1 1 220px" }} />
            <Bone w={66} h={30} r={8} />
            <Bone w={94} h={30} r={8} />
          </span>
        </div>
      </section>
      <section className="dl-st-sec dl-grow">
        <CellHeadSkeleton title={128} sub={64} />
        <div className="dl-table" style={DELIVERY_COLUMNS}>
          <div className="dl-table-grid" style={tableHeadStyle}>
            <span style={{ display: "flex" }}>
              <Bone w={44} h={8} />
            </span>
            <span style={{ display: "flex" }}>
              <Bone w={38} h={8} />
            </span>
            <span className="dl-c-wide" style={{ display: "flex" }}>
              <Bone w={60} h={8} />
            </span>
            <span style={{ display: "flex", justifyContent: "flex-end" }}>
              <Bone w={32} h={8} />
            </span>
          </div>
          {DELIVERY_ROWS.map((w, i) => (
            <div
              key={i}
              className="dl-table-grid"
              style={{
                minHeight: 56,
                paddingTop: 10,
                paddingBottom: 10,
                borderBottom: i === DELIVERY_ROWS.length - 1 ? 0 : "1px solid var(--dl-row)",
              }}
            >
              <span style={{ display: "flex" }}>
                <Bone w={44} h={20} r={6} />
              </span>
              <Line w={w} lh={19.5} h={9} />
              <span className="dl-c-wide" style={{ display: "flex" }}>
                <Line w={i === 2 ? 220 : 28} lh={21} h={9} />
              </span>
              <span style={{ display: "flex", justifyContent: "flex-end" }}>
                <Line w={84} lh={19.5} h={9} />
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function WebhookDetailSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading webhook" title="Webhooks">
      <WebhookDetailBodySkeleton />
    </DaylightSkeletonFrame>
  );
}
