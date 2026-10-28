import { HeroSkeleton } from "../page-skeleton";
import { Bone, Line } from "../skeleton-parts";
import { InviteFrame } from "./WorkspaceInvite";

const ROWS: Array<{ label: number; hint: number | null; value: number }> = [
  { label: 72, hint: null, value: 110 },
  { label: 56, hint: 170, value: 150 },
  { label: 70, hint: 150, value: 58 },
  { label: 54, hint: null, value: 96 },
];

export function WorkspaceInviteSkeleton() {
  return (
    <InviteFrame>
      <span className="sr-only" role="status">
        Loading invitation
      </span>
      <div aria-hidden style={{ display: "contents" }}>
        <HeroSkeleton actions={[134]} />
        <div className="dl-grow">
          <div className="dl-st-sec">
            <div style={{ padding: "22px var(--dl-gutter) 12px" }}>
              <Line w={96} lh={22} h={12} />
              <Line w={180} lh={19.5} h={9} style={{ marginTop: 2 }} />
            </div>
            {ROWS.map((row, i) => (
              <div key={i} className="dl-st-row dl-st-inline">
                <div>
                  <Line w={row.label} lh={21} h={11} />
                  {row.hint !== null && (
                    <Line w={row.hint} lh={18} h={8} style={{ marginTop: 2 }} />
                  )}
                </div>
                <div className="dl-st-ctl dl-st-end">
                  <Bone w={row.value} h={10} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InviteFrame>
  );
}
