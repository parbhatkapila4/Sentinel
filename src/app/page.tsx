import Link from "next/link";
import nextDynamic from "next/dynamic";
import { getAuthenticatedUser } from "@/lib/auth";
import { PricingCards } from "@/components/pricing-cards";
import {
  PricingToggle,
  PricingToggleDisplay,
} from "@/components/pricing-toggle";
import Navbar from "@/components/revenue-navbar";

const WorldMapDemo = nextDynamic(
  () => import("@/components/world-map-demo").then((m) => ({ default: m.WorldMapDemo })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px] text-white/60 bg-[#0b0b0b]">
        <p>Loading map…</p>
      </div>
    ),
  }
);

export default async function Home() {
  const user = await getAuthenticatedUser();

  return (
    <div className="min-h-screen bg-black text-white antialiased overflow-x-hidden">
      <Navbar />

      <main id="main-content" tabIndex={-1}>
        <section className="px-4 sm:px-6 lg:px-8 xl:px-12 pt-24 sm:pt-32 lg:pt-40 xl:pt-48 pb-16 sm:pb-20 lg:pb-24">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg
              className="absolute top-16 right-4 sm:top-32 sm:right-32 lg:right-24 xl:right-32 w-48 h-48 sm:w-[500px] sm:h-[500px] lg:w-[550px] lg:h-[550px] opacity-40"
              viewBox="0 0 500 500"
              fill="none"
            >
              <path
                d="M 50 250 Q 250 50 450 250 T 50 250"
                stroke="#fbbf24"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M 100 250 Q 250 100 400 250 T 100 250"
                stroke="#f59e0b"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
            </svg>

            <div className="absolute top-24 left-4 sm:top-48 sm:left-24 lg:left-32 xl:left-40 w-24 h-24 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-red-500 rounded-full opacity-25 blur-2xl"></div>
            <div className="absolute top-32 left-12 sm:top-64 sm:left-48 lg:left-56 xl:left-64 w-20 h-20 sm:w-32 sm:h-32 lg:w-36 lg:h-36 bg-yellow-400 rounded-full opacity-25 blur-2xl"></div>
            <div className="absolute bottom-24 right-8 sm:bottom-48 sm:right-48 lg:right-56 xl:right-64 w-28 h-28 sm:w-48 sm:h-48 lg:w-52 lg:h-52 bg-blue-500 rounded-full opacity-25 blur-2xl"></div>

            <div className="absolute right-4 sm:right-24 lg:right-32 xl:right-40 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-3 opacity-30">
              {Array.from({ length: 7 }).map((_, i) => (
                <svg
                  key={i}
                  className="w-10 h-10 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              ))}
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-center">
              <div className="space-y-6 sm:space-y-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-bold leading-tight text-white">
                  Never Lose a Deal to
                  <br />
                  <span className="text-blue-400">Silent Decay.</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl text-white/80 leading-relaxed max-w-2xl">
                  Real-time risk detection that tells you exactly which deals are
                  dying and what to do about it. See why the most innovative sales
                  teams add automated risk alerts, deal-specific action
                  recommendations and intelligent activity tracking on top of
                  conventional CRM systems. You won&apos;t go back.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  {!user && (
                    <Link
                      href="/sign-up"
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap min-h-[44px]"
                    >
                      Sign Up
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>

              <div className="relative lg:min-h-[600px] xl:min-h-[650px] min-h-[280px] sm:min-h-[380px]">
                <div className="relative w-full h-full min-h-[280px] sm:min-h-[380px] lg:min-h-[550px] xl:min-h-[600px]">
                  <svg
                    viewBox="0 0 600 600"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <linearGradient
                        id="bluePipe3D"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#dbeafe" />
                        <stop offset="15%" stopColor="#bfdbfe" />
                        <stop offset="35%" stopColor="#93c5fd" />
                        <stop offset="50%" stopColor="#60a5fa" />
                        <stop offset="70%" stopColor="#3b82f6" />
                        <stop offset="85%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#1e40af" />
                      </linearGradient>

                      <linearGradient
                        id="blueHighlight"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop
                          offset="15%"
                          stopColor="#eff6ff"
                          stopOpacity="0.95"
                        />
                        <stop
                          offset="30%"
                          stopColor="#dbeafe"
                          stopOpacity="0.8"
                        />
                        <stop
                          offset="50%"
                          stopColor="#bfdbfe"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="70%"
                          stopColor="#93c5fd"
                          stopOpacity="0.4"
                        />
                        <stop
                          offset="100%"
                          stopColor="#60a5fa"
                          stopOpacity="0.1"
                        />
                      </linearGradient>

                      <linearGradient
                        id="blueShadow"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.9" />
                        <stop
                          offset="50%"
                          stopColor="#1e40af"
                          stopOpacity="0.7"
                        />
                        <stop
                          offset="100%"
                          stopColor="#0f172a"
                          stopOpacity="0.95"
                        />
                      </linearGradient>

                      <linearGradient
                        id="yellowTube"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#fef9c3" />
                        <stop offset="30%" stopColor="#fef08a" />
                        <stop offset="50%" stopColor="#fde047" />
                        <stop offset="70%" stopColor="#facc15" />
                        <stop offset="100%" stopColor="#eab308" />
                      </linearGradient>

                      <linearGradient
                        id="redTube"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#fee2e2" />
                        <stop offset="30%" stopColor="#fecaca" />
                        <stop offset="50%" stopColor="#fca5a5" />
                        <stop offset="70%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>

                      <linearGradient
                        id="orangeTube"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#ffedd5" />
                        <stop offset="30%" stopColor="#fed7aa" />
                        <stop offset="50%" stopColor="#fdba74" />
                        <stop offset="70%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>

                      <linearGradient
                        id="silver"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="20%" stopColor="#f8fafc" />
                        <stop offset="40%" stopColor="#f1f5f9" />
                        <stop offset="60%" stopColor="#e2e8f0" />
                        <stop offset="80%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#94a3b8" />
                      </linearGradient>

                      <linearGradient
                        id="darkBlueCyl"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="20%" stopColor="#1e40af" />
                        <stop offset="40%" stopColor="#1e3a8a" />
                        <stop offset="60%" stopColor="#1e3a5f" />
                        <stop offset="80%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>

                      <linearGradient
                        id="conveyor"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#94a3b8" />
                        <stop offset="25%" stopColor="#64748b" />
                        <stop offset="50%" stopColor="#475569" />
                        <stop offset="75%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#1e293b" />
                      </linearGradient>

                      <filter
                        id="glowBlue"
                        x="-100%"
                        y="-100%"
                        width="300%"
                        height="300%"
                      >
                        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                        <feColorMatrix
                          in="coloredBlur"
                          type="matrix"
                          values="0 0.4 1 0 0  0 0.5 1 0 0  0 0.7 1 0 0  0 0 0 0.6 0"
                        />
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      <filter
                        id="strongGlow"
                        x="-150%"
                        y="-150%"
                        width="400%"
                        height="400%"
                      >
                        <feGaussianBlur stdDeviation="12" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      <filter
                        id="shadow3D"
                        x="-100%"
                        y="-100%"
                        width="300%"
                        height="300%"
                      >
                        <feGaussianBlur
                          in="SourceAlpha"
                          stdDeviation="3"
                          result="blur1"
                        />
                        <feOffset in="blur1" dx="2" dy="3" result="offset1" />
                        <feGaussianBlur
                          in="SourceAlpha"
                          stdDeviation="6"
                          result="blur2"
                        />
                        <feOffset in="blur2" dx="4" dy="6" result="offset2" />
                        <feComponentTransfer in="offset1" result="shadow1">
                          <feFuncA type="linear" slope="0.8" />
                        </feComponentTransfer>
                        <feComponentTransfer in="offset2" result="shadow2">
                          <feFuncA type="linear" slope="0.4" />
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode in="shadow2" />
                          <feMergeNode in="shadow1" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      <filter
                        id="pulseGlow"
                        x="-100%"
                        y="-100%"
                        width="300%"
                        height="300%"
                      >
                        <feGaussianBlur stdDeviation="8" result="coloredBlur">
                          <animate
                            attributeName="stdDeviation"
                            values="6;10;6"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </feGaussianBlur>
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      <radialGradient id="blueBall3D" cx="25%" cy="25%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="15%" stopColor="#dbeafe" />
                        <stop offset="35%" stopColor="#93c5fd" />
                        <stop offset="55%" stopColor="#60a5fa" />
                        <stop offset="75%" stopColor="#3b82f6" />
                        <stop offset="90%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#1e40af" />
                      </radialGradient>
                      <radialGradient id="redBall3D" cx="25%" cy="25%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="15%" stopColor="#fee2e2" />
                        <stop offset="35%" stopColor="#fecaca" />
                        <stop offset="55%" stopColor="#fca5a5" />
                        <stop offset="75%" stopColor="#f87171" />
                        <stop offset="90%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </radialGradient>
                      <radialGradient id="silverBall3D" cx="25%" cy="25%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="20%" stopColor="#f8fafc" />
                        <stop offset="40%" stopColor="#f1f5f9" />
                        <stop offset="60%" stopColor="#e2e8f0" />
                        <stop offset="80%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#94a3b8" />
                      </radialGradient>
                      <radialGradient id="orangeBall3D" cx="25%" cy="25%">
                        <stop offset="0%" stopColor="#fff7ed" />
                        <stop offset="20%" stopColor="#ffedd5" />
                        <stop offset="40%" stopColor="#fed7aa" />
                        <stop offset="60%" stopColor="#fdba74" />
                        <stop offset="80%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#f97316" />
                      </radialGradient>
                    </defs>

                    <rect
                      x="85"
                      y="50"
                      width="32"
                      height="430"
                      rx="16"
                      fill="url(#darkBlueCyl)"
                      filter="url(#shadow3D)"
                    />

                    <rect
                      x="87"
                      y="50"
                      width="10"
                      height="430"
                      rx="5"
                      fill="url(#blueHighlight)"
                      opacity="0.7"
                    />

                    <rect
                      x="103"
                      y="50"
                      width="6"
                      height="430"
                      rx="3"
                      fill="url(#blueShadow)"
                      opacity="0.5"
                    />

                    <ellipse
                      cx="101"
                      cy="110"
                      rx="38"
                      ry="14"
                      fill="url(#darkBlueCyl)"
                      filter="url(#shadow3D)"
                    />
                    <ellipse
                      cx="96"
                      cy="110"
                      rx="30"
                      ry="10"
                      fill="url(#blueHighlight)"
                      opacity="0.4"
                    />

                    <ellipse
                      cx="101"
                      cy="170"
                      rx="35"
                      ry="12"
                      fill="url(#orangeTube)"
                      filter="url(#glowBlue)"
                    />
                    <ellipse
                      cx="96"
                      cy="170"
                      rx="28"
                      ry="9"
                      fill="url(#blueHighlight)"
                      opacity="0.3"
                    />

                    <ellipse
                      cx="101"
                      cy="230"
                      rx="33"
                      ry="11"
                      fill="url(#redTube)"
                      filter="url(#glowBlue)"
                    />
                    <ellipse
                      cx="96"
                      cy="230"
                      rx="26"
                      ry="8"
                      fill="url(#blueHighlight)"
                      opacity="0.3"
                    />

                    <ellipse
                      cx="101"
                      cy="460"
                      rx="45"
                      ry="18"
                      fill="url(#redTube)"
                      filter="url(#glowBlue)"
                    />
                    <ellipse
                      cx="96"
                      cy="460"
                      rx="38"
                      ry="15"
                      fill="url(#blueHighlight)"
                      opacity="0.3"
                    />

                    <ellipse
                      cx="101"
                      cy="290"
                      rx="22"
                      ry="9"
                      fill="url(#darkBlueCyl)"
                    />
                    <ellipse
                      cx="97"
                      cy="290"
                      rx="18"
                      ry="7"
                      fill="url(#blueHighlight)"
                      opacity="0.4"
                    />

                    <path
                      d="M 45 90 Q 20 135 45 180 Q 65 205 101 195"
                      stroke="url(#silver)"
                      strokeWidth="22"
                      fill="none"
                      strokeLinecap="round"
                      filter="url(#shadow3D)"
                    />
                    <path
                      d="M 47 92 Q 22 137 47 182 Q 67 207 101 197"
                      stroke="url(#blueHighlight)"
                      strokeWidth="5"
                      fill="none"
                      opacity="0.6"
                    />

                    <path
                      d="M 115 145 Q 205 135 290 155"
                      stroke="url(#yellowTube)"
                      strokeWidth="20"
                      fill="none"
                      strokeLinecap="round"
                      filter="url(#glowBlue)"
                    />
                    <path
                      d="M 115 145 Q 205 135 290 155"
                      stroke="#fef08a"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.5"
                    />

                    <path
                      d="M 290 155 Q 335 200 355 265"
                      stroke="url(#redTube)"
                      strokeWidth="18"
                      fill="none"
                      strokeLinecap="round"
                      filter="url(#glowBlue)"
                    />
                    <path
                      d="M 290 155 Q 335 200 355 265"
                      stroke="#fecaca"
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.5"
                    />

                    <path
                      d="M 125 195 Q 225 215 330 235 Q 390 245 390 305 Q 390 370 345 410 Q 295 450 240 430"
                      stroke="url(#bluePipe3D)"
                      strokeWidth="28"
                      fill="none"
                      strokeLinecap="round"
                      filter="url(#glowBlue)"
                    />

                    <path
                      d="M 125 195 Q 225 215 330 235 Q 390 245 390 305 Q 390 370 345 410 Q 295 450 240 430"
                      stroke="url(#blueHighlight)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.7"
                    />

                    <path
                      d="M 290 155 Q 320 185 340 250"
                      stroke="url(#bluePipe3D)"
                      strokeWidth="14"
                      fill="none"
                      strokeLinecap="round"
                      filter="url(#glowBlue)"
                    />
                    <path
                      d="M 290 155 Q 320 185 340 250"
                      stroke="url(#blueHighlight)"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.5"
                    />

                    <rect
                      x="45"
                      y="195"
                      width="85"
                      height="14"
                      rx="7"
                      fill="url(#orangeTube)"
                      filter="url(#shadow3D)"
                    />
                    <rect
                      x="47"
                      y="197"
                      width="30"
                      height="10"
                      rx="5"
                      fill="url(#blueHighlight)"
                      opacity="0.4"
                    />

                    <rect
                      x="45"
                      y="225"
                      width="80"
                      height="14"
                      rx="7"
                      fill="#fbbf24"
                      filter="url(#shadow3D)"
                    />
                    <rect
                      x="47"
                      y="227"
                      width="28"
                      height="10"
                      rx="5"
                      fill="#fef08a"
                      opacity="0.4"
                    />

                    <rect
                      x="45"
                      y="255"
                      width="75"
                      height="14"
                      rx="7"
                      fill="url(#redTube)"
                      filter="url(#shadow3D)"
                    />
                    <rect
                      x="47"
                      y="257"
                      width="26"
                      height="10"
                      rx="5"
                      fill="#fecaca"
                      opacity="0.4"
                    />

                    <rect
                      x="40"
                      y="495"
                      width="520"
                      height="70"
                      fill="url(#conveyor)"
                      filter="url(#shadow3D)"
                    />

                    {[
                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                      17,
                    ].map((i) => (
                      <g key={i}>
                        <line
                          x1={40 + i * 29}
                          y1="495"
                          x2={40 + i * 29}
                          y2="565"
                          stroke="#0f172a"
                          strokeWidth="2.5"
                        />
                        <rect
                          x={40 + i * 29 + 2}
                          y1="495"
                          width="6"
                          height="70"
                          fill="#1e293b"
                          opacity="0.5"
                        />
                      </g>
                    ))}

                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <g key={i} transform={`rotate(${-6 + i * 2.5})`}>
                        <animateMotion
                          dur={`${10 + i * 0.8}s`}
                          repeatCount="indefinite"
                          begin={`${i * 1.2}s`}
                          path={`M ${110 + i * 65},${510 + (i % 2) * 6} L 560,${510 + (i % 2) * 6
                            }`}
                        />
                        <rect
                          width="48"
                          height="24"
                          rx="3"
                          fill="#22c55e"
                          filter="url(#shadow3D)"
                        >
                          <animate
                            attributeName="opacity"
                            values="0.85;1;0.85"
                            dur={`${2.5 + i * 0.3}s`}
                            repeatCount="indefinite"
                            begin={`${i * 0.4}s`}
                          />
                        </rect>
                        <rect
                          x="3"
                          y="3"
                          width="42"
                          height="18"
                          fill="none"
                          stroke="#166534"
                          strokeWidth="1"
                        />
                        <text
                          x="24"
                          y="17"
                          fontSize="10"
                          fill="#166534"
                          textAnchor="middle"
                          fontWeight="bold"
                          fontFamily="Arial"
                        >
                          $
                        </text>
                        <rect
                          x="5"
                          y="12"
                          width="38"
                          height="1"
                          fill="#166534"
                          opacity="0.3"
                        />
                      </g>
                    ))}

                    <g>
                      <circle
                        r="12"
                        fill="url(#silverBall3D)"
                        filter="url(#pulseGlow)"
                        opacity="0.95"
                      >
                        <animateMotion
                          dur="6s"
                          repeatCount="indefinite"
                          path="M 115 145 Q 205 135 290 155"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.85;1;0.85"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle r="9" fill="url(#silverBall3D)" opacity="0.6">
                        <animateMotion
                          dur="6s"
                          repeatCount="indefinite"
                          path="M 115 145 Q 205 135 290 155"
                        />
                      </circle>
                      <circle r="5" fill="#ffffff" opacity="0.95">
                        <animateMotion
                          dur="6s"
                          repeatCount="indefinite"
                          path="M 110 140 Q 200 130 285 150"
                        />
                      </circle>
                      <circle r="2" fill="#ffffff" opacity="1">
                        <animateMotion
                          dur="6s"
                          repeatCount="indefinite"
                          path="M 108 138 Q 198 128 283 148"
                        />
                      </circle>
                    </g>

                    <g>
                      <circle
                        r="16"
                        fill="url(#blueBall3D)"
                        filter="url(#pulseGlow)"
                        opacity="0.95"
                      >
                        <animateMotion
                          dur="12s"
                          repeatCount="indefinite"
                          path="M 125 195 Q 225 215 330 235 Q 390 245 390 305 Q 390 370 345 410 Q 295 450 240 430"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.9;1;0.9"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle r="12" fill="url(#blueBall3D)" opacity="0.5">
                        <animateMotion
                          dur="12s"
                          repeatCount="indefinite"
                          path="M 125 195 Q 225 215 330 235 Q 390 245 390 305 Q 390 370 345 410 Q 295 450 240 430"
                        />
                      </circle>
                      <circle r="6" fill="#ffffff" opacity="0.95">
                        <animateMotion
                          dur="12s"
                          repeatCount="indefinite"
                          path="M 118 188 Q 218 208 323 228 Q 383 238 383 298 Q 383 363 338 403 Q 288 443 233 423"
                        />
                      </circle>
                      <circle r="3" fill="#ffffff" opacity="1">
                        <animateMotion
                          dur="12s"
                          repeatCount="indefinite"
                          path="M 116 186 Q 216 206 321 226 Q 381 236 381 296 Q 381 361 336 401 Q 286 441 231 421"
                        />
                      </circle>
                    </g>

                    <g>
                      <circle
                        r="13"
                        fill="url(#redBall3D)"
                        filter="url(#pulseGlow)"
                        opacity="0.95"
                      >
                        <animateMotion
                          dur="7s"
                          repeatCount="indefinite"
                          path="M 290 155 Q 335 200 355 265"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.85;1;0.85"
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle r="10" fill="url(#redBall3D)" opacity="0.5">
                        <animateMotion
                          dur="7s"
                          repeatCount="indefinite"
                          path="M 290 155 Q 335 200 355 265"
                        />
                      </circle>
                      <circle r="5" fill="#ffffff" opacity="0.95">
                        <animateMotion
                          dur="7s"
                          repeatCount="indefinite"
                          path="M 284 149 Q 329 194 349 259"
                        />
                      </circle>
                      <circle r="2.5" fill="#ffffff" opacity="1">
                        <animateMotion
                          dur="7s"
                          repeatCount="indefinite"
                          path="M 282 147 Q 327 192 347 257"
                        />
                      </circle>
                    </g>

                    <g>
                      <circle
                        r="11"
                        fill="url(#orangeBall3D)"
                        filter="url(#pulseGlow)"
                        opacity="0.95"
                      >
                        <animateMotion
                          dur="5s"
                          repeatCount="indefinite"
                          path="M 45 200 L 130 200"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.9;1;0.9"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle r="8" fill="url(#orangeBall3D)" opacity="0.5">
                        <animateMotion
                          dur="5s"
                          repeatCount="indefinite"
                          path="M 45 200 L 130 200"
                        />
                      </circle>
                      <circle r="4" fill="#fff7ed" opacity="0.95">
                        <animateMotion
                          dur="5s"
                          repeatCount="indefinite"
                          path="M 40 195 L 125 195"
                        />
                      </circle>
                      <circle r="2" fill="#ffffff" opacity="1">
                        <animateMotion
                          dur="5s"
                          repeatCount="indefinite"
                          path="M 38 193 L 123 193"
                        />
                      </circle>
                    </g>

                    {[0, 1, 2, 3].map((i) => (
                      <circle
                        key={`particle-${i}`}
                        r="3"
                        fill="#60a5fa"
                        opacity="0.6"
                      >
                        <animateMotion
                          dur={`${4 + i * 0.5}s`}
                          repeatCount="indefinite"
                          begin={`${i * 1}s`}
                          path="M 125 195 Q 225 215 330 235"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.3;0.8;0.3"
                          dur={`${2 + i * 0.3}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="r"
                          values="2;4;2"
                          dur={`${1.5 + i * 0.2}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    ))}
                  </svg>

                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-2 right-2 sm:top-10 sm:right-12 lg:top-12 lg:right-16 xl:top-14 xl:right-20 bg-white rounded-2xl rounded-bl-none px-3 py-2.5 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4 shadow-2xl max-w-[160px] sm:max-w-[210px] lg:max-w-[240px] border border-gray-100">
                      <p className="text-gray-800 text-xs sm:text-sm lg:text-base font-medium leading-snug">
                        Ready to protect your revenue with Sentinel?
                      </p>
                    </div>

                    <div className="absolute top-14 right-4 sm:top-28 sm:right-16 lg:top-32 lg:right-20 xl:top-36 xl:right-24 bg-blue-500 rounded-2xl rounded-br-none px-4 py-2 sm:px-6 sm:py-3 lg:px-7 lg:py-3.5 shadow-2xl max-w-[140px] sm:max-w-none">
                      <p className="text-white text-xs sm:text-sm lg:text-base font-semibold">
                        Absolutely!
                      </p>
                    </div>

                    <div className="absolute top-28 left-2 sm:top-44 sm:left-6 lg:top-52 lg:left-10 xl:top-56 xl:left-12 bg-white rounded-2xl rounded-bl-none px-3 py-2.5 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4 shadow-2xl max-w-[180px] sm:max-w-[230px] lg:max-w-[260px] border border-gray-100 sm:block hidden">
                      <p className="text-gray-800 text-xs sm:text-sm lg:text-base font-medium leading-snug">
                        Deal at risk: No activity detected in 7 days
                      </p>
                    </div>

                    <div className="absolute top-40 right-2 sm:top-60 sm:right-6 lg:top-64 lg:right-10 xl:top-72 xl:right-12 bg-blue-500 rounded-2xl rounded-br-none px-3 py-2.5 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4 shadow-2xl max-w-[150px] sm:max-w-[190px] lg:max-w-[220px]">
                      <p className="text-white text-xs sm:text-sm lg:text-base font-medium leading-snug">
                        Sending follow-up email now
                      </p>
                    </div>

                    <div className="absolute bottom-4 left-2 sm:bottom-20 sm:left-10 lg:bottom-24 lg:left-14 xl:bottom-28 xl:left-16 bg-white rounded-2xl rounded-bl-none px-3 py-2.5 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4 shadow-2xl max-w-[160px] sm:max-w-[210px] lg:max-w-[240px] border border-gray-100">
                      <p className="text-gray-800 text-xs sm:text-sm lg:text-base font-medium leading-snug">
                        Deal saved! Activity resumed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="py-20 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 xl:px-12"
          style={{ backgroundColor: "#000000" }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black text-white mb-4 sm:mb-6 leading-tight tracking-tight">
                Ready-made collaborative features.
              </h2>
              <p className="text-lg md:text-xl lg:text-lg xl:text-xl text-white/60 leading-relaxed max-w-4xl">
                Sentinel provides ready-to-use features through{" "}
                <strong className="text-white font-semibold">
                  customizable pre-built components
                </strong>{" "}
                that can easily be dropped into your product to{" "}
                <strong className="text-white font-semibold">
                  boost growth.
                </strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-6 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Real-Time Risk Detection
                  </h3>
                  <span className="text-xs text-white/40 font-mono">
                    DEAL-1644
                  </span>
                </div>
                <p className="text-white/70 text-sm mb-6">
                  Get instant alerts when deals show signs of stalling with our
                  advanced AI monitoring system.
                </p>
                <div className="bg-[#0f0f0f] rounded-lg p-4 border border-white/5 mb-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 shrink-0 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-white/90 text-sm mb-1 font-medium">
                        Deal at risk: No activity in 7 days
                      </div>
                      <div className="text-white/50 text-xs mb-3">
                        High-value deal requires immediate attention
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-white/60">Risk Score:</span>
                        <span className="text-red-400 font-semibold">85%</span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60">Created:</span>
                        <span className="text-white/70">13 January 2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-1 bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Activity Tracking
                  </h3>
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-white/60 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">
                      30d
                    </button>
                    <button className="w-5 h-5 flex items-center justify-center text-white/50">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-white/70 text-sm mb-4">
                  Complete visibility into all deal interactions in one unified
                  timeline.
                </p>
                <div className="bg-[#0f0f0f] rounded-lg p-4 border border-white/5">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-white/90 text-sm mb-1">
                          Email sent to client
                        </div>
                        <div className="text-white/50 text-xs">2 hours ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-white/90 text-sm mb-1">
                          Meeting scheduled
                        </div>
                        <div className="text-white/50 text-xs">1 day ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-white/90 text-sm mb-1">
                          Deal stage updated
                        </div>
                        <div className="text-white/50 text-xs">3 days ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 shadow-lg shadow-black/30 hover:border-white/10 transition-all">
                    <div className="text-white/50 text-xs mb-1">
                      At Risk Deals
                    </div>
                    <div className="text-2xl font-bold text-white">13</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 shadow-lg shadow-black/30 hover:border-white/10 transition-all">
                    <div className="text-white/50 text-xs mb-1">Active Deals</div>
                    <div className="text-2xl font-bold text-white">22</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 shadow-lg shadow-black/30 hover:border-white/10 transition-all">
                    <div className="text-white/50 text-xs mb-1">
                      Overdue Actions
                    </div>
                    <div className="text-2xl font-bold text-white">09</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl p-4 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20 hover:border-blue-500/70 transition-all">
                    <div className="text-white/50 text-xs mb-1">Risk Alerts</div>
                    <div className="text-2xl font-bold text-white">53</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 shadow-lg shadow-black/30 hover:border-white/10 transition-all">
                    <div className="text-white/50 text-xs mb-1">Total Deals</div>
                    <div className="text-2xl font-bold text-white">17</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 shadow-lg shadow-black/30 hover:border-white/10 transition-all">
                    <div className="text-white/50 text-xs mb-1">
                      High Priority
                    </div>
                    <div className="text-2xl font-bold text-white">11</div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-1 bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-4 tracking-tight">
                  Top 5 At-Risk Deals
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-sm">1.</span>
                      <span className="text-white text-sm">Enterprise Corp</span>
                      <span className="text-red-500 text-xs">↑</span>
                    </div>
                    <span className="text-white/70 text-sm">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-sm">2.</span>
                      <span className="text-white text-sm">Tech Solutions</span>
                      <span className="text-red-500 text-xs">↑</span>
                    </div>
                    <span className="text-white/70 text-sm">72%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-sm">3.</span>
                      <span className="text-white/70 text-sm">Global Inc</span>
                    </div>
                    <span className="text-white/60 text-sm">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-sm">4.</span>
                      <span className="text-white/60 text-sm">StartupXYZ</span>
                    </div>
                    <span className="text-white/50 text-sm">58%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-sm">5.</span>
                      <span className="text-white/60 text-sm">MegaCorp</span>
                    </div>
                    <span className="text-white/50 text-sm">52%</span>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-1 bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-4 tracking-tight">
                  Risk Alerts
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  Get notified instantly when deals require your attention.
                </p>
                <div className="bg-[#0f0f0f] rounded-lg p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                    <svg
                      className="w-4 h-4 text-white/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span className="text-white text-sm font-medium">Alerts</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500 shrink-0 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm">
                          Deal at risk: No activity in 7 days
                        </div>
                        <div className="text-white/60 text-xs mt-0.5">
                          Enterprise Corp - $50K deal
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500 shrink-0 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm">
                          Action overdue by 2 days
                        </div>
                        <div className="text-white/60 text-xs mt-0.5">
                          Tech Solutions - Follow up required
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-1 bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                  Action Recommendations
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Personalized, actionable steps powered by AI to save at-risk
                  deals.
                </p>
                <div className="bg-[#0f0f0f] rounded-lg p-4 border border-white/5">
                  <div className="text-white/90 text-sm mb-4 leading-relaxed">
                    Recommended actions for Enterprise Corp deal
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Send follow-up email</span>
                      <span className="text-white/50 text-xs ml-auto">
                        High priority
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Schedule discovery call</span>
                      <span className="text-white/50 text-xs ml-auto">
                        Medium
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <svg
                        className="w-4 h-4 text-white/40"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 012 0v2a1 1 0 11-2 0V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Review proposal terms</span>
                      <span className="text-white/40 text-xs ml-auto">Low</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-2 bg-[#1a1a1a] rounded-2xl p-6 lg:p-8 border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 tracking-tight">
                      Deal Analytics
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Deep insights to understand patterns, predict outcomes, and
                      optimize strategy.
                    </p>
                  </div>
                </div>
                <div className="bg-[#0f0f0f] rounded-lg p-4 lg:p-6 border border-white/5">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    <div>
                      <div className="flex justify-between items-center text-sm text-white/60 mb-2">
                        <span>Deal Health</span>
                        <span className="text-base font-semibold text-white">85%</span>
                      </div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-sm text-white/60 mb-2">
                        <span>Win Probability</span>
                        <span className="text-base font-semibold text-white">72%</span>
                      </div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: "72%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-sm text-white/60 mb-2">
                        <span>Activity Score</span>
                        <span className="text-base font-semibold text-white">45%</span>
                      </div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="py-12 sm:py-20 lg:py-24 xl:py-28 px-4 sm:px-6 lg:px-8 xl:px-12 relative overflow-hidden"
          style={{
            backgroundColor: "#000000",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          <div className="max-w-7xl mx-auto relative">
            <svg className="absolute w-0 h-0">
              <defs>
                <linearGradient
                  id="starGrad1"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient
                  id="starGrad2"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient
                  id="starGrad3"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>

            <div className="mb-10 sm:mb-16">
              <h2
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] font-black leading-none break-words"
                style={{
                  color: "#5a5a5a",
                  letterSpacing: "-0.02em",
                  backgroundImage: `
                  repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 8px),
                  repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 8px)
                `,
                  backgroundSize: "8px 8px",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "#5a5a5a",
                }}
              >
                HOWDOES
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12 xl:gap-16 mb-12 sm:mb-16">
              <div className="w-full max-w-[320px] lg:max-w-[360px]">
                <svg className="w-8 h-8 mb-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L14.09 8.26L22 9.27L17 14.14L18.18 22.02L12 18.77L5.82 22.02L7 14.14L2 9.27L9.91 8.26L12 2Z"
                    fill="url(#starGrad1)"
                  />
                </svg>

                <h3 className="text-white font-bold text-xl mb-3 leading-tight">
                  Connect Your
                  <br />
                  Deals
                </h3>

                <p className="text-white/80 text-sm leading-relaxed">
                  Import your deals from your CRM or create them directly.
                  Sentinel tracks every deal through its lifecycle with automated
                  activity monitoring.
                </p>
              </div>

              <div
                className="relative overflow-hidden w-full max-w-[580px] lg:max-w-[600px] xl:max-w-[650px] h-[140px] sm:h-[180px] lg:h-[200px] xl:h-[220px] rounded-[70px] sm:rounded-[90px] lg:rounded-[100px] border-4 sm:border-[8px] border-[#a3e635] bg-black mx-auto lg:mx-0"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                    radial-gradient(circle at 2px 2px, rgba(255,255,255,0.08) 1px, transparent 0)
                  `,
                    backgroundSize: "12px 12px",
                  }}
                />

                <div className="absolute inset-0 flex items-center justify-center gap-2 sm:gap-4 px-4 sm:px-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <span className="text-white/60 text-xs">Discover</span>
                  </div>
                  <div className="text-white/30">→</div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-yellow-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <span className="text-white/60 text-xs">Negotiate</span>
                  </div>
                  <div className="text-white/30">→</div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-white/60 text-xs">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12 sm:mb-16">
              <div
                className="relative overflow-hidden w-full max-w-[480px] lg:max-w-[520px] xl:max-w-[580px] h-[180px] sm:h-[220px] lg:h-[240px] xl:h-[260px] rounded-[90px] sm:rounded-[110px] lg:rounded-[120px] bg-[#a855f7] mx-auto lg:mx-0 order-2 lg:order-1"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                    radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)
                  `,
                    backgroundSize: "12px 12px",
                  }}
                />
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-[300px] sm:w-[380px] h-[100px] sm:h-[120px] rounded-[50px] sm:rounded-[60px] bg-black"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                      radial-gradient(circle at 2px 2px, rgba(255,255,255,0.08) 1px, transparent 0)
                    `,
                      backgroundSize: "12px 12px",
                      borderRadius: "60px",
                    }}
                  />
                  <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                    <div className="flex flex-col items-center">
                      <span className="text-red-400 text-2xl sm:text-3xl font-bold">85%</span>
                      <span className="text-white/50 text-xs">Risk Score</span>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-yellow-400 text-2xl sm:text-3xl font-bold">
                        7d
                      </span>
                      <span className="text-white/50 text-xs">No Activity</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[320px] lg:max-w-[360px] text-left lg:text-right order-1 lg:order-2 mx-auto lg:mx-0">
                <div className="flex justify-end mb-4">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L14.09 8.26L22 9.27L17 14.14L18.18 22.02L12 18.77L5.82 22.02L7 14.14L2 9.27L9.91 8.26L12 2Z"
                      fill="url(#starGrad2)"
                    />
                  </svg>
                </div>

                <h3 className="text-white font-bold text-xl mb-3 leading-tight">
                  Detect Risk Signals
                </h3>

                <p className="text-white/80 text-sm leading-relaxed">
                  Our AI continuously monitors deal activity and calculates risk
                  scores. Get instant alerts when deals show signs of stalling or
                  silent decay.
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="w-full max-w-[320px] mx-auto lg:mx-0">
                <svg className="w-8 h-8 mb-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L14.09 8.26L22 9.27L17 14.14L18.18 22.02L12 18.77L5.82 22.02L7 14.14L2 9.27L9.91 8.26L12 2Z"
                    fill="url(#starGrad3)"
                  />
                </svg>

                <h3 className="text-white font-bold text-xl mb-3 leading-tight">
                  Take Action &<br />
                  Close Deals
                </h3>

                <p className="text-white/80 text-sm leading-relaxed">
                  Get personalized action recommendations for every at-risk deal.
                  Follow up with the right message at the right time.
                </p>
              </div>

              <div
                className="relative overflow-hidden w-full max-w-[480px] lg:max-w-[520px] xl:max-w-[580px] h-[180px] sm:h-[220px] lg:h-[240px] xl:h-[260px] rounded-[90px] sm:rounded-[110px] lg:rounded-[120px] border-4 sm:border-[8px] border-[#c9b896] bg-black mx-auto lg:mx-0"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                    radial-gradient(circle at 2px 2px, rgba(255,255,255,0.08) 1px, transparent 0)
                  `,
                    backgroundSize: "12px 12px",
                  }}
                />

                <div
                  className="absolute"
                  style={{
                    top: "20px",
                    right: "0px",
                    width: "50px",
                    height: "16px",
                    backgroundColor: "#a3e635",
                    borderRadius: "8px 0 0 8px",
                  }}
                />

                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1a1a] rounded-lg shadow-2xl p-3 sm:p-4 w-[200px] sm:w-[240px]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium">
                          Send follow-up
                        </span>
                        <span className="text-white/50 text-xs">
                          High priority
                        </span>
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-white/60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <div className="h-px bg-white/10 mb-2"></div>
                  <div className="text-white/40 text-xs">
                    Recommended for Enterprise Corp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="py-12 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-12 relative overflow-hidden"
          style={{
            backgroundColor: "#000000",
          }}
        >
          <div className="relative z-10 max-w-5xl mx-auto">
            <PricingToggle>
              <div className="text-center mb-10 sm:mb-14">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-normal text-white mb-4 sm:mb-6 leading-tight tracking-tight px-2"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontStyle: "italic",
                  }}
                >
                  Choose The Perfect Plan
                  <br />
                  That Fits Your Revenue Team
                </h2>
                <p className="text-white/60 text-sm max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
                  Whether you&apos;re a solo sales rep or a large revenue
                  organization, Sentinel offers flexible pricing plans to
                  help you never lose a deal to silent decay.
                </p>

                <div className="flex justify-center">
                  <PricingToggleDisplay />
                </div>
              </div>

              <PricingCards />
            </PricingToggle>
          </div>
        </section>

        <WorldMapDemo />

        <footer
          className="px-4 sm:px-6 lg:px-10 xl:px-12 py-12 sm:py-16 lg:py-20"
          style={{ background: "#000000" }}
        >
          <div
            className="max-w-7xl mx-auto rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 xl:p-14"
            style={{
              background: "#000000",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-6 xl:gap-8 mb-10 sm:mb-16">
              <div className="lg:col-span-2">
                <h3 className="text-white text-lg lg:text-xl font-semibold mb-4 lg:mb-6">
                  Join our newsletter to stay up to date on the latest news and
                  updates.
                </h3>
                <div className="flex flex-col sm:flex-row gap-3 mb-3 lg:mb-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-3 rounded-full border border-white/20 focus:outline-none focus:border-blue-500 text-white placeholder:text-white/50"
                    style={{ background: "#2a2a2a" }}
                  />
                  <button
                    className="px-8 py-3 rounded-full text-white font-semibold whitespace-nowrap hover:opacity-90 transition-opacity"
                    style={{ background: "#2563eb" }}
                  >
                    Subscribe
                  </button>
                </div>
                <p className="text-sm text-white/60">
                  By subscribing, you agree to our Privacy Policy and consent to
                  receive updates from us.
                </p>
              </div>

              <div className="lg:ml-8 xl:ml-12">
                <h4 className="text-white font-semibold mb-4 lg:mb-6">Product</h4>
                <ul className="space-y-2 lg:space-y-3">
                  <li>
                    <a
                      href="/features"
                      className="text-white/60 hover:text-white transition-colors text-sm lg:text-base"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="/pricing"
                      className="text-white/60 hover:text-white transition-colors text-sm lg:text-base"
                    >
                      Pricing
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 lg:mb-6">Resources</h4>
                <ul className="space-y-2 lg:space-y-3">
                  <li>
                    <Link
                      href="/docs"
                      className="text-white/60 hover:text-white transition-colors text-sm lg:text-base"
                    >
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-white/60 hover:text-white transition-colors text-sm lg:text-base"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 lg:mb-6">Company</h4>
                <ul className="space-y-2 lg:space-y-3">
                  <li>
                    <Link
                      href="/about"
                      className="text-white/60 hover:text-white transition-colors text-sm lg:text-base"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <a
                      href="/privacy"
                      className="text-white/60 hover:text-white transition-colors text-sm lg:text-base"
                    >
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-8 sm:mt-12">
              <span
                className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-bold block break-words"
                style={{
                  color: "#ffffff",
                  fontFamily: "'Joyride', sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                S
                <span
                  style={{
                    display: "inline-block",
                    transform: "scaleX(1.35)",
                    transformOrigin: "center",
                    marginRight: "0.2em",
                  }}
                >
                  E
                </span>
                NTINEL
              </span>
              <div className="flex items-center justify-center gap-4 lg:gap-5 mt-6 lg:mt-8">
                <a
                  href="https://x.com/Parbhat03"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                  aria-label="Twitter"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/parbhatkapila4/Sentinel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                  aria-label="GitHub"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/parbhat-kapila/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                  aria-label="LinkedIn"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a
                  href="https://www.reddit.com/user/Confident-Mistake204/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                  aria-label="Reddit"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#ffffff"
                  >
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
