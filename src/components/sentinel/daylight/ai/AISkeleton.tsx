import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";

const bar = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minHeight: 56,
  padding: "10px var(--dl-gutter)",
  borderBottom: "1px solid var(--dl-divider)",
} as const;

const row = { borderTop: "1px solid var(--dl-row)" } as const;

function SidebarThreadsSkeleton() {
  return (
    <div className="dl-side-threads" aria-hidden>
      <div className="dl-side-threads-head" style={{ height: 30 }}>
        <Bone w={84} h={11} />
        <Bone w={62} h={30} r={8} />
      </div>
      <Bone w="100%" h={36} r={9} style={{ flexShrink: 0, marginTop: 10 }} />
      <div className="dl-side-threads-list">
        <div className="dl-side-threads-group">
          <Bone w={60} h={8} />
        </div>
        {[150, 120, 140].map((w, i) => (
          <div key={i} style={{ padding: "8px 10px 9px 12px" }}>
            <Line w={w} lh={19} h={10} />
            <Line w={130} lh={17} h={8} style={{ marginTop: 3 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AISkeleton() {
  return (
    <DaylightSkeletonFrame
      label="Loading Sentinel AI"
      title="Sentinel AI"
      pageNav={<SidebarThreadsSkeleton />}
    >
      <div className="dl-ai-ws dl-grow">
        <div className="dl-ai-threads">
          <div style={{ ...bar, justifyContent: "space-between" }}>
            <Bone w={84} h={11} />
            <Bone w={62} h={30} r={8} />
          </div>
          <div style={{ padding: "12px var(--dl-gutter) 2px" }}>
            <Bone w="100%" h={36} r={9} />
          </div>
          {[0, 1].map((g) => (
            <div key={g}>
              <div style={{ padding: "18px var(--dl-gutter) 8px" }}>
                <Bone w={60} h={8} />
              </div>
              {[180, 150, 170].slice(0, g === 0 ? 3 : 2).map((w, i) => (
                <div key={i} style={{ ...row, padding: "13px var(--dl-gutter) 14px" }}>
                  <Line w={w} lh={19} h={10} />
                  <Line w={130} lh={20} h={8} style={{ marginTop: 5 }} />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="dl-ai-center">
          <div style={bar}>
            <Bone w={96} h={11} />
            <Bone w={52} h={9} />
          </div>
          <div style={{ padding: "clamp(24px, 3.4cqw, 44px) var(--dl-gutter) 22px" }}>
            <Bone w="min(100%, 420px)" h={40} r={8} />
            <Line w="min(100%, 480px)" lh={24} h={10} style={{ marginTop: 14 }} />
            <Line w="min(80%, 300px)" lh={24} h={10} />
          </div>
          <div className="dl-ai-prompts">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="dl-ai-prompt" style={{ cursor: "default" }}>
                <Bone w={150} h={14} />
                <div style={{ alignSelf: "stretch", marginTop: 10 }}>
                  <Line w="92%" lh={20} h={9} />
                  <Line w="70%" lh={20} h={9} />
                </div>
                <Bone w={70} h={8} style={{ marginTop: 14 }} />
              </div>
            ))}
          </div>
          <div style={{ padding: "18px var(--dl-gutter) 0" }}>
            <Bone w={52} h={9} />
            <div style={{ marginTop: 10 }}>
              {[240, 300, 220, 260].map((w, i) => (
                <div key={i} style={{ ...row, padding: "13px 0" }}>
                  <Bone w={w} h={10} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: "auto", padding: "24px var(--dl-gutter) 20px" }}>
            <Bone w="100%" h={108} r={12} />
          </div>
        </div>

        <div className="dl-ai-ctx">
          <div className="dl-ai-book">
            <div style={{ padding: "18px var(--dl-gutter) 14px" }}>
              <Bone w={84} h={11} />
            </div>
            <div style={{ padding: "0 var(--dl-gutter) 16px", borderBottom: "1px solid var(--dl-divider)" }}>
              {[90, 96, 92, 130].map((w, i) => (
                <div key={i} style={{ ...row, display: "flex", justifyContent: "space-between", alignItems: "center", height: 44 }}>
                  <Bone w={w} h={9} />
                  <Bone w={38} h={11} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "18px var(--dl-gutter) 14px" }}>
            <Bone w={140} h={11} />
          </div>
          <div style={{ padding: "0 var(--dl-gutter) 16px" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ ...row, display: "flex", alignItems: "center", gap: 11, height: 58 }}>
                <Bone w={32} h={32} r={9} />
                <span style={{ flex: 1 }}>
                  <Line w={90} lh={19} h={10} />
                  <Line w={130} lh={18} h={8} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DaylightSkeletonFrame>
  );
}
