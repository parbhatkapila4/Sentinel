import type { NextConfig } from "next";
import path from "path";

const getCSP = () => {
  const isDev = process.env.NODE_ENV === "development";
  const scriptUnsafeDirectives = isDev
    ? "'unsafe-eval' 'unsafe-inline' "
    : "'unsafe-inline' ";

  const directives = [
    "default-src 'self'",
    `script-src 'self' ${scriptUnsafeDirectives}blob: https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://*.sentry.io https://browser.sentry-cdn.com`,
    "script-src-attr 'none'",
    "worker-src 'self' blob:",

    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob: https://img.clerk.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://*.sentry.io https://*.salesforce.com https://*.hubspot.com https://*.googleapis.com https://*.google.com wss://*.clerk.accounts.dev",
    "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.clerk.accounts.dev https://*.clerk.com",
    "frame-ancestors 'self'",
    ...(isDev ? [] : ["upgrade-insecure-requests", "block-all-mixed-content"]),
  ];

  return directives.join("; ");
};

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: getCSP(),
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
  },
];

if (!process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY) {
  console.warn(
    "\n[next.config] NEXT_SERVER_ACTIONS_ENCRYPTION_KEY is not set.\n" +
      "  → Without it, Server Action IDs rotate on every build AND every Fast Refresh.\n" +
      "  → That surfaces as the 'Send failed: An unexpected response was received from the server'\n" +
      "    error in dev whenever you edit a file, and breaks live sessions on every prod deploy.\n" +
      "  Generate a stable key once with:\n" +
      "    node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"\n" +
      "  Paste into .env.local (for dev) and Vercel project env (for prod). See .env.example.\n"
  );
}

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  reactCompiler: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },


  turbopack: {
    resolveAlias: {
      "node:inspector": "./src/lib/stub-inspector.js",
    },
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve = config.resolve ?? {};
      config.resolve.alias = {
        ...config.resolve.alias,
        "node:inspector": path.resolve(process.cwd(), "src/lib/stub-inspector.js"),
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
