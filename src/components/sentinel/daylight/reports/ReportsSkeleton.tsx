import {
  CellBody,
  CellHeadSkeleton,
  HBarSkeleton,
  HeroSkeleton,
  KpiRowSkeleton,
  KvSkeleton,
  ListRowsSkeleton,
  TableSkeleton,
} from "../page-skeleton";
import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";

const WEEKDAY_HEIGHTS = [44, 22, 66, 112, 66, 66, 66];

export function ReportsSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading reports" title="Reports">
      <HeroSkeleton actions={[118, 124]} />
      <KpiRowSkeleton labels={[92, 86, 98, 48]} />

      <div className="dl-grid">
        <div className="dl-third">
          <CellHeadSkeleton title={70} sub={140} />
          <CellBody>
            <KvSkeleton rows={[[96, 14], [84, 46], [80, 54], [76, 14]]} />
          </CellBody>
        </div>
        <div className="dl-third">
          <CellHeadSkeleton title={110} sub={130} />
          <CellBody>
            <ListRowsSkeleton rows={[150, 130, 140]} height={56} />
          </CellBody>
        </div>
        <div className="dl-third">
          <CellHeadSkeleton title={120} sub={190} right={86} />
          <CellBody>
            <ListRowsSkeleton rows={[150, 170, 160]} height={56} />
          </CellBody>
        </div>
      </div>

      <div className="dl-grid">
        <div className="dl-two-thirds">
          <CellHeadSkeleton title={120} sub={180} />
          <TableSkeleton
            columns="minmax(0, 1.1fr) 56px 96px minmax(0, 1.2fr) 88px 84px"
            narrowColumns="minmax(0, 1fr) auto auto"
            minWidth="640px"
            head={[40, 36, 40, 90, 54, 60]}
            wide={[false, true, false, true, false, true]}
            rows={7}
            rowHeight={48}
          />
        </div>
        <div className="dl-third">
          <CellHeadSkeleton title={140} sub={120} />
          <CellBody>
            <Bone w="100%" h={7} r={2} />
            <div style={{ marginTop: 12 }}>
              <KvSkeleton rows={[[48, 120], [62, 120], [40, 120], [130, 30]]} />
            </div>
          </CellBody>
        </div>
      </div>

      <div className="dl-grid">
        <div className="dl-half">
          <CellHeadSkeleton title={170} sub={140} />
          <div style={{ padding: "4px var(--dl-gutter) 20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: 10,
                alignItems: "end",
                height: 150,
              }}
            >
              {WEEKDAY_HEIGHTS.map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "center" }}>
                  <Bone w="100%" h={h} r="3px 3px 0 0" style={{ maxWidth: 44 }} />
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 8, borderTop: "1px solid var(--dl-divider)" }}>
              <Line w="100%" lh={16} h={7} />
            </div>
          </div>
        </div>
        <div className="dl-half">
          <CellHeadSkeleton title={64} sub={200} />
          <div style={{ padding: "4px var(--dl-gutter) 20px" }}>
            <HBarSkeleton rows={[80, 70, 76, 76, 60]} columns="96px minmax(0, 1fr) 32px" />
            <Line w={330} lh={19.5} style={{ marginTop: 10 }} />
          </div>
        </div>
      </div>

      <div className="dl-grow">
        <CellHeadSkeleton title={100} sub={170} right={190} />
        <TableSkeleton
          columns="minmax(0, 1.3fr) 104px 96px minmax(0, 1.5fr) 144px"
          narrowColumns="minmax(0, 1fr) auto"
          minWidth="820px"
          head={[30, 40, 30, 80, 90]}
          wide={[false, false, true, true, true]}
          rows={8}
        />
      </div>
    </DaylightSkeletonFrame>
  );
}
