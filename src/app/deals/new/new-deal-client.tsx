"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { createDeal } from "@/app/actions/deals";
import { getTeamMembers } from "@/app/actions/teams";
import { COUNTRIES } from "@/lib/countries";
import {
  STAGES,
  STAGE_FORM_OPTIONS,
  DEAL_CHANNELS,
  DEAL_CHANNEL_LABELS,
  DEAL_CHANNEL_DESCRIPTIONS,
  type DealChannel,
} from "@/lib/config";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics-client";

import {
  EditorialButton,
  EditorialInput,
  EditorialSelect,
  Field,
} from "@/components/sentinel/settings/primitives";

type TeamItem = { id: string; name: string; slug: string; memberCount: number; myRole: string };
type MemberItem = { id: string; userId: string; role: string; user: { id: string; name: string | null; surname: string | null; email: string } };
const MAX_DEAL_VALUE = 20_000_000_000; // 20B

function StageIcon({ stageValue, size = 18 }: { stageValue: string; size?: number }) {
  const commonProps = {
    width: size,
    height: size,
    fill: "none" as const,
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (stageValue) {
    case STAGES.DISCOVER:
      return (
        <svg {...commonProps}>
          <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      );
    case STAGES.QUALIFY:
      return (
        <svg {...commonProps}>
          <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case STAGES.PROPOSAL:
      return (
        <svg {...commonProps}>
          <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case STAGES.NEGOTIATION:
      return (
        <svg {...commonProps}>
          <path d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-2.186a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      );
    case STAGES.CLOSED_WON:
      return (
        <svg {...commonProps}>
          <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285zm0 0A11.959 11.959 0 0120.401 6 11.99 11.99 0 0021 9.749c0 5.592-3.824 10.29-9 11.623-5.176 1.332-9-6.03-9-11.622 0-1.31.21-2.571.598-3.751h.152c3.196 0 6.1 1.248 8.25 3.285z" />
        </svg>
      );
    case STAGES.CLOSED_LOST:
      return (
        <svg {...commonProps}>
          <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      );
  }
}

export function NewDealClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dealName, setDealName] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [location, setLocation] = useState("");
  const [channel, setChannel] = useState<DealChannel>("direct");
  const [error, setError] = useState("");
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [assignedToId, setAssignedToId] = useState<string>("");
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const locationBtnRef = useRef<HTMLButtonElement>(null);
  const locationMenuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const [shellEl, setShellEl] = useState<HTMLElement | null>(null);

  const selectedStageData = STAGE_FORM_OPTIONS.find((s) => s.value === selectedStage);
  const positionMenu = useCallback(() => {
    const btn = locationBtnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const gap = 4;
    const margin = 12;
    const vh = window.innerHeight;
    const spaceBelow = vh - r.bottom - gap - margin;
    const spaceAbove = r.top - gap - margin;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.round(
      Math.max(160, Math.min(320, openUp ? spaceAbove : spaceBelow))
    );
    const base: CSSProperties = {
      position: "fixed",
      left: Math.round(r.left),
      width: Math.round(r.width),
      maxHeight,
      zIndex: 1000,
    };
    setMenuStyle(
      openUp
        ? { ...base, bottom: Math.round(vh - r.top + gap) }
        : { ...base, top: Math.round(r.bottom + gap) }
    );
  }, []);

  useEffect(() => {
    if (!locationOpen) {
      setMenuStyle(null);
      return;
    }
    setShellEl(
      (locationRef.current?.closest(".sentinel-shell") as HTMLElement | null) ??
      document.body
    );
    positionMenu();
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (locationRef.current?.contains(t)) return;
      if (locationMenuRef.current?.contains(t)) return;
      setLocationOpen(false);
    };
    const reposition = () => positionMenu();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLocationOpen(false);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("keydown", onKey);
    };
  }, [locationOpen, positionMenu]);

  useEffect(() => {
    fetch("/api/teams/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const payload = json?.data ?? json;
        setTeams((payload?.teams ?? []) as TeamItem[]);
      })
      .catch(() => setTeams([]));
  }, []);

  useEffect(() => {
    if (!selectedTeamId) {
      queueMicrotask(() => {
        setMembers([]);
        setAssignedToId("");
      });
      return;
    }
    queueMicrotask(() => setAssignedToId(""));
    getTeamMembers(selectedTeamId)
      .then(setMembers as (m: MemberItem[]) => void)
      .catch(() => setMembers([]));
  }, [selectedTeamId]);

  const formatCurrency = (value: string) => {
    const num = parseInt(value.replace(/,/g, ""), 10);
    if (isNaN(num)) return "";
    return num.toLocaleString("en-US");
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d+$/.test(raw)) {
      if (raw !== "" && parseInt(raw, 10) > MAX_DEAL_VALUE) {
        setError(
          `Max deal value is $${MAX_DEAL_VALUE.toLocaleString("en-US")} (20 billion).`
        );
        return;
      }
      setError((prev) =>
        prev.startsWith("Max deal value is $") ? "" : prev
      );
      setDealValue(raw);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!dealName.trim()) {
      setError("Please enter a deal name");
      return;
    }
    if (!selectedStage) {
      setError("Please select a stage");
      return;
    }
    if (!dealValue || parseInt(dealValue) <= 0) {
      setError("Please enter a valid deal value");
      return;
    }
    if (parseInt(dealValue, 10) > MAX_DEAL_VALUE) {
      setError(
        `Max deal value is $${MAX_DEAL_VALUE.toLocaleString("en-US")} (20 billion).`
      );
      return;
    }

    const formData = new FormData();
    formData.append("name", dealName.trim());
    formData.append("stage", selectedStage);
    formData.append("value", dealValue);
    formData.append("channel", channel);
    if (location) formData.append("location", location);
    if (selectedTeamId) formData.append("teamId", selectedTeamId);
    if (assignedToId) formData.append("assignedToId", assignedToId);

    startTransition(async () => {
      try {
        await createDeal(formData);
        trackEvent(ANALYTICS_EVENTS.DEAL_CREATED);
        router.push("/dashboard");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create deal. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    });
  }

  return (
    <>
      <section
        className="new-deal-hero"
        style={{
          padding: "48px 32px 40px",
          borderBottom: "1px solid var(--rule)",
          display: "grid",
          gridTemplateColumns: "minmax(140px, 160px) minmax(0, 1fr) auto",
          gap: 48,
        }}
      >
        <div
          className="new-deal-marker"
          style={{
            borderRight: "1px solid var(--rule)",
            paddingRight: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cream-3)" }}>
            Section -
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "clamp(40px, 13vw, 60px)", lineHeight: 0.85, color: "var(--cream)", letterSpacing: "-0.04em" }}>
            § NEW
          </div>
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 11, color: "var(--cream-2)", letterSpacing: "0.06em", lineHeight: 1.6, textTransform: "uppercase" }}>
            <strong style={{ color: "var(--cream)", fontWeight: 500 }}>NEW · DEAL</strong>
            <br />
            ONTO THE BOOK
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, minWidth: 0 }}>
          <Link
            href="/dashboard"
            className="sentinel-link-signal"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ← Back to the desk
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(30px, 8vw, 56px)",
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              color: "var(--cream)",
              margin: 0,
            }}
          >
            A new entry in the{" "}
            <em style={{ fontStyle: "italic", color: "var(--signal)", fontFamily: "var(--font-serif)" }}>
              book.
            </em>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.45,
              color: "var(--cream-2)",
              maxWidth: 560,
              margin: 0,
            }}
          >
            Give it a name, a stage, and a number. Everything else is optional for now.
          </p>
        </div>
      </section>

      <section
        className="new-deal-body"
        style={{
          padding: "48px 32px 80px",
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 380px)",
          gap: 48,
          alignItems: "start",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 32 }}
        >
          <Field label="Deal name" note="REQUIRED">
            <EditorialInput
              id="deal-name"
              name="deal-name"
              type="text"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              placeholder="Acme Corp · Enterprise License"
              aria-describedby={error ? "deal-error" : undefined}
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              autoFocus
            />
          </Field>

          <div role="group" aria-labelledby="stage-label">
            <div
              id="stage-label"
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--cream-3)",
                marginBottom: 12,
              }}
            >
              Stage <span style={{ color: "var(--signal)" }}>· REQUIRED</span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                border: "1px solid var(--rule)",
              }}
            >
              {STAGE_FORM_OPTIONS.map((stage) => {
                const active = selectedStage === stage.value;
                return (
                  <button
                    key={stage.value}
                    type="button"
                    onClick={() => setSelectedStage(stage.value)}
                    aria-pressed={active}
                    className="sentinel-stage-tile"
                    style={{
                      display: "flex",
                      gap: 14,
                      padding: "18px 20px",
                      border: "none",
                      borderRight: "1px solid var(--rule)",
                      borderBottom: "1px solid var(--rule)",
                      background: active ? "rgba(200, 71, 46, 0.06)" : "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "inherit",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        color: active ? "var(--signal)" : "var(--cream-2)",
                        display: "inline-flex",
                        marginTop: 2,
                      }}
                    >
                      <StageIcon stageValue={stage.value} />
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: 16,
                          fontStyle: active ? "italic" : "normal",
                          color: active ? "var(--signal)" : "var(--cream)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {stage.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono-jb)",
                          fontSize: 10,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--cream-3)",
                          lineHeight: 1.4,
                        }}
                      >
                        {stage.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div role="group" aria-labelledby="channel-label">
            <div
              id="channel-label"
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--cream-3)",
                marginBottom: 12,
              }}
            >
              Channel <span style={{ color: "var(--signal)" }}>· ATTRIBUTION</span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                border: "1px solid var(--rule)",
              }}
            >
              {DEAL_CHANNELS.map((c, i) => {
                const active = channel === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    aria-pressed={active}
                    className="sentinel-stage-tile"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      padding: "14px 16px",
                      border: "none",
                      borderRight: "1px solid var(--rule)",
                      borderBottom: "1px solid var(--rule)",
                      background: active ? "rgba(200, 71, 46, 0.06)" : "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "inherit",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 15,
                        fontStyle: active ? "italic" : "normal",
                        color: active ? "var(--signal)" : "var(--cream)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {DEAL_CHANNEL_LABELS[c]}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 9.5,
                        letterSpacing: "0.06em",
                        color: "var(--cream-3)",
                        lineHeight: 1.45,
                      }}
                    >
                      {DEAL_CHANNEL_DESCRIPTIONS[c]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Deal value" note="REQUIRED · USD">
            <div style={{ position: "relative" }}>
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 18,
                  color: "var(--cream-3)",
                }}
              >
                $
              </span>
              <EditorialInput
                id="deal-value"
                type="text"
                inputMode="numeric"
                value={formatCurrency(dealValue)}
                onChange={handleValueChange}
                placeholder="0"
                aria-describedby="deal-value-note"
                style={{
                  paddingLeft: 28,
                  fontVariantNumeric: "tabular-nums",
                  fontSize: 18,
                }}
              />
            </div>
            <div
              id="deal-value-note"
              style={{
                marginTop: 8,
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--cream-3)",
              }}
            >
              Max allowed: ${MAX_DEAL_VALUE.toLocaleString("en-US")} (20 billion)
            </div>
          </Field>

          <Field label="Location" note="OPTIONAL">
            <div ref={locationRef} style={{ position: "relative" }}>
              <button
                ref={locationBtnRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={locationOpen}
                onClick={() => setLocationOpen((o) => !o)}
                style={{
                  width: "100%",
                  fontFamily: "var(--font-serif)",
                  fontSize: 16,
                  fontStyle: location ? "normal" : "italic",
                  padding: "14px 16px",
                  border: "1px solid var(--rule-strong)",
                  background: "var(--ink)",
                  color: location ? "var(--cream)" : "var(--cream-3)",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {location || "Select a country…"}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    opacity: 0.55,
                    transform: locationOpen ? "rotate(180deg)" : "none",
                    transition: "transform 160ms ease",
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                </svg>
              </button>
            </div>
            {locationOpen &&
              menuStyle &&
              shellEl &&
              createPortal(
                <div
                  ref={locationMenuRef}
                  role="listbox"
                  style={{
                    ...menuStyle,
                    overflowY: "auto",
                    border: "1px solid var(--rule-strong)",
                    background: "var(--ink)",
                    padding: 4,
                    boxShadow: "0 18px 50px -12px rgba(0, 0, 0, 0.7)",
                  }}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={!location}
                    onClick={() => {
                      setLocation("");
                      setLocationOpen(false);
                    }}
                    className="sentinel-country-option"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      textAlign: "left",
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: 14,
                      color: "var(--cream-3)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Clear
                  </button>
                  {COUNTRIES.map((country) => (
                    <button
                      key={country}
                      type="button"
                      role="option"
                      aria-selected={location === country}
                      onClick={() => {
                        setLocation(country);
                        setLocationOpen(false);
                      }}
                      className="sentinel-country-option"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        textAlign: "left",
                        fontFamily: "var(--font-serif)",
                        fontSize: 14,
                        color: "var(--cream)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {country}
                    </button>
                  ))}
                </div>,
                shellEl
              )}
          </Field>

          {teams.length > 0 && (
            <Field label="Team" note="OPTIONAL">
              <EditorialSelect
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
              >
                <option value="">Personal</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </EditorialSelect>
            </Field>
          )}

          {selectedTeamId && members.length > 0 && (
            <Field label="Assign to" note="OPTIONAL">
              <EditorialSelect
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((m) => {
                  const display =
                    [m.user.name, m.user.surname].filter(Boolean).join(" ") ||
                    m.user.email;
                  return (
                    <option key={m.id} value={m.userId}>
                      {display}
                    </option>
                  );
                })}
              </EditorialSelect>
            </Field>
          )}

          {error && (
            <div
              id="deal-error"
              role="alert"
              style={{
                padding: "14px 18px",
                border: "1px solid var(--wine)",
                background: "rgba(119, 47, 47, 0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "var(--wine)",
                  textTransform: "uppercase",
                }}
              >
                § - ISSUE
              </span>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "var(--cream)",
                }}
              >
                {error}
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              paddingTop: 20,
              borderTop: "1px solid var(--rule)",
              flexWrap: "wrap",
            }}
          >
            <EditorialButton type="submit" variant="primary" disabled={isPending}>
              {isPending ? "Creating…" : "Create deal"}
            </EditorialButton>
            <Link
              href="/dashboard"
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "9px 18px",
                border: "1px solid var(--rule-strong)",
                color: "var(--cream-2)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Cancel
            </Link>
          </div>
        </form>

        <aside className="new-deal-aside" style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--cream-3)",
            }}
          >
            § - PREVIEW
          </div>
          <div
            style={{
              border: "1px solid var(--rule)",
              background: "var(--ink-02)",
              padding: "24px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              position: "relative",
            }}
          >
            {selectedStageData && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: "var(--signal)",
                }}
              />
            )}
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  border: "1px solid var(--rule-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--cream-2)",
                  background: "var(--ink)",
                }}
              >
                {selectedStage ? (
                  <StageIcon stageValue={selectedStage} size={20} />
                ) : (
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      color: "var(--cream-3)",
                      fontSize: 18,
                    }}
                  >
                    ·
                  </span>
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 22,
                    fontWeight: 400,
                    color: "var(--cream)",
                    letterSpacing: "-0.02em",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {dealName || "Deal name"}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--cream-3)",
                    margin: "4px 0 0",
                  }}
                >
                  {selectedStageData?.label ?? "Select a stage"}
                </p>
              </div>
            </div>

            <div
              style={{
                padding: "16px 16px",
                border: "1px solid var(--rule)",
                background: "var(--ink)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                  marginBottom: 6,
                }}
              >
                Value
              </div>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 30,
                  fontWeight: 400,
                  color: "var(--cream)",
                  letterSpacing: "-0.02em",
                  margin: 0,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ${dealValue ? parseInt(dealValue).toLocaleString("en-US") : "0"}
              </p>
            </div>

            {selectedStage && (
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--cream-3)",
                    marginBottom: 8,
                  }}
                >
                  Pipeline
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  {STAGE_FORM_OPTIONS.slice(0, 4).map((stage, index) => {
                    const currentIndex = STAGE_FORM_OPTIONS.findIndex(
                      (s) => s.value === selectedStage
                    );
                    const isActive = index <= currentIndex;
                    const isCurrent = stage.value === selectedStage;
                    return (
                      <div
                        key={stage.value}
                        style={{
                          flex: 1,
                          height: 3,
                          background: isActive
                            ? isCurrent
                              ? "var(--signal)"
                              : "var(--cream-3)"
                            : "var(--rule)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              borderLeft: "2px solid var(--signal)",
              paddingLeft: 16,
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--cream-3)",
                marginBottom: 6,
              }}
            >
              Editor&apos;s note
            </div>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 14,
                lineHeight: 1.5,
                color: "var(--cream-2)",
                margin: 0,
              }}
            >
              After creating the deal, add events on the deal page to track engagement and update risk.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
