import { HeroSkeleton } from "../page-skeleton";
import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";
import { SETTINGS_SECTIONS } from "./model";

const SECTIONS: Array<{ title: number; sub: number; rows: number[] }> = [
  { title: 56, sub: 180, rows: [60, 80, 64, 50, 70, 40] },
  { title: 64, sub: 170, rows: [70, 150, 110] },
  { title: 92, sub: 230, rows: [80, 90, 110] },
];

export function SettingsBodySkeleton() {
  return (
    <div aria-hidden style={{ display: "contents" }}>
      <HeroSkeleton actions={[118, 96]} />
      <div className="dl-st-wrap dl-grow">
        <div className="dl-st-nav">
          {SETTINGS_SECTIONS.map((s, i) => (
            <span key={s.id} style={{ display: "flex", alignItems: "center", flexShrink: 0, minHeight: 34, padding: "0 10px" }}>
              <Bone w={52 + (i % 3) * 18} h={10} />
            </span>
          ))}
        </div>
        <div className="dl-st-body">
          {SECTIONS.map((section, si) => (
            <div key={si} className="dl-st-sec">
              <div style={{ padding: "22px var(--dl-gutter) 12px" }}>
                <Line w={section.title} lh={22} h={12} />
                <Line w={section.sub} lh={19.5} h={9} style={{ marginTop: 2 }} />
              </div>
              {section.rows.map((w, ri) => (
                <div key={ri} className="dl-st-row" style={{ minHeight: 65 }}>
                  <Line w={w} lh={21} h={11} />
                  <Bone w="100%" h={36} r={9} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SidebarSectionsSkeleton() {
  return (
    <div className="dl-side-sub" aria-hidden>
      {SETTINGS_SECTIONS.map((s, i) => (
        <span
          key={s.id}
          aria-current={i === 0 ? "true" : undefined}
          className={s.id === "settings-danger" ? "dl-st-danger" : undefined}
        >
          {s.label}
        </span>
      ))}
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <DaylightSkeletonFrame
      label="Loading settings"
      title="Settings"
      pageNav={<SidebarSectionsSkeleton />}
    >
      <SettingsBodySkeleton />
    </DaylightSkeletonFrame>
  );
}
