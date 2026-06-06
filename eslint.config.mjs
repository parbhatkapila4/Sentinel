import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
  {
    files: [
      "src/components/sentinel/**/*.{ts,tsx}",
      "src/app/dashboard/page.tsx",
      "src/app/deals/page.tsx",
      "src/app/analytics/page.tsx",
      "src/app/top-deals/page.tsx",
      "src/app/top-deals/loading.tsx",
      "src/app/deals-by-stage/page.tsx",
      "src/app/deals-by-stage/loading.tsx",
      "src/app/risk-overview/page.tsx",
      "src/app/risk-overview/loading.tsx",
      "src/app/reports/page.tsx",
      "src/app/reports/loading.tsx",
      "src/app/insights/page.tsx",
      "src/app/insights/loading.tsx",
      "src/app/notifications/page.tsx",
      "src/app/notifications/loading.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/(^|\\s)(text|bg)-(white|black)(\\s|\\/|$)/]",
          message:
            "Sentinel: use var(--cream) or var(--ink) instead of text-white/bg-black/etc.",
        },
        {
          selector:
            "Literal[value=/(^|\\s)(text|bg|border)-(neutral|gray|zinc|slate|stone)-/]",
          message:
            "Sentinel: use --cream-2/--cream-3/--cream-4/--rule tokens instead of grayscale Tailwind utilities.",
        },
        {
          selector:
            "Literal[value=/(^|\\s)text-(red|blue|emerald|amber|green|purple|teal|lime|cyan|fuchsia|pink|indigo|violet|rose|sky|orange)-/]",
          message:
            "Sentinel: use --signal/--copper/--ivy/--wine tokens instead of named-color Tailwind utilities.",
        },
        {
          selector:
            "TemplateElement[value.raw=/(text|bg)-(white|black)(\\s|\\/|$)/]",
          message:
            "Sentinel: use var(--cream) or var(--ink) instead of text-white/bg-black/etc.",
        },
      ],
    },
  },
]);

export default eslintConfig;
