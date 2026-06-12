"use client";

import Link from "next/link";

interface SettingsHeroProps {
  issueMark: string;
  accountLine: string;
  subLine: string;
  versionLine: string;
  planName: string;
  planTag: string;
  planSub: string;
  dealsUsed: number | null;
  dealsLimit: number;
  onUpgrade: () => void;
  upgradeHref?: string;
}

export function SettingsHero({
  issueMark,
  accountLine,
  subLine,
  versionLine,
  planName,
  planTag,
  planSub,
  dealsUsed,
  dealsLimit,
  onUpgrade,
  upgradeHref,
}: SettingsHeroProps) {
  const pct =
    dealsUsed !== null && dealsLimit > 0
      ? Math.min(100, (dealsUsed / dealsLimit) * 100)
      : 0;
  const usedDisplay = dealsUsed === null ? "-" : dealsUsed;

  return (
    <section
      className="sentinel-settings-hero"
      style={{
        padding: "48px 32px 40px",
        borderBottom: "1px solid var(--rule)",
        display: "grid",
        gridTemplateColumns: "minmax(140px, 160px) minmax(0, 1fr) minmax(280px, 340px)",
        gap: 48,
        position: "relative",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "40%",
          height: "100%",
          background:
            "radial-gradient(ellipse at 100% 20%, rgba(200, 71, 46, 0.04) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          borderRight: "1px solid var(--rule)",
          paddingRight: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
          }}
        >
          Section -
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 60,
            lineHeight: 0.85,
            color: "var(--cream)",
            letterSpacing: "-0.04em",
          }}
        >
          {issueMark}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 11,
            color: "var(--cream-2)",
            letterSpacing: "0.06em",
            lineHeight: 1.6,
            textTransform: "uppercase",
          }}
        >
          <strong style={{ color: "var(--cream)", fontWeight: 500 }}>
            {accountLine}
          </strong>
          <br />
          {subLine}
          <br />
          {versionLine}
        </div>
      </div>

      <div
        className="sentinel-settings-lead"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--copper)",
          }}
        >
          THE PROPRIETOR&apos;S DESK
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(40px, 5.4vw, 68px)",
            fontWeight: 400,
            lineHeight: 0.92,
            letterSpacing: "-0.035em",
            color: "var(--cream)",
            margin: 0,
          }}
        >
          Manage the{" "}
          <i style={{ fontStyle: "italic", color: "var(--signal)" }}>desk.</i>
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            fontStyle: "italic",
            fontWeight: 400,
            lineHeight: 1.45,
            color: "var(--cream-2)",
            maxWidth: 560,
            letterSpacing: "-0.005em",
            margin: 0,
          }}
        >
          Your profile, your team, your integrations, and the thresholds
          Sentinel uses to decide what counts as trouble. Tune the instrument
          to match your taste.
        </p>
      </div>

      <aside
        style={{
          background: "var(--ink-02)",
          border: "1px solid var(--rule)",
          padding: "20px 22px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minWidth: 0,
          alignSelf: "center",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -1,
            left: 18,
            width: 42,
            height: 2,
            background: "var(--signal)",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
          }}
        >
          <span>CURRENT PLAN</span>
          <span
            style={{
              color: "var(--signal)",
              padding: "2px 7px",
              border: "1px solid var(--signal)",
            }}
          >
            {planTag}
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 34,
            fontStyle: "italic",
            color: "var(--cream)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {planName}
          <span
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontStyle: "normal",
              fontSize: 13,
              color: "var(--cream-3)",
              display: "block",
              marginTop: 2,
              letterSpacing: "-0.005em",
            }}
          >
            {planSub}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: "var(--cream-3)" }}>DEALS USED</span>
            <span
              className="tabular"
              style={{
                color: "var(--cream)",
                fontWeight: 500,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {usedDisplay} / {dealsLimit}
            </span>
          </div>
          <div
            style={{
              height: 3,
              background: "var(--rule)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              aria-hidden
              className="sentinel-bar-fill"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: `${pct}%`,
                background: "var(--signal)",
              }}
            />
          </div>
        </div>

        {upgradeHref ? (
          <Link
            href={upgradeHref}
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--signal)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 2,
              textDecoration: "none",
            }}
          >
            Upgrade to Pro <span aria-hidden>→</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onUpgrade}
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--signal)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 2,
              background: "transparent",
              border: "none",
              padding: 0,
              textAlign: "left",
            }}
          >
            Upgrade to Pro <span aria-hidden>→</span>
          </button>
        )}
      </aside>
    </section>
  );
}
