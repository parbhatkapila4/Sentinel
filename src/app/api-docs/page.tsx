"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { openApiSpec } from "@/lib/openapi";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] overflow-y-auto">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                Sentinel API
              </h1>
              <p className="text-xs text-white/50">v1.0.0</p>
            </div>
          </div>
          <a
            href="/dashboard"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            Back to App
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
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
      </main>
    </div>
  );
}
