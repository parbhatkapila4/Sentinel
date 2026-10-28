import { CellHeadSkeleton } from "../page-skeleton";
import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";
import { tableHeadStyle } from "../ui";
import { COPY, WEBHOOK_LIST_COLUMNS } from "./parts";

const rowRule = "1px solid var(--dl-row)";
const LETTER = 0.497;
const CONTENT_BOX = 1.31;
const SPACE = 0.25;

export function TextBone({
  text,
  fontSize,
  lh,
  h = 8,
}: {
  text: string;
  fontSize: number;
  lh: number;
  h?: number;
}) {
  const size = h / CONTENT_BOX;
  const letterSpacing = (fontSize - size) * LETTER;
  const wordSpacing = SPACE * (fontSize - size) - letterSpacing;
  return (
    <span style={{ display: "block", fontSize, lineHeight: `${lh}px` }}>
      <span
        className="dl-skel"
        style={{
          display: "inline",
          fontSize: size,
          lineHeight: 0,
          letterSpacing,
          wordSpacing,
          color: "transparent",
          WebkitBoxDecorationBreak: "clone",
          boxDecorationBreak: "clone",
        }}
      >
        {text}
      </span>
    </span>
  );
}

export function BackHeroSkeleton({
  back,
  chip,
  deck,
  actions,
}: {
  back: number;
  chip: number;
  deck: string | number;
  actions: number[];
}) {
  return (
    <section className="dl-hero">
      <div className="dl-hero-lead">
        <span style={{ display: "flex", alignItems: "center", height: 20.25, marginBottom: 14 }}>
          <Bone w={back} h={10} />
        </span>
        <Bone w={chip} h={26} r={999} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "var(--dl-headline-size)",
            marginTop: 16,
          }}
        >
          <Bone
            w="min(100%, calc(var(--dl-headline-size) * 7.4))"
            h="calc(var(--dl-headline-size) * 0.7)"
            r={8}
          />
        </div>
        <div
          className="dl-hero-clause"
          style={{ display: "flex", alignItems: "center", height: "1.2em", marginTop: 8 }}
        >
          <Bone w="min(82%, calc(var(--dl-headline-size) * 5.2))" h="0.52em" />
        </div>
      </div>
      <div className="dl-hero-side">
        <div style={{ maxWidth: 560 }}>
          {typeof deck === "string" ? (
            <TextBone text={deck} fontSize={15} lh={24} h={10} />
          ) : (
            <Line w={deck} lh={24} h={10} />
          )}
        </div>
        {actions.length > 0 && (
          <div className="dl-hero-actions">
            {actions.map((w, i) => (
              <Bone key={i} w={w} h={36} r={9} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function SectionHeadSkeleton({
  title,
  sub,
  right,
}: {
  title: number;
  sub: string;
  right?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "6px 16px",
        padding: "22px var(--dl-gutter) 12px",
      }}
    >
      <div>
        <Line w={title} lh={22.5} h={12} />
        <span style={{ display: "block", marginTop: 2 }}>
          <TextBone text={sub} fontSize={13} lh={19.5} h={9} />
        </span>
      </div>
      {right !== undefined && <Bone w={right} h={30} r={8} />}
    </div>
  );
}

export function RowLabelSkeleton({ label, sub }: { label: number; sub?: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <Line w={label} lh={21} h={11} />
      {sub && (
        <span style={{ display: "block", marginTop: 2 }}>
          <TextBone text={sub} fontSize={12.5} lh={18.125} />
        </span>
      )}
    </div>
  );
}

export function WebhookFormSkeleton() {
  return (
    <>
      <div className="dl-st-row">
        <RowLabelSkeleton label={92} sub={COPY.nameNote} />
        <Bone w="100%" h={36} r={9} />
      </div>
      <div className="dl-st-row">
        <RowLabelSkeleton
          label={128}
          sub={COPY.urlNote}
        />
        <Bone w="100%" h={36} r={9} />
      </div>
      <div className="dl-st-row">
        <RowLabelSkeleton label={48} sub={COPY.eventsPick} />
        <div className="dl-checks">
          {[86, 92, 84, 72, 70].map((w, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 9, minHeight: 34 }}>
              <Bone w={15} h={15} r={4} />
              <Bone w={w} h={10} />
            </span>
          ))}
        </div>
      </div>
      <div className="dl-form-foot" style={{ justifyContent: "flex-start" }}>
        <Bone w={134} h={36} r={9} className="dl-wh-tap-bone" />
      </div>
    </>
  );
}

const LIST_ROWS = [128, 104];

export function WebhooksBodySkeleton() {
  return (
    <div aria-hidden style={{ display: "contents" }}>
      <BackHeroSkeleton back={66} chip={98} deck={COPY.heroDeck} actions={[134]} />
      <section className="dl-st-sec">
        <CellHeadSkeleton title={112} sub={80} />
        <div className="dl-table" style={WEBHOOK_LIST_COLUMNS}>
          <div className="dl-table-grid" style={tableHeadStyle}>
            <span style={{ display: "flex" }}>
              <Bone w={56} h={8} />
            </span>
            {[42, 44, 66].map((w, i) => (
              <span key={i} className="dl-c-wide" style={{ display: "flex" }}>
                <Bone w={w} h={8} />
              </span>
            ))}
            <span className="dl-c-wide" />
          </div>
          {LIST_ROWS.map((w, i) => (
            <div
              key={i}
              className="dl-table-grid"
              style={{
                minHeight: 56,
                paddingTop: 10,
                paddingBottom: 10,
                borderBottom: i === LIST_ROWS.length - 1 ? 0 : rowRule,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                <Bone w={32} h={32} r={9} style={{ flex: "0 0 32px" }} />
                <div style={{ minWidth: 0 }}>
                  <Line w={w} lh={21} h={11} />
                  <Line w={w - 24} lh={18.75} h={8} />
                </div>
              </div>
              <span className="dl-c-wide" style={{ display: "flex" }}>
                <Bone w={42} h={20} r={6} />
              </span>
              <span className="dl-c-wide" style={{ display: "flex" }}>
                <Line w={52} lh={19.5} h={9} />
              </span>
              <span className="dl-c-wide" style={{ display: "flex" }}>
                <Line w={28} lh={19.5} h={9} />
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, justifySelf: "end" }}>
                <Bone w={84} h={30} r={8} />
                <Bone w={56} h={30} r={8} />
                <Bone w={30} h={30} r={8} />
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="dl-st-sec dl-grow">
        <SectionHeadSkeleton
          title={112}
          sub={COPY.formSub}
        />
        <WebhookFormSkeleton />
      </section>
    </div>
  );
}

export function WebhooksSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading webhooks" title="Webhooks">
      <WebhooksBodySkeleton />
    </DaylightSkeletonFrame>
  );
}
