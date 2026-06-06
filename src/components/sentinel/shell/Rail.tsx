"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRealtime } from "@/hooks/use-realtime";
import { getUserProfile } from "@/app/actions/user";

interface RailNavItem {
  label: string;
  href: string;
  iconPaths: React.ReactNode;
  alertDot?: boolean;
}

interface RailProps {
  alertCount: number;
}

export function Rail({ alertCount }: RailProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [navPending, setNavPending] = useState(false);

  const startNavPending = () => {
    setNavPending(true);
    window.setTimeout(() => setNavPending(false), 10000);
  };

  useEffect(() => {
    setNavPending(false);
  }, [pathname]);

  useRealtime({
    onEvent(ev) {
      if (
        ev.type === "deal.updated" ||
        ev.type === "deal.created" ||
        ev.type === "deal.deleted" ||
        ev.type === "deal.at_risk"
      ) {
        router.refresh();
      }
    },
  });

  const items: RailNavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      iconPaths: (
        <>
          <path d="M3 12l9-9 9 9" />
          <path d="M5 10v10h14V10" />
        </>
      ),
    },
    {
      label: "Deals",
      href: "/deals",
      iconPaths: (
        <>
          <path d="M4 7h16v13H4z" />
          <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
          <path d="M4 12h16" />
        </>
      ),
    },
    {
      label: "Analytics",
      href: "/analytics",
      iconPaths: (
        <>
          <path d="M3 3v18h18" />
          <path d="M7 14l4-4 4 4 5-5" />
        </>
      ),
    },
    {
      label: "Top Deals",
      href: "/top-deals",
      iconPaths: (
        <>
          <path d="M7 4h10v3a5 5 0 01-10 0V4z" />
          <path d="M7 6H5a2 2 0 002 4M17 6h2a2 2 0 01-2 4" />
          <path d="M9 20h6M12 14v6" />
        </>
      ),
    },
    {
      label: "Forecast",
      href: "/deals-by-stage",
      iconPaths: (
        <>
          <rect x="3" y="12" width="4" height="8" />
          <rect x="10" y="8" width="4" height="12" />
          <rect x="17" y="4" width="4" height="16" />
        </>
      ),
    },
    {
      label: "Alerts",
      href: "/risk-overview",
      iconPaths: (
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M14 21a2 2 0 01-4 0" />
      ),
      alertDot: alertCount > 0,
    },
    {
      label: "AI",
      href: "/insights",
      iconPaths: (
        <>
          <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
          <path d="M19 14l.8 2 2 .8-2 .8L19 19.6l-.8-2-2-.8 2-.8z" />
        </>
      ),
    },
    {
      label: "Reports",
      href: "/reports",
      iconPaths: (
        <>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h5" />
        </>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const HorizontalBar = (
    <div
      className="flex lg:hidden items-center gap-1 px-3 py-2 border-b sticky top-0 z-30 overflow-x-auto scrollbar-hide [&>*]:shrink-0"
      style={{
        background: "var(--ink)",
        borderColor: "var(--rule)",
      }}
    >
      <Link
        href="/"
        aria-label="Home"
        onClick={startNavPending}
        className="h-9 w-9 grid place-items-center border mr-2"
        style={{
          color: "var(--signal)",
          borderColor: "var(--rule-strong)",
          background: "var(--ink-02)",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 17,
        }}
      >
        S
      </Link>
      <Link
        href="/deals/new"
        aria-label="New deal"
        title="New deal"
        onClick={startNavPending}
        className="h-9 w-9 grid place-items-center border mr-1"
        style={{
          color:
            pathname === "/deals/new" ? "var(--ink)" : "var(--signal)",
          borderColor: "var(--signal)",
          background:
            pathname === "/deals/new" ? "var(--signal)" : "transparent",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={15}
          height={15}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={startNavPending}
            aria-label={item.label}
            className="h-9 w-9 grid place-items-center relative"
            style={{
              color: active ? "var(--signal)" : "var(--cream-3)",
              background: active ? "rgba(200,71,46,0.08)" : "transparent",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width={15}
              height={15}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {item.iconPaths}
            </svg>
            {item.alertDot && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 5,
                  height: 5,
                  background: "var(--copper)",
                  borderRadius: "50%",
                }}
              />
            )}
          </Link>
        );
      })}
      <div className="flex-1" />
      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.push("/");
          router.refresh();
        }}
        className="h-9 px-3 text-[10px] uppercase font-mono-jb"
        style={{
          color: "var(--cream-3)",
          letterSpacing: "0.14em",
          fontFamily: "var(--font-mono-jb)",
          background: "transparent",
        }}
      >
        Sign out
      </button>
    </div>
  );

  const VerticalRail = (
    <aside
      className="hidden lg:flex flex-col items-center sticky top-0 z-10 border-r"
      style={{
        width: 64,
        height: "100vh",
        background: "var(--ink)",
        borderColor: "var(--rule)",
        padding: "16px 0",
      }}
      aria-label="Primary navigation"
    >
      <Link
        href="/"
        aria-label="Sentinel home"
        onClick={startNavPending}
        className="grid place-items-center relative"
        style={{
          width: 34,
          height: 34,
          border: "1px solid var(--rule-strong)",
          background: "var(--ink-02)",
          color: "var(--signal)",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 19,
          marginBottom: 24,
        }}
      >
        S
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            width: 6,
            height: 6,
            background: "var(--signal)",
            border: "1px solid var(--ink)",
            borderRadius: "50%",
          }}
        />
      </Link>

      <Link
        href="/deals/new"
        aria-label="New deal"
        title="New deal"
        onClick={startNavPending}
        className="grid place-items-center relative group"
        style={{
          width: 34,
          height: 34,
          border: "1px solid var(--signal)",
          background:
            pathname === "/deals/new" ? "var(--signal)" : "transparent",
          color:
            pathname === "/deals/new" ? "var(--ink)" : "var(--signal)",
          marginBottom: 14,
          transition: "background 140ms ease, color 140ms ease",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={15}
          height={15}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>

      <div
        aria-hidden
        style={{
          width: 18,
          height: 1,
          background: "var(--rule)",
          marginBottom: 14,
        }}
      />

      <nav
        className="flex flex-col gap-[2px] w-full"
        style={{ padding: "0 10px" }}
        aria-label="Sentinel rail"
      >
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={startNavPending}
              title={item.label}
              aria-label={item.label}
              className="relative grid place-items-center"
              style={{
                aspectRatio: "1",
                borderRadius: 4,
                color: active ? "var(--signal)" : "var(--cream-4)",
                background: active ? "rgba(200,71,46,0.06)" : "transparent",
                transition: "color 120ms ease, background 120ms ease",
              }}
            >
              {active && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: -11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 2,
                    height: 14,
                    background: "var(--signal)",
                  }}
                />
              )}
              <svg
                viewBox="0 0 24 24"
                width={15}
                height={15}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {item.iconPaths}
              </svg>
              {item.alertDot && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 5,
                    height: 5,
                    background: "var(--copper)",
                    borderRadius: "50%",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <Link
        href="/settings"
        title="Settings"
        aria-label="Settings"
        onClick={startNavPending}
        className="grid place-items-center mb-3 relative"
        style={{
          width: 34,
          height: 34,
          color: isActive("/settings") ? "var(--signal)" : "var(--cream-3)",
          background: isActive("/settings")
            ? "rgba(200,71,46,0.06)"
            : "transparent",
          borderRadius: 4,
          transition: "color 120ms ease, background 120ms ease",
        }}
      >
        {isActive("/settings") && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: -11,
              top: "50%",
              transform: "translateY(-50%)",
              width: 2,
              height: 14,
              background: "var(--signal)",
            }}
          />
        )}
        <svg
          viewBox="0 0 24 24"
          width={16}
          height={16}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </Link>

      <RailAvatar
        open={avatarOpen}
        onToggle={() => setAvatarOpen((o) => !o)}
        onClose={() => setAvatarOpen(false)}
        onSignOut={async () => {
          await signOut();
          router.push("/");
          router.refresh();
        }}
      />
    </aside>
  );

  return (
    <>
      {navPending && (
        <div
          aria-live="polite"
          aria-label="Loading"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: "rgba(245, 237, 214, 0.08)",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                display: "block",
                width: "28%",
                height: "100%",
                background: "var(--signal)",
                animation: "sentinel-nav-pending-slide 1.1s ease-in-out infinite",
              }}
            />
          </div>
          <style>{`
            @keyframes sentinel-nav-pending-slide {
              0% { transform: translateX(-140%); }
              50% { transform: translateX(240%); }
              100% { transform: translateX(-140%); }
            }
          `}</style>
        </div>
      )}
      {HorizontalBar}
      {VerticalRail}
    </>
  );
}

function RailAvatar({
  open,
  onToggle,
  onClose,
  onSignOut,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSignOut: () => void | Promise<void>;
}) {
  const { user, isLoaded } = useUser();
  const [imgBroken, setImgBroken] = useState(false);
  const [dbImageUrl, setDbImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await getUserProfile();
        if (!cancelled) setDbImageUrl(profile?.imageUrl ?? null);
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = () => onClose();
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  const imageUrl = dbImageUrl ?? user?.imageUrl ?? null;
  const fallbackInitial = (
    user?.firstName?.[0] ??
    user?.username?.[0] ??
    user?.primaryEmailAddress?.emailAddress?.[0] ??
    "S"
  ).toUpperCase();
  const accountLabel =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    "Account";

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={accountLabel}
        title={accountLabel}
        className="grid place-items-center overflow-hidden"
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background:
            imageUrl && !imgBroken
              ? "var(--ink-02)"
              : "linear-gradient(135deg, var(--signal) 0%, var(--copper) 100%)",
          color: "var(--cream)",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 15,
          border: "1px solid var(--rule-strong)",
          padding: 0,
        }}
      >
        {imageUrl && !imgBroken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={accountLabel}
            referrerPolicy="no-referrer"
            onError={() => setImgBroken(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : isLoaded ? (
          <span aria-hidden>{fallbackInitial}</span>
        ) : (
          <span aria-hidden style={{ opacity: 0 }}>
            S
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute"
          style={{
            left: 44,
            bottom: 0,
            width: 180,
            background: "var(--ink-02)",
            border: "1px solid var(--rule-strong)",
            padding: 6,
            zIndex: 50,
          }}
        >
          <Link
            href="/notifications"
            role="menuitem"
            className="block px-3 py-2 text-[12px]"
            style={{
              color: "var(--cream-2)",
              fontFamily: "var(--font-mono-jb)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Notifications
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void onSignOut()}
            className="block w-full text-left px-3 py-2 text-[12px]"
            style={{
              color: "var(--signal)",
              fontFamily: "var(--font-mono-jb)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
