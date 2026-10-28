import {
  BigFigureSkeleton,
  CellBody,
  CellHeadSkeleton,
  HBarSkeleton,
  HeroSkeleton,
  KpiRowSkeleton,
  KvSkeleton,
} from "../page-skeleton";
import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";

function QueueSkeleton({ rows, detailed = true }: { rows: number[]; detailed?: boolean }) {
  return (
    <div className="dl-third">
      <CellHeadSkeleton title={70} sub={18} right={70} compact />
      <div style={{ padding: "0 var(--dl-gutter) 12px" }}>
        <Line w={230} lh={19.5} />
      </div>
      {rows.map((w, i) => (
        <div
          key={i}
          style={{ padding: "12px var(--dl-gutter) 13px", borderTop: "1px solid var(--dl-row)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 21 }}>
            <Bone w={w} h={11} />
            <Bone w={40} h={11} />
          </div>
          {detailed && <Line w={170} lh={24} h={8} />}
          <Line w={210} lh={19} h={8} />
        </div>
      ))}
    </div>
  );
}

export function AlertsSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading alerts" title="Alerts">
      <HeroSkeleton actions={[150, 124]} />
      <KpiRowSkeleton labels={[60, 56, 96, 84]} />

      <div className="dl-grid">
        <QueueSkeleton rows={[130, 140, 120]} />
        <QueueSkeleton rows={[120, 136]} />
        <QueueSkeleton rows={[124, 100, 118, 130, 126]} detailed={false} />
      </div>

      <div className="dl-grid">
        <div className="dl-third">
          <CellHeadSkeleton title={62} sub={150} />
          <CellBody>
            <Bone w="100%" h={7} r={2} />
            <div style={{ marginTop: 12 }}>
              <KvSkeleton rows={[[48, 120], [62, 120], [40, 120]]} />
            </div>
          </CellBody>
        </div>
        <div className="dl-third">
          <CellHeadSkeleton title={86} sub={140} />
          <CellBody>
            <BigFigureSkeleton />
            <Line w={240} lh={19.5} />
            <div style={{ marginTop: 12 }}>
              <KvSkeleton rows={[[160, 50], [200, 60], [170, 14]]} />
            </div>
          </CellBody>
        </div>
        <div className="dl-third">
          <CellHeadSkeleton title={92} sub={190} />
          <CellBody>
            <HBarSkeleton rows={[70, 60, 70, 86]} columns="96px minmax(0, 1fr) 40px" />
            <Line w={180} lh={19} h={8} style={{ marginTop: 12 }} />
          </CellBody>
        </div>
      </div>

      <div className="dl-grow" style={{ display: "flex", flexDirection: "column" }}>
        <CellHeadSkeleton title={160} sub={300} right={300} />
        <div className="dl-grid" style={{ flexGrow: 1, borderTop: "1px solid var(--dl-divider)" }}>
          {[190, 150, 150, 140].map((w, i) => (
            <div key={i} className="dl-quarter" style={{ padding: "18px var(--dl-gutter) 20px" }}>
              <Line w={w} lh={21} h={11} />
              <Line w="92%" lh={19.5} style={{ marginTop: 4 }} />
              <Line w="70%" lh={19.5} />
              <Line w={150} lh={20} style={{ marginTop: 14 }} />
            </div>
          ))}
        </div>
      </div>
    </DaylightSkeletonFrame>
  );
}
