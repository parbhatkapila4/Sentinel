"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

interface PopoverOptions {
  side?: "bottom" | "top" | "auto";
  align?: "start" | "end";
  gap?: number;
  estimatedHeight?: number;
}

export interface PopoverAnchor {
  style: CSSProperties;
  host: Element;
}

const EDGE = 12;

export function usePopover({
  side = "bottom",
  align = "end",
  gap = 8,
  estimatedHeight = 160,
}: PopoverOptions = {}) {
  const [anchor, setAnchor] = useState<PopoverAnchor | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const open = anchor !== null;

  const close = useCallback((restoreFocus = false) => {
    setAnchor(null);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const toggle = () => {
    if (open) {
      setAnchor(null);
      return;
    }
    const trigger = triggerRef.current;
    const host = trigger?.closest(".sentinel-daylight");
    if (!trigger || !host) return;
    const rect = trigger.getBoundingClientRect();
    const roomBelow = window.innerHeight - rect.bottom - gap;
    const above =
      side === "top" ||
      (side === "auto" &&
        roomBelow < estimatedHeight &&
        rect.top - gap > roomBelow);

    const style: CSSProperties = above
      ? { bottom: Math.max(EDGE, window.innerHeight - rect.top + gap) }
      : { top: rect.bottom + gap };
    if (align === "end") {
      style.right = Math.max(EDGE, window.innerWidth - rect.right);
    } else {
      style.left = Math.max(EDGE, rect.left);
    }
    setAnchor({ style, host });
  };

  useEffect(() => {
    if (!open) return;
    const inside = (target: EventTarget | null) =>
      target instanceof Node &&
      (triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const onDown = (e: MouseEvent) => {
      if (!inside(e.target)) close();
    };
    const onScroll = (e: Event) => {
      if (!inside(e.target)) close();
    };
    const onResize = () => close();
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  return { open, anchor, triggerRef, panelRef, toggle, close };
}

export const menuItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  width: "100%",
  height: 34,
  padding: "0 10px",
  border: 0,
  borderRadius: 8,
  background: "transparent",
  fontSize: 13.5,
  color: "var(--dl-ink)",
  textAlign: "left",
  cursor: "pointer",
};

export function MenuHeading({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: "6px 10px 5px",
        fontFamily: "var(--dl-font-mono)",
        fontSize: 10.5,
        fontWeight: 500,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "var(--dl-muted)",
      }}
    >
      {children}
    </div>
  );
}

export function MenuDivider() {
  return (
    <div
      aria-hidden
      style={{ height: 1, margin: "6px 4px", background: "var(--dl-divider)" }}
    />
  );
}

export function Menu({
  anchor,
  panelRef,
  onClose,
  label,
  width,
  children,
}: {
  anchor: PopoverAnchor | null;
  panelRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  label: string;
  width: number;
  children: ReactNode;
}) {

  useEffect(() => {
    if (!anchor) return;
    panelRef.current
      ?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')
      ?.focus();
  }, [anchor, panelRef]);

  if (!anchor) return null;

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      onClose();
      return;
    }
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled)'
      )
    );
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLElement);
    const target =
      e.key === "ArrowDown"
        ? items[(current + 1) % items.length]
        : e.key === "ArrowUp"
          ? items[(current - 1 + items.length) % items.length]
          : e.key === "Home"
            ? items[0]
            : e.key === "End"
              ? items[items.length - 1]
              : null;
    if (!target) return;
    e.preventDefault();
    target.focus();
  };

  return createPortal(
    <div
      ref={panelRef}
      role="menu"
      aria-label={label}
      onKeyDown={onKeyDown}
      style={{
        position: "fixed",
        zIndex: 60,
        width,
        maxWidth: `calc(100vw - ${EDGE * 2}px)`,
        padding: 6,
        borderRadius: 12,
        background: "var(--dl-panel)",
        border: "1px solid var(--dl-border)",
        boxShadow: "var(--dl-shadow-pop)",
        color: "var(--dl-ink)",
        ...anchor.style,
      }}
    >
      {children}
    </div>,
    anchor.host
  );
}
