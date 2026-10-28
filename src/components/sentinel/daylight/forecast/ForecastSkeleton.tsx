import {
  CellBody,
  CellHeadSkeleton,
  HeroSkeleton,
  KpiRowSkeleton,
  KvSkeleton,
  TableSkeleton,
} from "../page-skeleton";
import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";

function BoardColumnSkeleton({ rows }: { rows: number[] }) {
  return (
    <div className="dl-quarter">
      <CellHeadSkeleton title={84} sub={18} right={44} compact />
      <div style={{ padding: "0 var(--dl-gutter) 12px" }}>
        <Line w={150} lh={19.5} />
      </div>
      {rows.map((w, i) => (
        <div
          key={i}
          style={{
            padding: "12px var(--dl-gutter) 13px",
            borderTop: "1px solid var(--dl-row)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", height: 21, alignItems: "center" }}>
            <Bone w={w} h={11} />
            <Bone w={40} h={11} />
          </div>
          <Line w={170} lh={24} h={8} />
          <Line w={130} lh={19} h={8} />
        </div>
      ))}
    </div>
  );
}

export function ForecastSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading forecast" title="Forecast">
      <HeroSkeleton actions={[122, 104]} />
      <KpiRowSkeleton labels={[92, 80, 128, 124]} />

      <div className="dl-grid">
        <div className="dl-two-thirds">
          <CellHeadSkeleton title={110} sub={230} right={170} />
          <div style={{ padding: "2px var(--dl-gutter) 22px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <Line w={70} lh={19.5} />
                  <Bone w={86} h={20} r={6} style={{ margin: "6px 0 4px" }} />
                  <Line w={140} lh={18.75} h={8} />
                </div>
              ))}
            </div>
            <div style={{ height: 64, marginTop: 22, display: "flex", alignItems: "center" }}>
              <Bone w="100%" h={10} r={3} />
            </div>
            <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--dl-row)" }}>
              <Line w={190} lh={19.5} />
              <Bone w="100%" h={10} r={2} style={{ marginTop: 10 }} />
              <Line w={360} lh={19} h={8} style={{ marginTop: 10 }} />
            </div>
          </div>
        </div>
        <div className="dl-third">
          <CellHeadSkeleton title={118} sub={170} />
          <CellBody>
            <KvSkeleton rows={[[150, 34], [80, 64], [130, 54], [150, 22], [140, 26], [190, 28]]} />
          </CellBody>
        </div>
      </div>

      <div style={{ borderBottom: "1px solid var(--dl-divider)" }}>
        <CellHeadSkeleton title={62} sub={230} />
        <TableSkeleton
          columns="minmax(0, 1.2fr) 64px minmax(0, 1.5fr) 96px 104px 84px 84px 96px"
          narrowColumns="minmax(0, 1fr) auto auto"
          minWidth="900px"
          head={[40, 36, 76, 70, 60, 50, 30, 60]}
          wide={[false, true, true, false, false, true, true, true]}
          rows={5}
        />
      </div>

      <div className="dl-grid dl-grow">
        <BoardColumnSkeleton rows={[120, 128, 104]} />
        <BoardColumnSkeleton rows={[112, 90, 126, 104]} />
        <BoardColumnSkeleton rows={[130, 124, 104, 96]} />
        <BoardColumnSkeleton rows={[116, 112, 92, 120]} />
      </div>
    </DaylightSkeletonFrame>
  );
}
