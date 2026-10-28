"use client";

import { useEffect, useRef, useState } from "react";
import { SETTINGS_SECTIONS } from "./model";

const ACTIVE_LINE = 0.2;
const SCROLL_SETTLE_MS = 150;

interface JumpState {
  pending: boolean;
  timer: number;
}

function sectionInView(): string {
  const view = window.innerHeight;
  const room = document.documentElement.scrollHeight - view;
  const atEnd = room > 2 && window.scrollY >= room - 2;
  let current: string = SETTINGS_SECTIONS[0].id;
  for (const s of SETTINGS_SECTIONS) {
    const top = document.getElementById(s.id)?.getBoundingClientRect().top;
    if (top === undefined) continue;
    if (top <= view * ACTIVE_LINE || (atEnd && top < view)) current = s.id;
  }
  return current;
}

function holdUntilSettled(jump: JumpState) {
  window.clearTimeout(jump.timer);
  jump.timer = window.setTimeout(() => {
    jump.pending = false;
  }, SCROLL_SETTLE_MS);
}

function useActiveSection() {
  const [active, setActive] = useState<string>(SETTINGS_SECTIONS[0].id);
  const jumpRef = useRef<JumpState>({ pending: false, timer: 0 });

  useEffect(() => {
    const jump = jumpRef.current;
    let frame = 0;
    const update = () => {
      frame = 0;
      setActive(sectionInView());
    };
    const onScroll = () => {
      if (jump.pending) {
        holdUntilSettled(jump);
        return;
      }
      if (!frame) frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(jump.timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const select = (id: string) => {
    jumpRef.current.pending = true;
    holdUntilSettled(jumpRef.current);
    setActive(id);
  };

  return [active, select] as const;
}

export function SectionNav({
  placement = "page",
}: {
  placement?: "page" | "sidebar";
}) {
  const [active, select] = useActiveSection();

  return (
    <nav
      className={placement === "sidebar" ? "dl-side-sub" : "dl-st-nav"}
      aria-label="Settings sections"
    >
      {SETTINGS_SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-current={active === s.id ? "true" : undefined}
          className={s.id === "settings-danger" ? "dl-st-danger" : undefined}
          onClick={() => select(s.id)}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
