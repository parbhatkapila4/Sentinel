import type { NextConfig } from "next";
import path from "path";


const getCSP = () => {
  const isDev = process.env.NODE_ENV === "development";

  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://*.clerk.accounts.dev https://*.clerk.com https://*.sentry.io https://browser.sentry-cdn.com",
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://*.sentry.io https://api.openrouter.ai https://*.salesforce.com https://*.hubspot.com https://*.googleapis.com https://*.google.com wss://*.clerk.accounts.dev",
    "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.clerk.accounts.dev https://*.clerk.com",
    "frame-ancestors 'self'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
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
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,

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
