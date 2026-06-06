"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import "swagger-ui-react/swagger-ui.css";
import { openApiSpec } from "@/lib/openapi";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px] text-white/60">
      <p>Loading API docs…</p>
    </div>
  ),
});

function BackLink() {
  return (
    <div className="border-b border-white/10 sticky top-0 z-50 bg-black/80 backdrop-blur">
      <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to home
        </Link>
        <Link
          href="/docs/developers"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Developer docs →
        </Link>
      </div>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            API reference
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            Every Sentinel endpoint, with live examples.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Interactive OpenAPI explorer. Try requests against your workspace,
            inspect schemas, and copy curl commands without leaving the page.
            Authentication, rate limits, and response shapes are documented
            inline next to each endpoint.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>OpenAPI 3.0 spec</span>
            <span className="text-white/20">·</span>
            <span>Bearer token auth</span>
            <span className="text-white/20">·</span>
            <span>JSON request &amp; response</span>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-10">
          <style jsx global>{`
            .swagger-ui {
              background: transparent !important;
              font-family: inherit !important;
            }
            .swagger-ui .topbar {
              display: none !important;
            }
            .swagger-ui .info {
              margin: 0 0 30px !important;
            }
            .swagger-ui .info .title {
              color: white !important;
              font-size: 1.5rem !important;
              font-weight: 600 !important;
              letter-spacing: -0.01em !important;
            }
            .swagger-ui .info .description,
            .swagger-ui .info .description p {
              color: rgba(255, 255, 255, 0.7) !important;
            }
            .swagger-ui .info .description h1,
            .swagger-ui .info .description h2,
            .swagger-ui .info .description h3 {
              color: white !important;
            }
            .swagger-ui .info .description code {
              background: rgba(255, 255, 255, 0.08) !important;
              color: #4ade80 !important;
              border-radius: 3px !important;
              padding: 2px 6px !important;
              font-size: 0.85em !important;
            }
            .swagger-ui .scheme-container {
              background: rgba(255, 255, 255, 0.03) !important;
              border: 1px solid rgba(255, 255, 255, 0.08) !important;
              box-shadow: none !important;
              border-radius: 6px !important;
            }
            .swagger-ui .opblock-tag {
              color: white !important;
              font-size: 1.1rem !important;
              font-weight: 600 !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
              padding-bottom: 10px !important;
            }
            .swagger-ui .opblock-tag small {
              color: rgba(255, 255, 255, 0.5) !important;
            }
            .swagger-ui .opblock {
              background: rgba(255, 255, 255, 0.02) !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-radius: 6px !important;
              margin-bottom: 8px !important;
              box-shadow: none !important;
            }
            .swagger-ui .opblock .opblock-summary {
              border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            }
            .swagger-ui .opblock .opblock-summary-method {
              border-radius: 3px !important;
              font-weight: 600 !important;
              min-width: 80px !important;
            }
            .swagger-ui .opblock .opblock-summary-description {
              color: rgba(255, 255, 255, 0.65) !important;
            }
            .swagger-ui .opblock .opblock-summary-path,
            .swagger-ui .opblock .opblock-summary-path__deprecated {
              color: white !important;
            }
            .swagger-ui .opblock-body pre {
              background: rgba(0, 0, 0, 0.4) !important;
              border: 1px solid rgba(255, 255, 255, 0.06) !important;
              border-radius: 4px !important;
            }
            .swagger-ui .opblock-description-wrapper p {
              color: rgba(255, 255, 255, 0.7) !important;
            }
            .swagger-ui .parameters-col_description,
            .swagger-ui .parameters-col_description p {
              color: rgba(255, 255, 255, 0.7) !important;
            }
            .swagger-ui .parameters-col_name {
              color: white !important;
            }
            .swagger-ui table thead tr td,
            .swagger-ui table thead tr th {
              color: white !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            }
            .swagger-ui .parameter__name {
              color: white !important;
            }
            .swagger-ui .parameter__type {
              color: rgba(255, 255, 255, 0.5) !important;
            }
            .swagger-ui .parameter__deprecated,
            .swagger-ui .parameter__in {
              color: rgba(255, 255, 255, 0.5) !important;
            }
            .swagger-ui .model-title,
            .swagger-ui .model-toggle {
              color: white !important;
            }
            .swagger-ui .model {
              color: rgba(255, 255, 255, 0.7) !important;
            }
            .swagger-ui .model-box {
              background: rgba(255, 255, 255, 0.02) !important;
            }
            .swagger-ui section.models {
              background: rgba(255, 255, 255, 0.02) !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-radius: 6px !important;
            }
            .swagger-ui section.models h4,
            .swagger-ui section.models.is-open h4 {
              color: white !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            }
            .swagger-ui .btn {
              border-radius: 4px !important;
              font-weight: 500 !important;
            }
            .swagger-ui .btn.execute {
              background: white !important;
              color: black !important;
              border-color: white !important;
            }
            .swagger-ui .btn.cancel {
              background: transparent !important;
              color: rgba(255, 255, 255, 0.7) !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
            }
            .swagger-ui select,
            .swagger-ui input[type="text"],
            .swagger-ui input[type="email"],
            .swagger-ui input[type="password"],
            .swagger-ui textarea {
              background: rgba(255, 255, 255, 0.04) !important;
              color: white !important;
              border: 1px solid rgba(255, 255, 255, 0.15) !important;
              border-radius: 4px !important;
            }
            .swagger-ui .responses-inner h4,
            .swagger-ui .responses-inner h5 {
              color: white !important;
            }
            .swagger-ui .response-col_status {
              color: white !important;
            }
            .swagger-ui .response-col_description,
            .swagger-ui .response-col_description p {
              color: rgba(255, 255, 255, 0.7) !important;
            }
            .swagger-ui .opblock-section-header {
              background: rgba(255, 255, 255, 0.03) !important;
              border-radius: 4px !important;
            }
            .swagger-ui .opblock-section-header h4,
            .swagger-ui .tab li {
              color: white !important;
            }
            .swagger-ui .tab li button.tablinks {
              color: rgba(255, 255, 255, 0.6) !important;
            }
            .swagger-ui .tab li button.tablinks.active {
              color: white !important;
            }
            .swagger-ui .markdown code,
            .swagger-ui .renderedMarkdown code {
              background: rgba(255, 255, 255, 0.08) !important;
              color: #4ade80 !important;
            }

            /* Authorize modal — Swagger ships a white-themed dialog by
               default; override every surface so it matches the dark UI. */
            .swagger-ui .dialog-ux {
              z-index: 9999 !important;
            }
            .swagger-ui .dialog-ux .backdrop-ux {
              background: rgba(0, 0, 0, 0.78) !important;
              backdrop-filter: blur(4px);
            }
            .swagger-ui .dialog-ux .modal-ux {
              background: #0a0a0a !important;
              border: 1px solid rgba(255, 255, 255, 0.12) !important;
              border-radius: 8px !important;
              color: white !important;
              box-shadow:
                0 30px 80px -20px rgba(0, 0, 0, 0.85),
                0 12px 30px -10px rgba(0, 0, 0, 0.6) !important;
            }
            .swagger-ui .dialog-ux .modal-ux-header {
              background: rgba(255, 255, 255, 0.02) !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
              padding: 14px 20px !important;
            }
            .swagger-ui .dialog-ux .modal-ux-header h3 {
              color: white !important;
              font-weight: 600 !important;
              font-size: 1rem !important;
              letter-spacing: -0.005em !important;
            }
            .swagger-ui .dialog-ux .modal-ux-header button.close-modal {
              background: transparent !important;
              border: none !important;
              color: rgba(255, 255, 255, 0.55) !important;
              cursor: pointer !important;
              padding: 4px !important;
              transition: color 0.15s !important;
            }
            .swagger-ui .dialog-ux .modal-ux-header button.close-modal:hover {
              color: white !important;
            }
            .swagger-ui .dialog-ux .modal-ux-header button.close-modal svg,
            .swagger-ui .dialog-ux .modal-ux-header button.close-modal .close {
              fill: currentColor !important;
              color: currentColor !important;
            }
            .swagger-ui .dialog-ux .modal-ux-content {
              padding: 20px !important;
              color: rgba(255, 255, 255, 0.85) !important;
              max-height: 70vh !important;
              overflow-y: auto !important;
            }
            .swagger-ui .dialog-ux .modal-ux-inner {
              background: transparent !important;
            }
            .swagger-ui .auth-container {
              background: transparent !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 0 12px !important;
            }
            .swagger-ui .auth-container h4,
            .swagger-ui .auth-container h5,
            .swagger-ui .auth-container h6,
            .swagger-ui .auth-container .auth__title,
            .swagger-ui .auth-container .scopes h2 {
              color: white !important;
            }
            .swagger-ui .auth-container h4 {
              font-weight: 600 !important;
              letter-spacing: -0.005em !important;
            }
            .swagger-ui .auth-container code {
              background: rgba(255, 255, 255, 0.08) !important;
              color: #4ade80 !important;
              padding: 2px 6px !important;
              border-radius: 3px !important;
              font-size: 0.85em !important;
            }
            .swagger-ui .auth-container .wrapper {
              background: transparent !important;
            }
            .swagger-ui .auth-container p,
            .swagger-ui .auth-container .description {
              color: rgba(255, 255, 255, 0.7) !important;
            }
            .swagger-ui .auth-container label {
              color: rgba(255, 255, 255, 0.85) !important;
              font-weight: 500 !important;
            }
            .swagger-ui .auth-container input[type="text"],
            .swagger-ui .auth-container input[type="password"] {
              background: rgba(255, 255, 255, 0.04) !important;
              color: white !important;
              border: 1px solid rgba(255, 255, 255, 0.15) !important;
              border-radius: 4px !important;
              padding: 8px 12px !important;
              transition: border-color 0.15s !important;
            }
            .swagger-ui .auth-container input[type="text"]:focus,
            .swagger-ui .auth-container input[type="password"]:focus {
              outline: none !important;
              border-color: rgba(255, 255, 255, 0.4) !important;
            }
            .swagger-ui .auth-btn-wrapper {
              display: flex !important;
              gap: 8px !important;
              justify-content: flex-end !important;
              padding: 16px 0 0 !important;
              border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
              margin-top: 16px !important;
            }
            .swagger-ui .auth-btn-wrapper .btn,
            .swagger-ui .dialog-ux .modal-ux-content .btn {
              border-radius: 4px !important;
              font-weight: 500 !important;
              padding: 8px 18px !important;
              font-size: 13px !important;
              transition: all 0.15s !important;
              cursor: pointer !important;
            }
            .swagger-ui .auth-btn-wrapper .btn.modal-btn.auth.authorize,
            .swagger-ui .auth-btn-wrapper .btn.authorize {
              background: white !important;
              color: black !important;
              border: 1px solid white !important;
            }
            .swagger-ui .auth-btn-wrapper .btn.modal-btn.auth.authorize:hover,
            .swagger-ui .auth-btn-wrapper .btn.authorize:hover {
              background: rgba(255, 255, 255, 0.9) !important;
            }
            .swagger-ui .auth-btn-wrapper .btn.modal-btn.auth.btn-done,
            .swagger-ui .auth-btn-wrapper .btn.btn-done {
              background: transparent !important;
              color: rgba(255, 255, 255, 0.75) !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
            }
            .swagger-ui .auth-btn-wrapper .btn.modal-btn.auth.btn-done:hover,
            .swagger-ui .auth-btn-wrapper .btn.btn-done:hover {
              border-color: rgba(255, 255, 255, 0.4) !important;
              color: white !important;
            }
            /* Logout button after a token is set */
            .swagger-ui .auth-container .btn-logout,
            .swagger-ui .auth-btn-wrapper .btn.modal-btn.auth.btn-logout {
              background: transparent !important;
              color: #f87171 !important;
              border: 1px solid rgba(248, 113, 113, 0.4) !important;
            }
            .swagger-ui .auth-container .btn-logout:hover,
            .swagger-ui .auth-btn-wrapper .btn.modal-btn.auth.btn-logout:hover {
              background: rgba(248, 113, 113, 0.08) !important;
              border-color: rgba(248, 113, 113, 0.6) !important;
            }
            /* Authorized state styling */
            .swagger-ui .authorization__btn {
              color: rgba(255, 255, 255, 0.8) !important;
            }
            .swagger-ui .authorization__btn.locked svg,
            .swagger-ui .authorization__btn.unlocked svg {
              fill: currentColor !important;
            }
            .swagger-ui .auth-wrapper .authorize {
              color: rgba(255, 255, 255, 0.85) !important;
              border-color: rgba(255, 255, 255, 0.25) !important;
            }
            .swagger-ui .auth-wrapper .authorize:hover {
              border-color: rgba(255, 255, 255, 0.5) !important;
              color: white !important;
            }
            .swagger-ui .auth-wrapper .authorize svg {
              fill: currentColor !important;
            }
          `}</style>
          <SwaggerUI spec={openApiSpec} />
        </div>
      </section>
    </div>
  );
}
