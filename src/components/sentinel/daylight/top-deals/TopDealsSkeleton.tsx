import {
  BigFigureSkeleton,
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

export function TopDealsSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading top deals" title="Top deals">
      <HeroSkeleton actions={[122, 104]} />
      <KpiRowSkeleton labels={[82, 92, 132, 88]} />

      <div className="dl-grid">
        <div className="dl-third">
          <CellHeadSkeleton title={128} sub={190} />
          <CellBody>
            <BigFigureSkeleton />
            <Line w={170} lh={19.5} />
            <Bone w="100%" h={7} r={2} style={{ marginTop: 14 }} />
            <div style={{ marginTop: 14 }}>
              <ListRowsSkeleton rows={[120, 112, 132]} lead />
            </div>
          </CellBody>
        </div>
        <div className="dl-third">
          <CellHeadSkeleton title={78} sub={140} />
          <CellBody>
            <BigFigureSkeleton />
            <Line w="78%" lh={19.5} />
            <div style={{ marginTop: 14 }}>
              <KvSkeleton rows={[[100, 46], [92, 40], [170, 34]]} />
            </div>
          </CellBody>
        </div>
        <div className="dl-third">
          <CellHeadSkeleton title={128} sub={110} right={78} />
          <CellBody>
            <ListRowsSkeleton rows={[140, 150, 126]} />
            <KvSkeleton rows={[[100, 44], [170, 44]]} />
          </CellBody>
        </div>
      </div>

      <div style={{ borderBottom: "1px solid var(--dl-divider)" }}>
        <CellHeadSkeleton title={104} sub={220} right={190} />
        <TableSkeleton
          columns="28px minmax(0, 1.45fr) 112px 96px 150px 88px 104px minmax(0, 1.55fr)"
          narrowColumns="22px minmax(0, 1fr) auto"
          minWidth="980px"
          head={[10, 30, 40, 40, 90, 30, 80, 80]}
          wide={[false, false, true, false, true, true, true, true]}
          rows={12}
        />
      </div>

      <div className="dl-grid dl-grow">
        <div className="dl-half">
          <CellHeadSkeleton title={112} sub={170} />
          <CellBody style={{ paddingBottom: 20 }}>
            <HBarSkeleton rows={[70, 64, 84, 78, 80]} />
          </CellBody>
        </div>
        <div className="dl-half">
          <CellHeadSkeleton title={140} sub={190} right={96} />
          <CellBody style={{ paddingBottom: 20 }}>
            <HBarSkeleton rows={[110, 104, 120, 118]} columns="minmax(0, 1fr) 96px 64px" />
          </CellBody>
        </div>
      </div>
    </DaylightSkeletonFrame>
  );
}
