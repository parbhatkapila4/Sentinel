import type { CSSProperties } from "react";
import { CellHeadSkeleton } from "../page-skeleton";
import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";
import { tableHeadStyle } from "../ui";
import { TeamHeroSkeleton } from "./skeleton-parts";

const COLUMNS = {
  "--cols": "minmax(0, 1fr) 140px 140px 150px 92px",
  "--cols-n": "minmax(0, 1fr) 70px",
} as CSSProperties;

const ROWS = [128, 164, 112];

export function TeamsSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading teams" title="Teams">
      <TeamHeroSkeleton back="Settings" chip={76} actions={[112]} />
      <section className="dl-grow">
        <CellHeadSkeleton title={78} sub={150} />
        <div className="dl-table" style={COLUMNS}>
          <div className="dl-table-grid" style={tableHeadStyle}>
            <Bone w={34} h={8} />
            <Bone w={58} h={8} className="dl-c-wide" />
            <Bone w={52} h={8} className="dl-c-wide" />
            <Bone w={50} h={8} className="dl-c-wide" />
            <span />
          </div>
          {ROWS.map((w, i) => (
            <div
              key={i}
              className="dl-table-grid"
              style={{
                minHeight: 56,
                paddingTop: 10,
                paddingBottom: 10,
                borderBottom: i === ROWS.length - 1 ? 0 : "1px solid var(--dl-row)",
              }}
            >
              <div className="dl-person">
                <Bone w={32} h={32} r={9} />
                <div>
                  <Line w={w} lh={21} h={11} />
                  <span className="dl-narrow-only">
                    <Line w={96} lh={18.75} h={8} />
                  </span>
                </div>
              </div>
              <Bone w={52} h={20} r={6} className="dl-c-wide" />
              <Bone w={74} h={9} className="dl-c-wide" />
              <Bone w={88} h={9} className="dl-c-wide" />
              <span style={{ justifySelf: "end" }}>
                <Bone w={56} h={30} r={8} />
              </span>
            </div>
          ))}
        </div>
      </section>
    </DaylightSkeletonFrame>
  );
}
