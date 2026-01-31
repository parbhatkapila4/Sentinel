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

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors -ml-76"
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
            Back
          </Link>
        </div>
      </div>

      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            API Reference
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            Complete API documentation with interactive examples. Explore all endpoints,
            request/response formats, and authentication methods.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <style jsx global>{`
          .swagger-ui {
            background: transparent !important;
          }
          .swagger-ui .topbar {
            display: none !important;
          }
          .swagger-ui .info {
            margin: 30px 0 !important;
          }
          .swagger-ui .info .title {
            color: white !important;
            font-size: 2rem !important;
          }
          .swagger-ui .info .description {
            color: rgba(255,255,255,0.7) !important;
          }
          .swagger-ui .info .description p {
            color: rgba(255,255,255,0.7) !important;
          }
          .swagger-ui .info .description h1,
          .swagger-ui .info .description h2,
          .swagger-ui .info .description h3 {
            color: white !important;
          }
          .swagger-ui .info .description code {
            background: rgba(255,255,255,0.1) !important;
            color: #22c55e !important;
          }
          .swagger-ui .scheme-container {
            background: rgba(255,255,255,0.05) !important;
            box-shadow: none !important;
          }
          .swagger-ui .opblock-tag {
            color: white !important;
            border-bottom: 1px solid rgba(255,255,255,0.1) !important;
          }
          .swagger-ui .opblock {
            background: rgba(255,255,255,0.02) !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            border-radius: 8px !important;
            margin-bottom: 10px !important;
          }
          .swagger-ui .opblock .opblock-summary {
            border-bottom: 1px solid rgba(255,255,255,0.1) !important;
          }
          .swagger-ui .opblock .opblock-summary-method {
            border-radius: 4px !important;
          }
          .swagger-ui .opblock .opblock-summary-description {
            color: rgba(255,255,255,0.7) !important;
          }
          .swagger-ui .opblock .opblock-summary-path {
            color: white !important;
          }
          .swagger-ui .opblock-body pre {
            background: rgba(0,0,0,0.3) !important;
            border-radius: 6px !important;
          }
          .swagger-ui .opblock-description-wrapper p {
            color: rgba(255,255,255,0.7) !important;
          }
          .swagger-ui .parameters-col_description {
            color: rgba(255,255,255,0.7) !important;
          }
          .swagger-ui table thead tr td,
          .swagger-ui table thead tr th {
            color: white !important;
            border-bottom: 1px solid rgba(255,255,255,0.1) !important;
          }
          .swagger-ui .parameter__name {
            color: white !important;
          }
          .swagger-ui .parameter__type {
            color: rgba(255,255,255,0.5) !important;
          }
          .swagger-ui .model-title {
            color: white !important;
          }
          .swagger-ui .model {
            color: rgba(255,255,255,0.7) !important;
          }
          .swagger-ui .model-box {
            background: rgba(255,255,255,0.02) !important;
          }
          .swagger-ui section.models {
            border: 1px solid rgba(255,255,255,0.1) !important;
            border-radius: 8px !important;
          }
          .swagger-ui section.models h4 {
            color: white !important;
          }
          .swagger-ui .btn {
            border-radius: 6px !important;
          }
          .swagger-ui select {
            background: rgba(255,255,255,0.05) !important;
            color: white !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
          }
          .swagger-ui input {
            background: rgba(255,255,255,0.05) !important;
            color: white !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
          }
          .swagger-ui textarea {
            background: rgba(255,255,255,0.05) !important;
            color: white !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
          }
          .swagger-ui .responses-inner h4,
          .swagger-ui .responses-inner h5 {
            color: white !important;
          }
          .swagger-ui .response-col_status {
            color: white !important;
          }
          .swagger-ui .response-col_description {
            color: rgba(255,255,255,0.7) !important;
          }
        `}</style>
          <SwaggerUI spec={openApiSpec} />
        </div>
      </section>
    </div>
  );
}
