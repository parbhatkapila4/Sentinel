"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  EditorialAvatar,
  EditorialButton,
  SectionHeader,
  SerifEm,
} from "../primitives";

interface TeamRowData {
  initials: string;
  avatar: "a1" | "a2" | "a3" | "a4";
  name: string;
  marker?: string;
  markerTone?: "muted" | "copper";
  email: string;
  role: string;
  action: string;
}

const PLACEHOLDER_TEAM_ROWS: TeamRowData[] = [
  {
    initials: "JS",
    avatar: "a1",
    name: "John Smith",
    marker: "- YOU",
    email: "john@company.com",
    role: "Admin",
    action: "Edit",
  },
  {
    initials: "SC",
    avatar: "a2",
    name: "Sarah Connor",
    email: "sarah@company.com",
    role: "Manager",
    action: "Edit",
  },
  {
    initials: "MJ",
    avatar: "a3",
    name: "Mike Johnson",
    email: "mike@company.com",
    role: "Sales Rep",
    action: "Edit",
  },
  {
    initials: "RP",
    avatar: "a4",
    name: "Ravi Patel",
    marker: "· INVITE PENDING",
    markerTone: "copper",
    email: "ravi@company.com",
    role: "Sales Rep",
    action: "Resend",
  },
];

export function TeamSection({
  planName,
  teamMemberLimit,
  teamMembersCount,
  onInvite,
}: {
  planName: string;
  teamMemberLimit: number;
  teamMembersCount: number;
  onInvite: () => void;
}) {
  const router = useRouter();

  return (
    <section
      id="settings-team"
      style={{ marginBottom: 48, scrollMarginTop: 64 }}
    >
      <SectionHeader
        eyebrow="§ 05 - TEAM"
        headline={
          <>
            Everyone at the{" "}
            <i style={{ fontStyle: "italic", color: "var(--signal)" }}>
              desk.
            </i>
          </>
        }
        deck="Invite teammates, assign roles, and control what they can see. Admins can do everything; reps see their own book only."
        rightSlot={
          <EditorialButton type="button" variant="primary" onClick={onInvite}>
            <span style={{ fontSize: 14 }}>+</span> Invite member
          </EditorialButton>
        }
      />

      <TeamRows
        rows={PLACEHOLDER_TEAM_ROWS}
        onEdit={() => {
          toast.message(
            "Team role editing is managed from the team detail page."
          );
          router.push("/settings/team");
        }}
      />

      <div
        style={{
          background: "rgba(217, 153, 90, 0.05)",
          borderLeft: "2px solid var(--copper)",
          padding: "14px 18px",
          marginTop: 28,
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
        }}
      >
        <span aria-hidden style={{ color: "var(--copper)", paddingTop: 2 }}>
          <svg
            viewBox="0 0 24 24"
            width={15}
            height={15}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13.5,
              color: "var(--cream)",
              fontWeight: 500,
              marginBottom: 3,
              letterSpacing: "-0.005em",
            }}
          >
            You&apos;re on the {planName} plan - {teamMemberLimit} member
            {teamMemberLimit === 1 ? "" : "s"} included.
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--cream-2)",
              lineHeight: 1.5,
            }}
          >
            Upgrade to <SerifEm>Pro</SerifEm> for up to 10 seats, or{" "}
            <SerifEm>Scale</SerifEm> for unlimited. You currently have{" "}
            {teamMembersCount} active seat
            {teamMembersCount === 1 ? "" : "s"} linked to your teams.
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamRows({
  rows,
  onEdit,
}: {
  rows: TeamRowData[];
  onEdit: (r: TeamRowData) => void;
}) {
  const roleColor: Record<string, { border: string; color: string }> = {
    Admin: { border: "var(--signal)", color: "var(--signal)" },
    Manager: { border: "var(--copper)", color: "var(--copper)" },
    "Sales Rep": { border: "var(--ivy)", color: "var(--ivy)" },
  };
  return (
    <div>
      {rows.map((r, idx) => {
        const role = roleColor[r.role] ?? {
          border: "var(--rule-strong)",
          color: "var(--cream-2)",
        };
        return (
          <div
            key={r.email}
            style={{
              display: "grid",
              gridTemplateColumns: "44px minmax(0, 1fr) auto auto",
              gap: 16,
              alignItems: "center",
              padding: "16px 0",
              borderBottom:
                idx === rows.length - 1 ? "none" : "1px solid var(--rule)",
            }}
          >
            <EditorialAvatar
              initials={r.initials}
              size={44}
              variant={r.avatar}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: 14.5,
                  color: "var(--cream)",
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
                  display: "inline-flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {r.name}
                {r.marker && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 9.5,
                      color:
                        r.markerTone === "copper"
                          ? "var(--copper)"
                          : "var(--cream-4)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {r.marker}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10.5,
                  color: "var(--cream-3)",
                  letterSpacing: "0.04em",
                }}
              >
                {r.email}
              </div>
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "4px 10px",
                border: `1px solid ${role.border}`,
                color: role.color,
                whiteSpace: "nowrap",
              }}
            >
              {r.role}
            </span>
            <EditorialButton type="button" compact onClick={() => onEdit(r)}>
              {r.action}
            </EditorialButton>
          </div>
        );
      })}
    </div>
  );
}
