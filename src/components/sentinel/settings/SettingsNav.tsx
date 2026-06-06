"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export interface NavSection {
  id: string;
  label: string;
  number: string;
  iconPaths: React.ReactNode;
}

interface SettingsNavProps {
  sections: NavSection[];
}

export function SettingsNav({ sections }: SettingsNavProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0) ||
              (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0)
          );
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
    if (typeof window !== "undefined" && window.history) {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const match = sections.find((s) => s.id === hash);
    if (!match) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [sections]);

  return (
    <aside
      className="sentinel-settings-nav"
      style={{
        borderRight: "1px solid var(--rule)",
        padding: "24px 0",
        position: "sticky",
        top: 52,
        alignSelf: "flex-start",
        minWidth: 0,
      }}
      aria-label="Settings sections"
    >
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
          padding: "0 28px 12px",
        }}
      >
        Sections
      </div>

      {sections.map((s) => {
        const active = activeId === s.id;
        return (
          <button
            type="button"
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className="sentinel-settings-navitem"
            style={{
              display: "grid",
              gridTemplateColumns: "22px 1fr auto",
              gap: 14,
              alignItems: "center",
              padding: "11px 28px",
              cursor: "pointer",
              borderLeft: `2px solid ${active ? "var(--signal)" : "transparent"}`,
              color: active ? "var(--cream)" : "var(--cream-2)",
              background: active ? "var(--ink-02)" : "transparent",
              transition: "all 140ms ease",
              width: "100%",
              textAlign: "left",
              border: "none",
              borderLeftWidth: 2,
              borderLeftStyle: "solid",
              borderLeftColor: active ? "var(--signal)" : "transparent",
              fontFamily: "var(--font-geist-sans)",
            }}
          >
            <span
              aria-hidden
              style={{
                color: active ? "var(--signal)" : "var(--cream-3)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width={13}
                height={13}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {s.iconPaths}
              </svg>
            </span>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 450,
                letterSpacing: "-0.005em",
              }}
            >
              {s.label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9.5,
                color: active ? "var(--signal)" : "var(--cream-4)",
                letterSpacing: "0.1em",
              }}
            >
              {s.number}
            </span>
          </button>
        );
      })}

      <div
        style={{
          margin: "18px 28px",
          borderTop: "1px solid var(--rule)",
        }}
      />
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
          padding: "0 28px 12px",
        }}
      >
        Support
      </div>
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        style={navBtnStyle}
      >
        <span aria-hidden style={iconStyle}>
          <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
        </span>
        <span style={labelStyle}>Back to desk</span>
        <span style={numStyle}>→</span>
      </button>
      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.push("/");
          router.refresh();
        }}
        style={navBtnStyle}
      >
        <span aria-hidden style={iconStyle}>
          <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M16 17l5-5-5-5M21 12H9M13 21H5a2 2 0 01-2-2V5a2 2 0 012-2h8" />
          </svg>
        </span>
        <span style={labelStyle}>Sign out</span>
        <span style={numStyle}>⏎</span>
      </button>
    </aside>
  );
}

const navBtnStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "22px 1fr auto",
  gap: 14,
  alignItems: "center",
  padding: "11px 28px",
  cursor: "pointer",
  color: "var(--cream-2)",
  background: "transparent",
  transition: "all 140ms ease",
  width: "100%",
  textAlign: "left",
  border: "none",
  borderLeft: "2px solid transparent",
  fontFamily: "var(--font-geist-sans)",
};
const iconStyle: React.CSSProperties = {
  color: "var(--cream-3)",
  display: "grid",
  placeItems: "center",
};
const labelStyle: React.CSSProperties = {
  fontSize: 13.5,
  fontWeight: 450,
  letterSpacing: "-0.005em",
};
const numStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 9.5,
  color: "var(--cream-4)",
  letterSpacing: "0.1em",
};
