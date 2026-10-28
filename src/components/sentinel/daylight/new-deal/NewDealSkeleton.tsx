import { CellHeadSkeleton } from "../page-skeleton";
import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";


const rowRule = "1px solid var(--dl-row)";

function HeadSkeleton({ title, sub }: { title: number; sub: number }) {
  return (
    <div style={{ padding: "22px var(--dl-gutter) 12px" }}>
      <Line w={title} lh={22.5} h={11} />
      <Line w={sub} lh={19.5} h={9} style={{ marginTop: 2 }} />
    </div>
  );
}

function FieldSkeleton({ label, note }: { label: number; note?: number }) {
  return (
    <div>
      <Line w={label} lh={19.5} h={9} style={{ marginBottom: 6 }} />
      <Bone w="100%" h={36} r={9} />
      {note !== undefined && <Line w={note} lh={17.4} h={8} style={{ marginTop: 6 }} />}
    </div>
  );
}
type OptionBones = [number, number, number?];

function OptionsSkeleton({ options }: { options: OptionBones[] }) {
  return (
    <div className="dl-dd-body">
      <div className="dl-options">
        {options.map(([title, description, wrapped], i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "10px 12px",
              border: "1px solid transparent",
            }}
          >
            <Bone w={15} h={15} r="50%" style={{ marginTop: 3 }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <Line w={title} lh={21} h={10} />
              <Line w={description} lh={18.125} h={8} style={{ marginTop: 1 }} />
              {wrapped !== undefined && (
                <div className="dl-wide-only">
                  <Line w={wrapped} lh={18.125} h={8} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KvSkeletonRow({
  label,
  value,
  height,
  top,
}: {
  label: number;
  value: number;
  height: number;
  top?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height,
        marginTop: top,
        borderTop: rowRule,
      }}
    >
      <Bone w={label} h={9} />
      <Bone w={value} h={11} />
    </div>
  );
}

export function NewDealBodySkeleton() {
  return (
    <div aria-hidden style={{ display: "contents" }}>
      <section className="dl-hero">
        <div className="dl-hero-lead">
          <Line w={72} lh={20.25} h={9} style={{ marginBottom: 14 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "var(--dl-headline-size)",
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
            <Bone w="min(82%, calc(var(--dl-headline-size) * 4.9))" h="0.52em" />
          </div>
        </div>
        <div className="dl-hero-side">
          <div style={{ maxWidth: 560 }}>
            <Line w="100%" lh={24} h={10} />
            <Line w="92%" lh={24} h={10} />
            <div className="dl-narrow-only">
              <Line w="38%" lh={24} h={10} />
            </div>
          </div>
        </div>
      </section>

      <div className="dl-grid dl-grow">
        <div className="dl-two-thirds dl-dd-col">
          <div className="dl-dd-sec">
            <HeadSkeleton title={64} sub={196} />
            <div className="dl-form-row is-2">
              <FieldSkeleton label={110} />
              <FieldSkeleton label={104} note={150} />
            </div>
          </div>
          <div className="dl-dd-sec">
            <HeadSkeleton title={96} sub={168} />
            <OptionsSkeleton
              options={[
                [74, 156],
                [92, 140],
                [66, 136],
                [86, 104],
                [82, 110],
                [80, 102],
              ]}
            />
          </div>
          <div className="dl-dd-sec">
            <HeadSkeleton title={60} sub={238} />
            <OptionsSkeleton
              options={[
                [50, 176, 60],
                [58, 170, 64],
                [66, 148],
                [70, 168, 52],
                [62, 150, 58],
              ]}
            />
          </div>
          <div className="dl-dd-sec">
            <HeadSkeleton title={66} sub={150} />
            <div className="dl-form-row is-3">
              <FieldSkeleton label={60} />
            </div>
          </div>
          <div className="dl-form-foot" style={{ justifyContent: "flex-start" }}>
            <Bone w={100} h={36} r={9} className="dl-nd-skel-btn" />
            <Bone w={74} h={36} r={9} className="dl-nd-skel-btn" />
          </div>
        </div>

        <div className="dl-third dl-dd-col">
          <div className="dl-dd-sec">
            <CellHeadSkeleton title={56} sub={150} />
            <div className="dl-dd-body">
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <Bone w={32} h={32} r={9} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Line w={150} lh={21} h={10} />
                  <Line w={110} lh={18.75} h={8} />
                </div>
              </div>
              <KvSkeletonRow label={38} value={70} height={44} top={14} />
              <div style={{ display: "flex", gap: 3, margin: "2px 0 6px" }}>
                {[0, 1, 2, 3].map((i) => (
                  <Bone key={i} w={18} h={3} r={2} />
                ))}
              </div>
              <KvSkeletonRow label={40} value={86} height={45.5} />
            </div>
          </div>
          <div className="dl-dd-sec dl-grow">
            <div className="dl-dd-body" style={{ paddingTop: 18 }}>
              <Line w="100%" lh={20.15} h={8} />
              <Line w="94%" lh={20.15} h={8} />
              <Line w="40%" lh={20.15} h={8} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NewDealSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading the new deal form" title="New deal">
      <NewDealBodySkeleton />
    </DaylightSkeletonFrame>
  );
}
