"use client";

import Image from "next/image";
import Link from "next/link";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

const SIGN_IN_CSS = `
        .sentinel-signin-root {
          --bg: #000000;
          --bg-2: #060606;
          --bg-3: #0a0a0a;
          --bg-4: #111111;
          --bg-5: #161616;
          --line: #1a1a1a;
          --line-2: #242424;
          --line-3: #2e2e2e;
          --line-4: #3a3a3a;
          --fg: #ffffff;
          --fg-2: #c8c8c8;
          --fg-3: #888888;
          --fg-4: #5a5a5a;
          --fg-5: #3d3d3d;
          --green: #4ade80;
          --green-d: #22c55e;
          --green-soft: rgba(74, 222, 128, 0.1);
          --green-glow: rgba(74, 222, 128, 0.35);
          --amber: #fbbf24;
          --red: #ef4444;
          --blue: #60a5fa;
          --mono: "JetBrains Mono", ui-monospace, monospace;

          background: var(--bg);
          color: var(--fg);
          font-family: var(--mono);
          font-weight: 400;
          line-height: 1.55;
          min-height: 100vh;
          letter-spacing: -0.005em;
          overflow-x: hidden;
          font-size: 15px;
          -webkit-font-smoothing: antialiased;
          position: relative;
        }
        .sentinel-signin-root *,
        .sentinel-signin-root *::before,
        .sentinel-signin-root *::after {
          box-sizing: border-box;
        }
        .sentinel-signin-root ::selection {
          background: var(--green);
          color: var(--bg);
        }
        .sentinel-signin-root::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.025;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        /* TOP BAR */
        .topbar {
          border-bottom: 1px solid var(--line);
          padding: 18px 32px;
        }
        .topbar-inner {
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .back-link {
          font-size: 13px;
          color: var(--fg-3);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: color 160ms;
          text-decoration: none;
        }
        .back-link:hover {
          color: var(--fg);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .brand-mark {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
        }
        .brand-mark img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .brand-name {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--fg);
        }
        .signin-link {
          font-size: 13px;
          color: var(--fg-2);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: color 160ms;
          text-decoration: none;
        }
        .signin-link:hover {
          color: var(--green);
        }
        .signin-link .arr {
          transition: transform 180ms;
        }
        .signin-link:hover .arr {
          transform: translateX(3px);
        }

        /* MAIN LAYOUT */
        .main {
          width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: calc(100vh - 70px);
        }

        /* LEFT */
        .left {
          padding: 56px 56px;
          border-right: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: relative;
        }
        .left::before,
        .left::after {
          content: "";
          position: absolute;
          width: 14px;
          height: 14px;
          border: 1px solid var(--fg-4);
          pointer-events: none;
        }
        .left::before {
          top: 16px;
          left: 16px;
          border-right: none;
          border-bottom: none;
        }
        .left::after {
          bottom: 16px;
          left: 16px;
          border-right: none;
          border-top: none;
        }

        .eyebrow-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--fg-3);
          font-weight: 500;
        }
        .eyebrow-row .dot {
          width: 6px;
          height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse 1.6s infinite;
          box-shadow: 0 0 6px var(--green-glow);
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }

        .h1 {
          font-family: var(--mono);
          font-weight: 600;
          font-size: clamp(36px, 4vw, 48px);
          line-height: 1.05;
          letter-spacing: -0.04em;
          color: var(--fg);
        }
        .h1 em {
          font-style: normal;
          color: var(--green);
          text-shadow: 0 0 24px var(--green-glow);
        }

        .subtitle {
          font-size: 15px;
          color: var(--fg-3);
          line-height: 1.6;
          max-width: 460px;
        }
        .subtitle b {
          color: var(--fg-2);
          font-weight: 500;
        }

        .section-divider {
          height: 1px;
          background: var(--line);
        }

        .benefits {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .benefits-label {
          font-size: 10px;
          color: var(--fg-3);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .benefit-row {
          display: grid;
          grid-template-columns: 22px 1fr;
          gap: 12px;
          align-items: flex-start;
        }
        .benefit-icon {
          width: 20px;
          height: 20px;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.4);
          display: grid;
          place-items: center;
          color: var(--green);
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .benefit-text {
          font-size: 13.5px;
          color: var(--fg-2);
          line-height: 1.55;
          letter-spacing: -0.005em;
        }
        .benefit-text b {
          color: var(--fg);
          font-weight: 600;
        }

        .design-note {
          margin-top: auto;
          padding: 18px 22px;
          background: var(--bg-3);
          border: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .design-note-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--fg-4);
          font-weight: 600;
        }
        .design-note-body {
          font-family: var(--mono);
          font-size: 13px;
          color: var(--fg-2);
          line-height: 1.55;
          letter-spacing: -0.005em;
        }
        .design-note-body em {
          font-style: italic;
          color: var(--fg);
          font-weight: 500;
        }

        .left-foot {
          padding-top: 16px;
          border-top: 1px solid var(--line);
          display: flex;
          justify-content: space-between;
          font-size: 10.5px;
          color: var(--fg-4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .left-foot a {
          color: var(--fg-4);
          text-decoration: none;
          transition: color 160ms;
        }
        .left-foot a:hover {
          color: var(--fg-2);
        }

        /* RIGHT */
        .right {
          padding: 56px 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #070707 0%, #030303 100%);
        }
        /* Soft neutral backdrop behind the card */
        .right::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 760px;
          height: 760px;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            ellipse at center,
            rgba(255, 255, 255, 0.025) 0%,
            transparent 60%
          );
          pointer-events: none;
          z-index: 0;
        }
        /* Vignette-masked dot field */
        .right::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.04) 0.6px,
            transparent 1.2px
          );
          background-size: 26px 26px;
          -webkit-mask-image: radial-gradient(
            ellipse 60% 75% at 50% 50%,
            rgba(0, 0, 0, 1) 15%,
            rgba(0, 0, 0, 0.5) 55%,
            rgba(0, 0, 0, 0) 90%
          );
          mask-image: radial-gradient(
            ellipse 60% 75% at 50% 50%,
            rgba(0, 0, 0, 1) 15%,
            rgba(0, 0, 0, 0.5) 55%,
            rgba(0, 0, 0, 0) 90%
          );
          pointer-events: none;
          z-index: 0;
        }

        .signup-card {
          width: 100%;
          max-width: 440px;
          background: linear-gradient(180deg, #0c0c0c 0%, #080808 100%);
          border: 1px solid var(--line-3);
          position: relative;
          z-index: 1;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 50px 140px -40px rgba(0, 0, 0, 0.9),
            0 20px 50px -25px rgba(0, 0, 0, 0.7);
        }
        .signup-card::before {
          content: "";
          position: absolute;
          top: -1px;
          left: 20%;
          right: 20%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.18),
            transparent
          );
          pointer-events: none;
        }

        .card-head {
          padding: 12px 16px;
          background: var(--bg-4);
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .term-dots {
          display: flex;
          gap: 5px;
        }
        .term-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--fg-5);
        }
        .term-dots span:first-child {
          background: #ff5f57;
        }
        .term-dots span:nth-child(2) {
          background: #febc2e;
        }
        .term-dots span:last-child {
          background: #28c840;
        }
        .card-title {
          flex: 1;
          text-align: center;
          font-size: 11px;
          color: var(--fg-3);
          letter-spacing: 0.04em;
        }
        .card-title b {
          color: var(--fg-2);
          font-weight: 500;
        }
        .card-tag {
          font-size: 9px;
          color: var(--green);
          background: rgba(74, 222, 128, 0.1);
          padding: 2px 6px;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .card-body {
          padding: 32px 32px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .card-eyebrow {
          font-size: 10px;
          color: var(--green);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
        }
        .card-h {
          font-size: 26px;
          font-weight: 600;
          color: var(--fg);
          letter-spacing: -0.025em;
          line-height: 1.05;
          margin-top: -8px;
        }
        .card-sub {
          font-size: 13px;
          color: var(--fg-3);
          line-height: 1.55;
        }
        .card-sub b {
          color: var(--green);
          font-weight: 600;
        }

        .oauth-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .oauth-btn {
          background: var(--bg-4);
          border: 1px solid var(--line-3);
          color: var(--fg);
          padding: 11px 12px;
          font-family: var(--mono);
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 180ms ease;
          letter-spacing: -0.005em;
        }
        .oauth-btn:hover {
          border-color: var(--fg-4);
          background: var(--bg-5);
        }
        .oauth-btn:disabled,
        .btn-primary:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .form-error {
          font-size: 11.5px;
          color: var(--red);
          background: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.25);
          padding: 8px 10px;
          letter-spacing: 0;
          line-height: 1.4;
        }
        .oauth-btn .icon {
          width: 14px;
          height: 14px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .or-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 10px;
          color: var(--fg-4);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .or-divider::before,
        .or-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--line-2);
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-size: 10.5px;
          color: var(--fg-3);
          letter-spacing: 0.06em;
          font-weight: 500;
          text-transform: uppercase;
        }
        .field-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .field-aux {
          font-size: 10.5px;
          color: var(--fg-3);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-decoration: none;
          transition: color 160ms;
          cursor: pointer;
        }
        .field-aux:hover {
          color: var(--green);
        }
        .field-input {
          background: var(--bg-4);
          border: 1px solid var(--line-3);
          color: var(--fg);
          font-family: var(--mono);
          font-size: 13px;
          padding: 10px 12px;
          outline: none;
          transition: border-color 180ms, box-shadow 180ms;
          letter-spacing: -0.005em;
          width: 100%;
        }
        .field-input::placeholder {
          color: var(--fg-4);
        }
        .field-input:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px var(--green-soft);
        }

        .pwd-wrap {
          position: relative;
        }
        .pwd-meter {
          height: 3px;
          background: var(--bg-5);
          margin-top: 6px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 3px;
        }
        .pwd-seg {
          background: var(--line-2);
          transition: background 180ms;
        }
        .pwd-seg.active-1 {
          background: var(--red);
        }
        .pwd-seg.active-2 {
          background: var(--amber);
        }
        .pwd-seg.active-3 {
          background: var(--green);
        }
        .pwd-hint {
          font-size: 10px;
          color: var(--fg-4);
          letter-spacing: 0.04em;
          margin-top: 6px;
          display: flex;
          justify-content: space-between;
        }
        .pwd-hint .strong {
          color: var(--green);
          font-weight: 600;
        }

        .checkbox-row {
          display: grid;
          grid-template-columns: 16px 1fr;
          gap: 10px;
          align-items: flex-start;
          margin-top: 4px;
        }
        .checkbox {
          width: 16px;
          height: 16px;
          border: 1px solid var(--line-3);
          background: var(--bg-4);
          cursor: pointer;
          position: relative;
          margin-top: 2px;
          transition: all 180ms;
        }
        .checkbox:hover {
          border-color: var(--fg-4);
        }
        .checkbox.checked {
          background: var(--green);
          border-color: var(--green);
        }
        .checkbox.checked::after {
          content: "\\2713";
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          color: var(--bg);
          font-size: 11px;
          font-weight: 700;
        }
        .checkbox-text {
          font-size: 12px;
          color: var(--fg-3);
          line-height: 1.55;
          letter-spacing: -0.005em;
        }
        .checkbox-text a {
          color: var(--fg-2);
          text-decoration: underline;
          text-underline-offset: 2px;
          text-decoration-color: var(--line-3);
          transition: color 160ms;
        }
        .checkbox-text a:hover {
          color: var(--green);
          text-decoration-color: var(--green);
        }

        .btn-primary {
          background: var(--fg);
          color: var(--bg);
          border: 1px solid var(--fg);
          padding: 12px 18px;
          font-family: var(--mono);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 200ms cubic-bezier(0.2, 0.7, 0.2, 1);
          letter-spacing: -0.005em;
          position: relative;
          overflow: hidden;
          margin-top: 4px;
        }
        .btn-primary::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(74, 222, 128, 0.3),
            transparent
          );
          transition: left 500ms;
        }
        .btn-primary:hover {
          background: var(--green);
          border-color: var(--green);
        }
        .btn-primary:hover::before {
          left: 100%;
        }
        .btn-primary .arr {
          transition: transform 200ms;
        }
        .btn-primary:hover .arr {
          transform: translateX(3px);
        }

        .card-foot {
          padding: 12px 32px;
          border-top: 1px solid var(--line);
          background: var(--bg-2);
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: var(--fg-4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .card-foot .secure {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .card-foot .secure::before {
          content: "";
          width: 5px;
          height: 5px;
          background: var(--green);
          border-radius: 50%;
          box-shadow: 0 0 4px var(--green-glow);
        }

        .legal-note {
          margin-top: 18px;
          font-size: 10.5px;
          color: var(--fg-4);
          text-align: center;
          letter-spacing: 0.04em;
          line-height: 1.6;
          max-width: 380px;
        }
        .legal-note a {
          color: var(--fg-3);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: var(--line-3);
          transition: color 160ms;
        }
        .legal-note a:hover {
          color: var(--green);
          text-decoration-color: var(--green);
        }

        .card-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 980px) {
          .main {
            grid-template-columns: 1fr;
            min-height: auto;
            border-left: none;
            border-right: none;
          }
          .left {
            border-right: none;
            border-bottom: 1px solid var(--line);
            padding: 40px 32px;
          }
          .right {
            padding: 40px 32px;
          }
          .left::before,
          .left::after {
            display: none;
          }
          .topbar-inner .brand {
            display: none;
          }
        }
        @media (max-width: 480px) {
          .left {
            padding: 32px 24px;
          }
          .right {
            padding: 32px 24px;
          }
          .card-body {
            padding: 28px 22px;
          }
          .card-foot {
            padding: 10px 22px;
            flex-direction: column;
            gap: 4px;
          }
          .field-row {
            grid-template-columns: 1fr;
          }
          .oauth-row {
            grid-template-columns: 1fr;
          }
        }
`;

export function SignInClient() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectFromUrl = searchParams.get("redirect");
  const afterSignInUrl =
    redirectFromUrl && redirectFromUrl.startsWith("/") ? redirectFromUrl : "/dashboard";

  useEffect(() => {
    if (isSignedIn) {
      // Hard-navigate so we don't get stuck waiting on a soft router
      // transition while Turbopack compiles the destination route in dev.
      window.location.href = afterSignInUrl;
    }
  }, [isSignedIn, afterSignInUrl]);

  const handleOAuth = async (provider: "google" | "apple") => {
    if (!isLoaded || !signIn || oauthLoading) return;
    setError(null);
    setOauthLoading(provider);
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider === "google" ? "oauth_google" : "oauth_apple",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: afterSignInUrl,
      });
    } catch (err) {
      setOauthLoading(null);
      const message =
        (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
        "Could not start sign-in.";
      setError(message);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signIn || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = afterSignInUrl;
        return;
      }
      setError("Additional verification required. Try the link in your email.");
    } catch (err) {
      const message =
        (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
        "Sign-in failed. Check your email and password.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sentinel-signin-root">
      <style dangerouslySetInnerHTML={{ __html: SIGN_IN_CSS }} />
      <div className="topbar">
        <div className="topbar-inner">
          <Link className="back-link" href="/">
            ← Back to home
          </Link>
          <div className="brand">
            <div className="brand-mark">
              <Image
                src="/Sentinel New logo.png"
                alt="Sentinel"
                width={28}
                height={28}
                priority
              />
            </div>
            <div className="brand-name">SENTINEL</div>
          </div>
        </div>
      </div>


      <div className="main">
        <div className="left">
          <div className="eyebrow-row">
            <span className="dot"></span>
            <span>CREATE WORKSPACE · FREE FOR 25 DEALS</span>
          </div>

          <h1 className="h1">
            Catch every
            <br />
            at-risk deal{" "}
            <em>
              before
              <br />
              it goes silent.
            </em>
          </h1>

          <p className="subtitle">
            Sentinel reads pipeline activity from your <b>CRM and calendar</b>{" "}
            - then scores every deal 0–100 with cited reasons. Catch at-risk
            deals before they go silent.
          </p>

          <div className="section-divider"></div>

          <div className="benefits">
            <div className="benefits-label">WHAT&apos;S INCLUDED · FREE FOREVER</div>
            <div className="benefit-row">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                Up to <b>25 active deals</b> monitored in real-time
              </div>
            </div>
            <div className="benefit-row">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                Connect <b>HubSpot, Salesforce, Google Calendar, Slack</b> in
                minutes
              </div>
            </div>
            <div className="benefit-row">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                Risk scoring with <b>cited evidence</b> from every source
              </div>
            </div>
            <div className="benefit-row">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <b>AES-256 GCM</b> at rest · Read-only · Never trains on your
                data
              </div>
            </div>
            <div className="benefit-row">
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                No credit card. No trial clock.{" "}
                <b>Upgrade only when ready.</b>
              </div>
            </div>
          </div>

          <div className="design-note">
            <div className="design-note-label">DESIGN NOTE</div>
            <p className="design-note-body">
              Every risk score cites the activity behind it - temporal decay,
              stage velocity, engagement drop. <em>Auditable by design</em>,
              not a black box you have to trust in a forecast meeting.
            </p>
          </div>

          <div className="left-foot">
            <span>EST. 2026 · SINGLE-OPERATOR CRAFT</span>
            <span>
              <a>SENTINELS.IN</a>
            </span>
          </div>
        </div>
        <div className="right">
          <div className="card-wrap">
            <div className="signup-card">
              <div className="card-head">
                <div className="term-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="card-title">
                  <b>auth.sentinel.run</b> - sign in
                </div>
                <span className="card-tag">SECURE</span>
              </div>

              <div className="card-body">
                <div className="card-eyebrow">SIGN IN TO YOUR WORKSPACE</div>
                <h2 className="card-h">
                  Welcome back to
                  <br />
                  your <b>pipeline.</b>
                </h2>
                <p className="card-sub">
                  Pick up exactly where you left off. Same workspace, same signals.
                </p>

                <div className="oauth-row">
                  <button
                    className="oauth-btn"
                    type="button"
                    onClick={() => handleOAuth("google")}
                    disabled={oauthLoading !== null || submitting}
                  >
                    <span className="icon">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="#4285F4"
                          d="M15.68 8.18c0-.6-.05-1.18-.15-1.73H8v3.27h4.3c-.18 1-.75 1.85-1.6 2.42v2h2.58c1.51-1.39 2.4-3.45 2.4-5.96z"
                        />
                        <path
                          fill="#34A853"
                          d="M8 16c2.16 0 3.97-.72 5.29-1.94l-2.58-2c-.72.48-1.63.77-2.71.77-2.08 0-3.85-1.4-4.48-3.3H.85v2.07A8 8 0 008 16z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M3.52 9.53A4.8 4.8 0 013.27 8c0-.53.09-1.05.25-1.53V4.4H.85A8 8 0 000 8c0 1.29.31 2.51.85 3.6l2.67-2.07z"
                        />
                        <path
                          fill="#EA4335"
                          d="M8 3.18c1.18 0 2.23.4 3.06 1.2l2.29-2.29C11.97.79 10.16 0 8 0A8 8 0 00.85 4.4l2.67 2.07C4.15 4.57 5.92 3.18 8 3.18z"
                        />
                      </svg>
                    </span>
                    <span>{oauthLoading === "google" ? "Connecting…" : "Google"}</span>
                  </button>
                  <button
                    className="oauth-btn"
                    type="button"
                    onClick={() => handleOAuth("apple")}
                    disabled={oauthLoading !== null || submitting}
                  >
                    <span className="icon">
                      <svg
                        width="12"
                        height="14"
                        viewBox="0 0 14 16"
                        fill="white"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M11.62 8.5c0-2.04 1.66-3.04 1.74-3.08-.95-1.4-2.43-1.59-2.95-1.61-1.26-.13-2.45.74-3.09.74-.65 0-1.62-.72-2.67-.7-1.37.02-2.65.81-3.36 2.04-1.43 2.5-.37 6.18 1.03 8.21.69.99 1.5 2.1 2.55 2.06 1.03-.04 1.42-.66 2.66-.66s1.59.66 2.68.64c1.11-.02 1.81-1 2.49-2 .79-1.15 1.11-2.27 1.13-2.33-.02-.01-2.18-.83-2.21-3.31zM9.6 2.51C10.16 1.83 10.55.88 10.44 0c-.81.03-1.79.54-2.38 1.21-.52.6-.99 1.56-.86 2.43.91.07 1.83-.46 2.4-1.13z" />
                      </svg>
                    </span>
                    <span>{oauthLoading === "apple" ? "Connecting…" : "Apple"}</span>
                  </button>
                </div>

                <div className="or-divider">OR EMAIL</div>

                <form className="form-fields" onSubmit={handleSubmit}>
                  <div className="field">
                    <label className="field-label" htmlFor="signin-email">
                      Work email
                    </label>
                    <input
                      id="signin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="field-input"
                      placeholder="founder@yourcompany.com"
                    />
                  </div>

                  <div className="field">
                    <div className="field-label-row">
                      <label className="field-label" htmlFor="signin-password">
                        Password
                      </label>
                      <a className="field-aux" href="#">
                        Forgot?
                      </a>
                    </div>
                    <input
                      id="signin-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="field-input"
                      placeholder="Enter your password"
                    />
                  </div>

                  <div className="checkbox-row">
                    <div className="checkbox checked"></div>
                    <div className="checkbox-text">
                      Keep me signed in on this device for 30 days.
                    </div>
                  </div>

                  {error ? <div className="form-error">{error}</div> : null}

                  <button
                    className="btn-primary"
                    type="submit"
                    disabled={submitting || oauthLoading !== null}
                  >
                    {submitting ? "Signing in…" : "Sign in"} <span className="arr">→</span>
                  </button>
                </form>
              </div>

              <div className="card-foot">
                <span className="secure">256-BIT TLS · AES-256 GCM AT REST</span>
                <span>READ-ONLY BY DESIGN</span>
              </div>
            </div>

            <p className="legal-note">
              Trouble signing in? <a>Contact support</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
