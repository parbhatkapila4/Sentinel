"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavAuthActions() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isLoaded) {
    return (
      <div className="nav-actions" aria-busy="true">
        <span className="btn-fill landing-nav-auth-skeleton" aria-hidden>
          Log in <span className="arr">→</span>
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="nav-actions">
        <Link className="btn-fill" href="/sign-in">
          Log in <span className="arr">→</span>
        </Link>
      </div>
    );
  }

  const display =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "Account";
  const email = user.primaryEmailAddress?.emailAddress ?? null;
  const initial = display.trim().charAt(0).toUpperCase() || "?";
  const src = user.imageUrl;

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut(() => router.replace("/"));
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <div className="nav-actions landing-nav-auth-signed" ref={wrapRef}>
      <Link className="btn-fill" href="/dashboard">
        Dashboard <span className="arr">→</span>
      </Link>
      <button
        type="button"
        className="landing-nav-avatar"
        onClick={() => setOpen((o) => !o)}
        title={display}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${display}`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            width={36}
            height={36}
            className="landing-nav-avatar-img"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="landing-nav-avatar-fallback" aria-hidden>
            {initial}
          </span>
        )}
      </button>

      {open ? (
        <div
          className="landing-nav-account-menu"
          role="menu"
          aria-label="Account"
        >
          <div className="landing-nav-account-meta">
            <div className="landing-nav-account-name">{display}</div>
            {email ? (
              <div className="landing-nav-account-email">{email}</div>
            ) : null}
          </div>
          <button
            type="button"
            role="menuitem"
            className="landing-nav-account-action"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <path
                d="M10 12l4-4-4-4M14 8H6M9 14H3a1 1 0 01-1-1V3a1 1 0 011-1h6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{signingOut ? "Logging out…" : "Logout"}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
