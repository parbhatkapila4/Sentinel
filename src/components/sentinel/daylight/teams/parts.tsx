import type { CSSProperties, ReactNode } from "react";
import { Pill } from "../blocks";

export function TeamSection({
  id,
  title,
  sub,
  danger = false,
  grow = false,
  children,
}: {
  id: string;
  title: string;
  sub: ReactNode;
  danger?: boolean;
  grow?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={grow ? "dl-st-sec dl-grow" : "dl-st-sec"}
    >
      <div style={{ padding: "22px var(--dl-gutter) 12px" }}>
        <h2
          id={`${id}-title`}
          style={{
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: danger ? "var(--dl-signal-d)" : undefined,
          }}
        >
          {title}
        </h2>
        <p style={{ marginTop: 2, fontSize: 13, color: "var(--dl-muted)" }}>{sub}</p>
      </div>
      {children}
    </section>
  );
}

export function Person({
  initials,
  name,
  detail,
  me = false,
}: {
  initials: string;
  name: string;
  detail: string;
  me?: boolean;
}) {
  return (
    <div className="dl-person">
      <span aria-hidden className={me ? "dl-initials is-me" : "dl-initials"}>
        {initials}
      </span>
      <div>
        <b>
          {name}
          {me && (
            <span style={{ marginLeft: 4 }}>
              <Pill>You</Pill>
            </span>
          )}
        </b>
        <small>{detail}</small>
      </div>
    </div>
  );
}

export const moreButtonStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  minHeight: 0,
  padding: 0,
  borderRadius: 9,
  background: "var(--dl-panel)",
  border: "1px solid var(--dl-border)",
  boxShadow: "var(--dl-shadow)",
  color: "var(--dl-text-2)",
  cursor: "pointer",
};

export function MoreVerticalIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

export const metaStrongStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--dl-ink)",
};
