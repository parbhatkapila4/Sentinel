"use client";

import type { ReactNode, RefObject } from "react";
import {
  EditorialButton,
  EditorialInput,
  EditorialSelect,
  Field,
  FormActions,
  Pill,
  SectionHeader,
  SerifEm,
  SettingRow,
} from "../primitives";

export interface ProfileFormState {
  name: string;
  surname: string;
  email: string;
  company: string;
  role: string;
  imageUrl: string;
}

interface ProfileAndSecurityProps {
  profile: ProfileFormState;
  onChange: (next: ProfileFormState) => void;
  avatarPreview: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  initials: string;
  joinedLabel: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  twoFactorEnabled: boolean;
  onOpenUserProfile: () => void;
}

export function ProfileAndSecuritySection({
  profile,
  onChange,
  avatarPreview,
  fileInputRef,
  onImageUpload,
  initials,
  joinedLabel,
  dirty,
  saving,
  onSave,
  onDiscard,
  twoFactorEnabled,
  onOpenUserProfile,
}: ProfileAndSecurityProps) {
  return (
    <>
      <section
        id="settings-profile"
        style={{ marginBottom: 48, scrollMarginTop: 64 }}
      >
        <SectionHeader
          eyebrow="§ 01.01 - PROFILE INFORMATION"
          headline={
            <>
              Who{" "}
              <i style={{ fontStyle: "italic", color: "var(--signal)" }}>
                you are
              </i>{" "}
              on this desk.
            </>
          }
          deck="Your name, email, and role. Visible to your team and shown on every deal you touch."
          rightLabel="ACCOUNT"
          rightValue={profile.email ? "ACTIVE" : "-"}
          rightColor="var(--ivy)"
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "120px minmax(0, 1fr)",
            gap: 32,
            marginBottom: 32,
          }}
        >
          <div style={{ position: "relative", width: 120 }}>
            <div
              style={{
                width: 120,
                height: 120,
                background:
                  "linear-gradient(135deg, var(--signal) 0%, var(--copper) 100%)",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 56,
                color: "var(--cream)",
                border: "1px solid var(--rule-strong)",
                position: "relative",
                overflow: "hidden",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    inset: 0,
                  }}
                />
              ) : (
                initials
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload avatar"
              style={{
                position: "absolute",
                bottom: -8,
                right: -8,
                width: 32,
                height: 32,
                background: "var(--ink)",
                border: "1px solid var(--rule-strong)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                zIndex: 1,
                transition: "border-color 140ms ease",
                padding: 0,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill="none"
                stroke="var(--cream-2)"
                strokeWidth={1.5}
              >
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              style={{ display: "none" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              justifyContent: "center",
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 28,
                color: "var(--cream)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {profile.name || "-"}{" "}
              {profile.surname && (
                <i style={{ fontStyle: "italic", color: "var(--cream-2)" }}>
                  {profile.surname}
                </i>
              )}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 11,
                color: "var(--cream-3)",
                letterSpacing: "0.04em",
              }}
            >
              {profile.email || "-"}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              <AvatarTag tone="signal">
                {(profile.role || "USER").toUpperCase()}
              </AvatarTag>
              <AvatarTag tone="ivy">● ACTIVE</AvatarTag>
              {joinedLabel && <AvatarTag>{joinedLabel}</AvatarTag>}
            </div>
          </div>
        </div>

        <div
          className="sentinel-form-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px 28px",
            marginBottom: 28,
          }}
        >
          <Field label="Full name">
            <EditorialInput
              type="text"
              value={profile.name}
              onChange={(e) => onChange({ ...profile, name: e.target.value })}
              placeholder="Enter your name"
            />
          </Field>
          <Field label="Surname" note="optional">
            <EditorialInput
              type="text"
              value={profile.surname}
              onChange={(e) =>
                onChange({ ...profile, surname: e.target.value })
              }
              placeholder="Enter your surname"
            />
          </Field>
          <Field
            label="Email"
            note="locked"
            foot={
              <>
                Email can only be changed by{" "}
                <SerifEm>signing in</SerifEm> with a different account.
              </>
            }
          >
            <EditorialInput
              type="email"
              value={profile.email}
              readOnly
              placeholder="you@company.com"
            />
          </Field>
          <Field label="Company">
            <EditorialInput
              type="text"
              value={profile.company}
              onChange={(e) =>
                onChange({ ...profile, company: e.target.value })
              }
              placeholder="Enter company name"
            />
          </Field>
          <Field label="Role">
            <EditorialSelect
              value={profile.role}
              onChange={(e) => onChange({ ...profile, role: e.target.value })}
            >
              <option value="admin">Admin</option>
              <option value="manager">Sales Manager</option>
              <option value="rep">Sales Rep</option>
              <option value="viewer">Viewer</option>
            </EditorialSelect>
          </Field>
        </div>

        <FormActions
          dirty={dirty}
          saving={saving}
          onSave={onSave}
          onDiscard={onDiscard}
        />
      </section>

      <section
        id="settings-security"
        style={{ marginBottom: 48, scrollMarginTop: 64 }}
      >
        <SectionHeader
          eyebrow="§ 01.02 - SECURITY"
          headline={
            <>
              Keep the{" "}
              <i style={{ fontStyle: "italic", color: "var(--signal)" }}>
                gate
              </i>{" "}
              closed.
            </>
          }
          deck="Passwords, sessions, and two-factor authentication. Recommended for any account touching customer data."
          rightLabel="2FA STATUS"
          rightValue={twoFactorEnabled ? "ENABLED" : "NOT ENABLED"}
          rightColor={twoFactorEnabled ? "var(--ivy)" : "var(--copper)"}
        />

        <SettingRow
          title="Password"
          subtitle={
            <>
              Manage your password and security settings.{" "}
              <SerifEm>Rotate every 90 days.</SerifEm>
            </>
          }
        >
          <EditorialButton type="button" onClick={onOpenUserProfile}>
            Change
          </EditorialButton>
        </SettingRow>

        <SettingRow
          title={
            <>
              Two-factor authentication{" "}
              {twoFactorEnabled ? (
                <Pill>ENABLED</Pill>
              ) : (
                <Pill tone="warn">RECOMMENDED</Pill>
              )}
            </>
          }
          subtitle="Add an extra layer of security. Sentinel supports authenticator apps and hardware keys (WebAuthn) through your identity provider."
        >
          <EditorialButton
            type="button"
            variant={twoFactorEnabled ? "ghost" : "primary"}
            onClick={onOpenUserProfile}
          >
            {twoFactorEnabled ? "Manage" : "Enable"}
          </EditorialButton>
        </SettingRow>

        <SettingRow
          title={
            <>
              Active sessions <Pill>CLERK-MANAGED</Pill>
            </>
          }
          subtitle="Review every device signed in to this account. Revoke any session that isn't you."
          last
        >
          <EditorialButton type="button" onClick={onOpenUserProfile}>
            Review
          </EditorialButton>
        </SettingRow>
      </section>
    </>
  );
}

function AvatarTag({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: "signal" | "ivy";
}) {
  const color =
    tone === "signal"
      ? "var(--signal)"
      : tone === "ivy"
        ? "var(--ivy)"
        : "var(--cream-2)";
  const border =
    tone === "signal"
      ? "var(--signal)"
      : tone === "ivy"
        ? "var(--ivy)"
        : "var(--rule-strong)";
  return (
    <span
      style={{
        fontFamily: "var(--font-mono-jb)",
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "3px 8px",
        border: `1px solid ${border}`,
        color,
      }}
    >
      {children}
    </span>
  );
}
