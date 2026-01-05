import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButtonWrapper } from "@/components/sign-in-button";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <nav className="fixed top-0 z-50 w-full bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button className="px-4 py-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                <span className="text-black font-semibold text-sm">
                  Revenue Sentinel
                </span>
              </button>
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="#features"
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="#blog"
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href="#faq"
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                Login
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  Get started
                  <svg
                    className="w-4 h-4"
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
                <div className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 cursor-pointer">
                  <SignInButtonWrapper />
                  <svg
                    className="w-4 h-4"
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
        </div>
      </nav>

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
                dying—and what to do about it. See why the most innovative sales
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

                  <g className="animate-marble-1 animate-glow">
                    <circle
                      cx="360"
                      cy="56"
                      r="11"
                      fill="url(#silverBall)"
                      opacity="1"
                      filter="url(#strongGlow)"
                    />
                    <circle
                      cx="360"
                      cy="56"
                      r="8"
                      fill="#ffffff"
                      opacity="0.6"
                    />
                  </g>
                  <g
                    className="animate-marble-2 animate-glow"
                    style={{ animationDelay: "1.5s" }}
                  >
                    <circle
                      cx="430"
                      cy="56"
                      r="11"
                      fill="url(#silverBall)"
                      opacity="1"
                      filter="url(#strongGlow)"
                    />
                    <circle
                      cx="430"
                      cy="56"
                      r="8"
                      fill="#ffffff"
                      opacity="0.6"
                    />
                  </g>

                  <circle
                    r="10"
                    fill="url(#silverBall)"
                    opacity="1"
                    filter="url(#strongGlow)"
                    className="animate-pulse-glow"
                  >
                    <animateMotion
                      dur="4s"
                      repeatCount="indefinite"
                      path="M 130 120 Q 200 160, 240 200 Q 260 230, 270 260"
                    />
                  </circle>
                  <circle
                    r="6"
                    fill="url(#silverBall)"
                    opacity="0.5"
                    filter="url(#glow)"
                  >
                    <animateMotion
                      dur="4s"
                      repeatCount="indefinite"
                      begin="0.2s"
                      path="M 130 120 Q 200 160, 240 200 Q 260 230, 270 260"
                    />
                  </circle>

                  <circle
                    r="9"
                    fill="url(#silverBall)"
                    opacity="1"
                    filter="url(#strongGlow)"
                    className="animate-pulse-glow"
                  >
                    <animateMotion
                      dur="2.5s"
                      repeatCount="indefinite"
                      begin="1.2s"
                      path="M 270 260 Q 280 285, 290 310"
                    />
                  </circle>

                  <circle
                    r="11"
                    fill="url(#silverBall)"
                    opacity="1"
                    filter="url(#strongGlow)"
                    className="animate-pulse-glow"
                  >
                    <animateMotion
                      dur="3.5s"
                      repeatCount="indefinite"
                      begin="0.8s"
                      path="M 360 180 Q 420 200, 450 230 Q 420 260, 360 280"
                    />
                  </circle>

                  <circle
                    r="9"
                    fill="url(#silverBall)"
                    opacity="1"
                    filter="url(#strongGlow)"
                    className="animate-pulse-glow"
                  >
                    <animateMotion
                      dur="3s"
                      repeatCount="indefinite"
                      begin="2s"
                      path="M 290 310 Q 330 335, 360 360"
                    />
                  </circle>

                  <circle
                    r="10"
                    fill="url(#silverBall)"
                    opacity="1"
                    filter="url(#strongGlow)"
                    className="animate-pulse-glow"
                  >
                    <animateMotion
                      dur="5s"
                      repeatCount="indefinite"
                      begin="1.5s"
                      path="M 360 360 Q 400 385, 430 410 Q 445 430, 455 450 Q 465 470, 470 490"
                    />
                  </circle>

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

                  <circle
                    r="10"
                    fill="url(#silverBall)"
                    opacity="1"
                    filter="url(#strongGlow)"
                    className="animate-pulse-glow"
                  >
                    <animateMotion
                      dur="4s"
                      repeatCount="indefinite"
                      begin="2.5s"
                      path="M 400 380 Q 450 430, 470 480 Q 475 510, 470 540 L 490 560"
                    />
                  </circle>

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
                  <div className="absolute top-24 left-12 bg-purple-500 rounded-2xl rounded-bl-none p-4 max-w-[220px] shadow-2xl">
                    <p className="text-white text-sm font-medium leading-snug">
                      Deal at risk: No activity in 7 days
                    </p>
                  </div>

                  <div className="absolute top-40 right-20 bg-blue-500 rounded-2xl rounded-br-none p-4 max-w-[180px] shadow-2xl">
                    <p className="text-white text-sm font-medium leading-snug">
                      Send follow-up email
                    </p>
                  </div>

                  <div className="absolute top-56 left-10 bg-purple-500 rounded-2xl rounded-bl-none p-4 max-w-[240px] shadow-2xl">
                    <p className="text-white text-sm font-medium leading-snug">
                      Negotiation stalled without response
                    </p>
                  </div>

                  <div className="absolute top-72 right-16 bg-blue-500 rounded-2xl rounded-br-none p-4 max-w-[200px] shadow-2xl">
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

      <section className="py-16 px-6 lg:px-8 bg-gray-900/60 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Testimonial */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full shrink-0 flex items-center justify-center">
                <span className="text-white/60 text-xs">RS</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white mb-1">
                  &quot;Game Changer&quot;
                </p>
                <p className="text-white/60 text-sm">
                  Sales Leader, Enterprise Team
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
              <div className="text-white/80 font-semibold text-sm">
                Real-Time Alerts
              </div>
              <div className="text-white/80 font-semibold text-sm">
                Action Recommendations
              </div>
              <div className="text-white/80 font-semibold text-sm">
                Risk Detection
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="py-32 px-6 lg:px-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm text-blue-400 mb-4 uppercase tracking-wider font-semibold">
              Features
            </p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Still Using Basic CRMs? You&apos;re Missing Out
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Everything You Need. Everything You Didn&apos;t Know You Needed.
            </p>
          </div>

          <div className="relative">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Real-time risk alerts tell you exactly which deals need
                  attention—before it&apos;s too late.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Intelligent action recommendations tell you what to do next—no
                  guessing, no missed opportunities.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  Automated activity tracking detects silence and inactivity—so
                  you never lose a deal to decay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="py-32 px-6 lg:px-8 bg-gray-900/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
            <svg viewBox="0 0 400 400" className="w-full h-full opacity-20">
              <circle
                cx="200"
                cy="200"
                r="150"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                opacity="0.3"
              />
              <circle
                cx="200"
                cy="200"
                r="100"
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                opacity="0.3"
              />
              <circle cx="200" cy="200" r="50" fill="#fbbf24" opacity="0.2" />
              <circle cx="120" cy="120" r="30" fill="#3b82f6" opacity="0.3" />
              <circle cx="280" cy="280" r="30" fill="#f97316" opacity="0.3" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm text-blue-400 mb-4 uppercase tracking-wider font-semibold">
              Why Revenue Sentinel
            </p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Real-Time Risk Detection Means More Deals Closed
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 relative hover:bg-white/10 transition-all">
              <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full"></div>
              <div className="text-6xl font-bold text-white mb-4">0</div>
              <p className="text-white/70 text-lg leading-relaxed">
                Deals lost to silent decay when you catch risk early
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 relative hover:bg-white/10 transition-all">
              <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="text-6xl font-bold text-white mb-4">24/7</div>
              <p className="text-white/70 text-lg leading-relaxed">
                Continuous monitoring of deal health and activity status
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 relative hover:bg-white/10 transition-all">
              <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="text-6xl font-bold text-white mb-4">100%</div>
              <p className="text-white/70 text-lg leading-relaxed">
                Actionable recommendations for every at-risk deal
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors"
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
              <div className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors cursor-pointer">
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
      </section>

      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-blue-400 mb-4 uppercase tracking-wider font-semibold">
              How It Works
            </p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Action-First Deal Management
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              See exactly which deals need attention and what to do about
              them—before it&apos;s too late
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-blue-500/20 backdrop-blur-xl rounded-2xl p-12 border border-blue-500/30">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Track Deal Activity
                    </h3>
                    <p className="text-white/80">
                      Monitor emails, meetings, calls, and notes in real-time
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Detect Risk Automatically
                    </h3>
                    <p className="text-white/80">
                      Get instant alerts when deals show signs of stalling or
                      inactivity
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Take Action
                    </h3>
                    <p className="text-white/80">
                      Follow recommended actions to save deals and close more
                      revenue
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Getting Started is Easy and Fast
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            See why the most innovative revenue teams choose Revenue Sentinel
            for deal risk detection.
          </p>
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors"
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
            <div className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors cursor-pointer">
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
      </section>

      <footer className="border-t border-white/10 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <button className="px-4 py-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
              <span className="text-black font-semibold text-sm">
                Revenue Sentinel
              </span>
            </button>
            <div className="flex gap-8 text-white/60 text-sm">
              <Link
                href="#features"
                className="hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link href="#blog" className="hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="#faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
