import { Bone } from "../bone";

const TITLE_WIDTHS = ["42%", "48%", "38%", "45%", "40%", "50%"];
const MESSAGE_WIDTHS = ["56%", "50%", "62%", "47%", "58%", "52%"];

export function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="dl-nt-row">
          <span className="dl-nt-cat">
            <Bone w={8} h={8} r={2} />
            <Bone w={i % 2 ? 54 : 70} h={8} />
            {"\u200B"}
          </span>
          <div className="dl-nt-main">
            <div style={{ display: "flex", alignItems: "center", height: 21 }}>
              <Bone w={TITLE_WIDTHS[i % TITLE_WIDTHS.length]} h={11} />
            </div>
            <div style={{ display: "flex", alignItems: "center", height: 19.5, marginTop: 3 }}>
              <Bone w={MESSAGE_WIDTHS[i % MESSAGE_WIDTHS.length]} h={9} />
            </div>
          </div>
          <div className="dl-nt-side">
            <span className="dl-nt-when">
              <Bone w={44} h={9} />
            </span>
            <Bone w={84} h={30} r={8} />
            <Bone w={30} h={30} r={8} />
          </div>
        </div>
      ))}
    </div>
  );
}
