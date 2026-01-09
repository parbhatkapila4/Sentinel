import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { SignInButtonWrapper } from "@/components/sign-in-button";
import { PricingCards } from "@/components/pricing-cards";
import {
  PricingToggle,
  PricingToggleDisplay,
} from "@/components/pricing-toggle";
import Navbar from "@/components/revenue-navbar";
import { WorldMapDemo } from "@/components/world-map-demo";

export default async function Home() {
  const user = await getAuthenticatedUser();

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Navbar />

      <section className="relative min-h-screen flex items-center pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg
            className="absolute top-32 right-32 w-[500px] h-[500px] opacity-40"
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

          <div className="absolute top-48 left-24 w-40 h-40 bg-red-500 rounded-full opacity-25 blur-2xl"></div>
          <div className="absolute top-64 left-48 w-32 h-32 bg-yellow-400 rounded-full opacity-25 blur-2xl"></div>
          <div className="absolute bottom-48 right-48 w-48 h-48 bg-blue-500 rounded-full opacity-25 blur-2xl"></div>

          <div className="absolute right-24 top-1/2 -translate-y-1/2 flex flex-col gap-3 opacity-30">
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
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1]">
                Never Lose a Deal to
                <br />
                <span className="text-blue-400">Silent Decay.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl">
                Real-time risk detection that tells you exactly which deals are
                dying and what to do about it. See why the most innovative sales
                teams add automated risk alerts, deal-specific action
                recommendations and intelligent activity tracking on top of
                conventional CRM systems. You won&apos;t go back.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl pt-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    Open Dashboard
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
                ) : (
                  <div className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer">
                    <SignInButtonWrapper />
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
                  </div>
                )}
              </div>
            </div>

            <div className="relative lg:min-h-[600px]">
              <div className="relative w-full h-full">
                <svg
                  viewBox="0 0 500 600"
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient
                      id="chrome"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                      <stop offset="20%" stopColor="#f8f9fa" stopOpacity="1" />
                      <stop offset="40%" stopColor="#e9ecef" stopOpacity="1" />
                      <stop offset="60%" stopColor="#dee2e6" stopOpacity="1" />
                      <stop offset="80%" stopColor="#ced4da" stopOpacity="1" />
                      <stop offset="100%" stopColor="#adb5bd" stopOpacity="1" />
                    </linearGradient>

                    <linearGradient
                      id="blue3D"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#93c5fd" stopOpacity="1" />
                      <stop offset="25%" stopColor="#60a5fa" stopOpacity="1" />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                      <stop offset="75%" stopColor="#2563eb" stopOpacity="1" />
                      <stop offset="100%" stopColor="#1e40af" stopOpacity="1" />
                    </linearGradient>

                    <linearGradient
                      id="orange3D"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#fdba74" stopOpacity="1" />
                      <stop offset="25%" stopColor="#fb923c" stopOpacity="1" />
                      <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
                      <stop offset="75%" stopColor="#ea580c" stopOpacity="1" />
                      <stop offset="100%" stopColor="#c2410c" stopOpacity="1" />
                    </linearGradient>

                    <linearGradient
                      id="yellow3D"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#fde047" stopOpacity="1" />
                      <stop offset="25%" stopColor="#fcd34d" stopOpacity="1" />
                      <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                      <stop offset="75%" stopColor="#f59e0b" stopOpacity="1" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
                    </linearGradient>

                    <radialGradient id="silverBall" cx="30%" cy="25%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                      <stop
                        offset="20%"
                        stopColor="#f8f9fa"
                        stopOpacity="0.98"
                      />
                      <stop
                        offset="40%"
                        stopColor="#f1f3f5"
                        stopOpacity="0.95"
                      />
                      <stop
                        offset="70%"
                        stopColor="#dee2e6"
                        stopOpacity="0.9"
                      />
                      <stop
                        offset="100%"
                        stopColor="#adb5bd"
                        stopOpacity="0.8"
                      />
                    </radialGradient>

                    <filter
                      id="glow"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <filter
                      id="realShadow"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
                      <feOffset dx="5" dy="6" result="offsetblur" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.6" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <filter
                      id="strongGlow"
                      x="-100%"
                      y="-100%"
                      width="300%"
                      height="300%"
                    >
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <g filter="url(#realShadow)">
                    <rect
                      x="75"
                      y="80"
                      width="10"
                      height="420"
                      fill="url(#chrome)"
                      opacity="0.95"
                      rx="5"
                    />
                    <rect
                      x="73"
                      y="78"
                      width="14"
                      height="424"
                      fill="none"
                      stroke="url(#chrome)"
                      strokeWidth="1"
                      opacity="0.6"
                    />

                    <rect
                      x="50"
                      y="110"
                      width="60"
                      height="14"
                      fill="url(#orange3D)"
                      opacity="1"
                      rx="2"
                    />
                    <rect
                      x="48"
                      y="108"
                      width="64"
                      height="18"
                      fill="none"
                      stroke="url(#chrome)"
                      strokeWidth="2.5"
                      opacity="0.9"
                    />

                    <rect
                      x="50"
                      y="170"
                      width="60"
                      height="14"
                      fill="url(#blue3D)"
                      opacity="1"
                      rx="2"
                    />
                    <rect
                      x="48"
                      y="168"
                      width="64"
                      height="18"
                      fill="none"
                      stroke="url(#chrome)"
                      strokeWidth="2.5"
                      opacity="0.9"
                    />

                    <rect
                      x="50"
                      y="230"
                      width="60"
                      height="14"
                      fill="url(#yellow3D)"
                      opacity="1"
                      rx="2"
                    />
                    <rect
                      x="48"
                      y="228"
                      width="64"
                      height="18"
                      fill="none"
                      stroke="url(#chrome)"
                      strokeWidth="2.5"
                      opacity="0.9"
                    />

                    <rect
                      x="50"
                      y="290"
                      width="60"
                      height="14"
                      fill="url(#orange3D)"
                      opacity="1"
                      rx="2"
                    />
                    <rect
                      x="48"
                      y="288"
                      width="64"
                      height="18"
                      fill="none"
                      stroke="url(#chrome)"
                      strokeWidth="2.5"
                      opacity="0.9"
                    />

                    <ellipse
                      cx="80"
                      cy="440"
                      rx="28"
                      ry="18"
                      fill="url(#blue3D)"
                      opacity="1"
                    />
                    <rect
                      x="52"
                      y="422"
                      width="56"
                      height="36"
                      fill="url(#blue3D)"
                      opacity="1"
                      rx="2"
                    />
                    <ellipse
                      cx="80"
                      cy="422"
                      rx="28"
                      ry="18"
                      fill="url(#blue3D)"
                      opacity="0.7"
                    />

                    <path
                      d="M 45 440 Q 15 460, 5 490 Q 0 510, 8 535 Q 12 550, 20 560"
                      stroke="url(#chrome)"
                      strokeWidth="8"
                      fill="none"
                      opacity="0.95"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 42 443 Q 12 463, 7 493 Q 3 513, 11 538 Q 15 553, 23 563"
                      stroke="url(#blue3D)"
                      strokeWidth="5"
                      fill="none"
                      opacity="0.8"
                      strokeLinecap="round"
                    />

                    <g
                      transform="translate(80, 80)"
                      className="animate-rotate-gear"
                    >
                      <circle
                        r="40"
                        fill="none"
                        stroke="url(#blue3D)"
                        strokeWidth="10"
                        opacity="1"
                      />
                      <circle
                        r="35"
                        fill="none"
                        stroke="url(#chrome)"
                        strokeWidth="4"
                        opacity="0.95"
                      />

                      {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i * 45 * Math.PI) / 180;
                        const x = Math.cos(angle) * 35;
                        const y = Math.sin(angle) * 35;
                        return (
                          <line
                            key={i}
                            x1="0"
                            y1="0"
                            x2={x}
                            y2={y}
                            stroke="url(#chrome)"
                            strokeWidth="4"
                            opacity="0.95"
                            strokeLinecap="round"
                          />
                        );
                      })}
                      <circle r="12" fill="url(#blue3D)" opacity="1" />
                      <circle r="8" fill="#ffffff" opacity="0.4" />
                    </g>
                  </g>

                  <path
                    d="M 130 80 Q 220 60, 300 80 Q 350 95, 370 120"
                    stroke="url(#orange3D)"
                    strokeWidth="18"
                    fill="none"
                    opacity="1"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-track-glow"
                  />
                  <path
                    d="M 130 80 Q 220 60, 300 80 Q 350 95, 370 120"
                    stroke="url(#chrome)"
                    strokeWidth="20"
                    fill="none"
                    opacity="0.5"
                  />
                  <path
                    d="M 370 120 Q 390 145, 400 170"
                    stroke="url(#blue3D)"
                    strokeWidth="18"
                    fill="none"
                    opacity="1"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-track-glow"
                  />

                  <rect
                    x="320"
                    y="50"
                    width="160"
                    height="12"
                    fill="url(#blue3D)"
                    opacity="1"
                    rx="6"
                    filter="url(#glow)"
                    className="animate-track-glow"
                  />
                  <rect
                    x="320"
                    y="48"
                    width="70"
                    height="16"
                    fill="url(#yellow3D)"
                    opacity="1"
                    rx="6"
                    filter="url(#glow)"
                    className="animate-track-glow"
                  />
                  <rect
                    x="318"
                    y="46"
                    width="164"
                    height="20"
                    fill="none"
                    stroke="url(#chrome)"
                    strokeWidth="3.5"
                    opacity="0.95"
                  />

                  <g className="animate-marble-1 animate-glow animate-bounce">
                    <circle
                      cx="360"
                      cy="56"
                      r="12"
                      fill="url(#silverBall)"
                      opacity="1"
                      filter="url(#strongGlow)"
                    />
                    <circle
                      cx="360"
                      cy="56"
                      r="9"
                      fill="#ffffff"
                      opacity="0.7"
                    />
                    <circle
                      cx="360"
                      cy="56"
                      r="5"
                      fill="#ffffff"
                      opacity="0.9"
                    />
                  </g>
                  <g
                    className="animate-marble-2 animate-glow animate-bounce"
                    style={{ animationDelay: "1s" }}
                  >
                    <circle
                      cx="430"
                      cy="56"
                      r="12"
                      fill="url(#silverBall)"
                      opacity="1"
                      filter="url(#strongGlow)"
                    />
                    <circle
                      cx="430"
                      cy="56"
                      r="9"
                      fill="#ffffff"
                      opacity="0.7"
                    />
                    <circle
                      cx="430"
                      cy="56"
                      r="5"
                      fill="#ffffff"
                      opacity="0.9"
                    />
                  </g>

                  {Array.from({ length: 8 }).map((_, i) => (
                    <circle
                      key={`energy-${i}`}
                      r="3"
                      fill="#60a5fa"
                      opacity="0.6"
                      filter="url(#glow)"
                    >
                      <animateMotion
                        dur="8s"
                        repeatCount="indefinite"
                        begin={`${i * 1}s`}
                        path="M 130 120 Q 200 160, 240 200 Q 260 230, 270 260"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.3;0.8;0.3"
                        dur="2s"
                        repeatCount="indefinite"
                        begin={`${i * 0.25}s`}
                      />
                    </circle>
                  ))}

                  {Array.from({ length: 5 }).map((_, i) => (
                    <circle
                      key={`yellow-energy-${i}`}
                      r="2.5"
                      fill="#fbbf24"
                      opacity="0.5"
                      filter="url(#glow)"
                    >
                      <animateMotion
                        dur="6s"
                        repeatCount="indefinite"
                        begin={`${i * 1.2}s`}
                        path="M 270 260 Q 280 285, 290 310"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.2;0.7;0.2"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}

                  {Array.from({ length: 6 }).map((_, i) => (
                    <circle
                      key={`loop-energy-${i}`}
                      r="3"
                      fill="#3b82f6"
                      opacity="0.5"
                      filter="url(#glow)"
                    >
                      <animateMotion
                        dur="7s"
                        repeatCount="indefinite"
                        begin={`${i * 1.2}s`}
                        path="M 360 180 Q 420 200, 450 230 Q 420 260, 360 280"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.3;0.8;0.3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}

                  {Array.from({ length: 4 }).map((_, i) => (
                    <circle
                      key={`blue-energy-${i}`}
                      r="2.5"
                      fill="#3b82f6"
                      opacity="0.4"
                      filter="url(#glow)"
                    >
                      <animateMotion
                        dur="5s"
                        repeatCount="indefinite"
                        begin={`${i * 1.3}s`}
                        path="M 290 310 Q 330 335, 360 360"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.2;0.6;0.2"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}

                  {Array.from({ length: 7 }).map((_, i) => (
                    <circle
                      key={`multi-energy-${i}`}
                      r="3"
                      fill={
                        i % 3 === 0
                          ? "#f97316"
                          : i % 3 === 1
                          ? "#fbbf24"
                          : "#3b82f6"
                      }
                      opacity="0.4"
                      filter="url(#glow)"
                    >
                      <animateMotion
                        dur="10s"
                        repeatCount="indefinite"
                        begin={`${i * 1.4}s`}
                        path="M 360 360 Q 400 385, 430 410 Q 445 430, 455 450 Q 465 470, 470 490"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.2;0.7;0.2"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}

                  {Array.from({ length: 5 }).map((_, i) => (
                    <circle
                      key={`ramp-energy-${i}`}
                      r="2.5"
                      fill="#f97316"
                      opacity="0.5"
                      filter="url(#glow)"
                    >
                      <animateMotion
                        dur="6s"
                        repeatCount="indefinite"
                        begin={`${i * 1.2}s`}
                        path="M 130 80 Q 220 60, 300 80 Q 350 95, 370 120"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.3;0.7;0.3"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}

                  <path
                    d="M 130 120 Q 200 160, 240 200 Q 260 230, 270 260"
                    stroke="url(#orange3D)"
                    strokeWidth="16"
                    fill="none"
                    opacity="1"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-track-glow"
                  />
                  <path
                    d="M 130 120 Q 200 160, 240 200 Q 260 230, 270 260"
                    stroke="url(#chrome)"
                    strokeWidth="18"
                    fill="none"
                    opacity="0.4"
                  />
                  <path
                    d="M 270 260 Q 280 285, 290 310"
                    stroke="url(#yellow3D)"
                    strokeWidth="16"
                    fill="none"
                    opacity="1"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-track-glow"
                  />

                  <path
                    d="M 290 310 Q 330 335, 360 360"
                    stroke="url(#blue3D)"
                    strokeWidth="18"
                    fill="none"
                    opacity="1"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-track-glow"
                  />

                  <path
                    d="M 360 360 Q 400 385, 430 410"
                    stroke="url(#orange3D)"
                    strokeWidth="20"
                    fill="none"
                    opacity="1"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-track-glow"
                  />
                  <path
                    d="M 430 410 Q 445 430, 455 450"
                    stroke="url(#yellow3D)"
                    strokeWidth="20"
                    fill="none"
                    opacity="1"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-track-glow"
                  />
                  <path
                    d="M 455 450 Q 465 470, 470 490"
                    stroke="url(#blue3D)"
                    strokeWidth="20"
                    fill="none"
                    opacity="1"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-track-glow"
                  />

                  <path
                    d="M 360 180 Q 420 200, 450 230 Q 420 260, 360 280"
                    stroke="url(#blue3D)"
                    strokeWidth="22"
                    fill="none"
                    opacity="1"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-track-glow"
                  />
                  <path
                    d="M 360 180 Q 420 200, 450 230 Q 420 260, 360 280"
                    stroke="url(#chrome)"
                    strokeWidth="24"
                    fill="none"
                    opacity="0.3"
                  />
                  <path
                    d="M 370 210 Q 410 225, 430 230 Q 410 235, 370 250"
                    stroke="url(#orange3D)"
                    strokeWidth="16"
                    fill="none"
                    opacity="1"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-track-glow"
                  />

                  <path
                    d="M 400 380 Q 450 430, 470 480 Q 475 510, 470 540"
                    stroke="url(#blue3D)"
                    strokeWidth="24"
                    fill="none"
                    opacity="1"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-track-glow"
                  />

                  <path
                    d="M 470 540 L 490 560"
                    stroke="url(#blue3D)"
                    strokeWidth="20"
                    fill="none"
                    opacity="1"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    className="animate-track-glow"
                  />

                  {Array.from({ length: 5 }).map((_, i) => (
                    <circle
                      key={`chute-energy-${i}`}
                      r="3"
                      fill="#3b82f6"
                      opacity="0.5"
                      filter="url(#glow)"
                    >
                      <animateMotion
                        dur="8s"
                        repeatCount="indefinite"
                        begin={`${i * 1.6}s`}
                        path="M 400 380 Q 450 430, 470 480 Q 475 510, 470 540 L 490 560"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.3;0.8;0.3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}

                  <g className="animate-pulse-glow">
                    <circle
                      r="11"
                      fill="url(#silverBall)"
                      opacity="1"
                      filter="url(#strongGlow)"
                    >
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        begin="2s"
                        path="M 400 380 Q 450 430, 470 480 Q 475 510, 470 540 L 490 560"
                      />
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0;360"
                        dur="0.45s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>

                  <path
                    d="M 220 180 L 280 240"
                    stroke="url(#yellow3D)"
                    strokeWidth="12"
                    fill="none"
                    opacity="1"
                    filter="url(#realShadow)"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 220 180 L 280 240"
                    stroke="url(#chrome)"
                    strokeWidth="14"
                    fill="none"
                    opacity="0.4"
                  />

                  <path
                    d="M 320 280 Q 350 300, 370 320"
                    stroke="url(#blue3D)"
                    strokeWidth="14"
                    fill="none"
                    opacity="1"
                    filter="url(#realShadow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 320 280 Q 350 300, 370 320"
                    stroke="url(#chrome)"
                    strokeWidth="16"
                    fill="none"
                    opacity="0.4"
                  />
                </svg>

                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-24 left-12 bg-purple-500 rounded-2xl rounded-bl-none p-4 max-w-[220px] shadow-2xl animate-move-alert-1">
                    <p className="text-white text-sm font-medium leading-snug">
                      Deal at risk: No activity in 7 days
                    </p>
                  </div>

                  <div className="absolute top-40 right-20 bg-blue-500 rounded-2xl rounded-br-none p-4 max-w-[180px] shadow-2xl animate-move-alert-2">
                    <p className="text-white text-sm font-medium leading-snug">
                      Send follow-up email
                    </p>
                  </div>

                  <div className="absolute top-56 left-10 bg-purple-500 rounded-2xl rounded-bl-none p-4 max-w-[240px] shadow-2xl animate-move-alert-3">
                    <p className="text-white text-sm font-medium leading-snug">
                      Negotiation stalled without response
                    </p>
                  </div>

                  <div className="absolute top-72 right-16 bg-blue-500 rounded-2xl rounded-br-none p-4 max-w-[200px] shadow-2xl animate-move-alert-4">
                    <p className="text-white text-sm font-medium leading-snug">
                      Nudge for response
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
        className="py-40 px-6 lg:px-8 relative overflow-hidden"
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
          <div className="mb-16">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
              Ready-made collaborative features.
            </h2>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-4xl">
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

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7 bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
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

            <div className="col-span-12 lg:col-span-5 bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
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

            <div className="col-span-12 md:col-span-4 lg:col-span-4">
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

            <div className="col-span-12 md:col-span-4 lg:col-span-4 bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
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

            <div className="col-span-12 md:col-span-4 lg:col-span-4 bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
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

            <div className="col-span-12 md:col-span-6 lg:col-span-6 bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
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

            <div className="col-span-12 md:col-span-6 lg:col-span-6 bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                Deal Analytics
              </h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Deep insights to understand patterns, predict outcomes, and
                optimize strategy.
              </p>
              <div className="bg-[#0f0f0f] rounded-lg p-4 border border-white/5">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Deal Health</span>
                      <span>85%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Win Probability</span>
                      <span>72%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        style={{ width: "72%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Activity Score</span>
                      <span>45%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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
        className="py-20 px-6 lg:px-8 relative overflow-hidden"
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

          <div className="mb-16">
            <h2
              className="text-8xl md:text-[10rem] lg:text-[14rem] font-black leading-none"
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

          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-16">
            <div style={{ width: "320px" }}>
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
              className="relative overflow-hidden"
              style={{
                width: "580px",
                height: "180px",
                borderRadius: "90px",
                border: "8px solid #a3e635",
                backgroundColor: "#000",
              }}
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

              <div className="absolute inset-0 flex items-center justify-center gap-4 px-12">
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

          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-16">
            <div
              className="relative overflow-hidden"
              style={{
                width: "480px",
                height: "220px",
                borderRadius: "110px",
                backgroundColor: "#a855f7",
              }}
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
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  width: "380px",
                  height: "120px",
                  borderRadius: "60px",
                  backgroundColor: "#000",
                }}
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
                <div className="flex items-center gap-6 relative z-10">
                  <div className="flex flex-col items-center">
                    <span className="text-red-400 text-3xl font-bold">85%</span>
                    <span className="text-white/50 text-xs">Risk Score</span>
                  </div>
                  <div className="w-px h-12 bg-white/20"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-yellow-400 text-3xl font-bold">
                      7d
                    </span>
                    <span className="text-white/50 text-xs">No Activity</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ width: "320px" }} className="text-right">
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
            <div style={{ width: "320px" }}>
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
              className="relative overflow-hidden"
              style={{
                width: "480px",
                height: "220px",
                borderRadius: "110px",
                border: "8px solid #c9b896",
                backgroundColor: "#000",
              }}
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
                className="absolute bg-[#1a1a1a] rounded-lg shadow-2xl"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  padding: "16px 20px",
                  width: "240px",
                }}
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
        className="py-20 lg:py-32 px-6 lg:px-12 relative overflow-hidden"
        style={{
          backgroundColor: "#000000",
        }}
      >
        <div className="relative z-10 max-w-5xl mx-auto">
          <PricingToggle>
            <div className="text-center mb-14">
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-6 leading-tight tracking-tight"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                }}
              >
                Choose The Perfect Plan
                <br />
                That Fits Your Revenue Team
              </h2>
              <p className="text-white/60 text-sm max-w-xl mx-auto mb-10 leading-relaxed">
                Whether you&apos;re a solo sales rep or a large revenue
                organization, Revenue Sentinel offers flexible pricing plans to
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

      <footer className="border-t border-white/10 bg-black py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RS</span>
                </div>
                <span className="text-white font-bold text-xl">
                  Revenue Sentinel
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Never lose a deal to silent decay. Real-time risk detection for
                modern revenue teams.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-5 h-5 text-white/70"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-5 h-5 text-white/70"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                  aria-label="GitHub"
                >
                  <svg
                    className="w-5 h-5 text-white/70"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#features"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/60 text-sm">
                © {new Date().getFullYear()} Revenue Sentinel. All rights
                reserved.
              </p>
              <div className="flex gap-6 text-white/60 text-sm">
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
