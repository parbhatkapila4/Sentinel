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
        style={{
          backgroundColor: "#1a1a1a",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: "#00FF00" }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            style={{ gridTemplateRows: "auto auto auto" }}
          >
            <div
              className="md:col-span-3 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
              style={{
                backgroundColor: "#2a2a2a",
                minHeight: "140px",
              }}
            >
              <div className="flex items-start justify-between h-full">
                <div className="flex-1">
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                    COMMUNITY
                  </div>
                  <div className="text-gray-200 text-2xl font-bold">
                    Share here, there, and everywhere.
                  </div>
                </div>
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  <svg
                    className="w-5 h-5 text-white"
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
                </button>
              </div>
            </div>

            <div
              className="rounded-2xl p-8 shadow-2xl relative overflow-hidden"
              style={{
                backgroundColor: "#2a2a2a",
                background:
                  "linear-gradient(to bottom, #1a2a2a 0%, #2a2a2a 100%)",
                minHeight: "280px",
              }}
            >
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-4">
                MESSAGING
              </div>

              <div
                className="flex items-center justify-center mb-8"
                style={{ height: "120px" }}
              >
                <div style={{ color: "#1a1a1a" }}>
                  <svg
                    className="w-20 h-20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                    <circle cx="9" cy="10" r="1.5" />
                    <circle cx="15" cy="10" r="1.5" />
                    <circle cx="12" cy="13" r="1.5" />
                  </svg>
                </div>
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div className="text-white text-2xl font-bold">
                  Instant Talk
                </div>
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  <svg
                    className="w-5 h-5 text-white"
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
                </button>
              </div>
            </div>

            <div
              className="rounded-2xl p-8 shadow-2xl relative overflow-visible"
              style={{
                backgroundColor: "#2a2a2a",
                minHeight: "280px",
                position: "relative",
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-40"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(0, 255, 0, 0.3) 0%, rgba(0, 255, 0, 0) 70%)",
                }}
              ></div>

              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  border: "2px dashed #00FF00",
                  boxShadow:
                    "0 0 20px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.1)",
                  pointerEvents: "none",
                }}
              ></div>

              <div className="relative z-10">
                <div className="text-green-400 text-xs uppercase tracking-wider mb-4">
                  MAGIC POTS
                </div>

                <div className="absolute top-12 right-8 flex flex-col gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="#00FF00"
                    viewBox="0 0 24 24"
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(0, 255, 0, 0.8))",
                    }}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <svg
                    className="w-5 h-5"
                    fill="#00FF00"
                    viewBox="0 0 24 24"
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(0, 255, 0, 0.8))",
                    }}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <svg
                    className="w-4 h-4"
                    fill="#00FF00"
                    viewBox="0 0 24 24"
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(0, 255, 0, 0.8))",
                    }}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>

                <div className="mt-8">
                  <div className="text-white text-4xl font-bold mb-2">
                    Fine Details
                  </div>
                  <div className="text-gray-400 text-sm">
                    Features cards section concept details by Yasir Ekinci.
                  </div>
                </div>

                <div className="absolute bottom-8 right-8 flex items-center gap-3">
                  <div className="relative">
                    <svg
                      className="w-6 h-6"
                      fill="white"
                      viewBox="0 0 24 24"
                      style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }}
                    >
                      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                    </svg>
                  </div>

                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      border: "2px dashed #00FF00",
                      boxShadow: "0 0 15px rgba(0, 255, 0, 0.6)",
                      backgroundColor: "rgba(0, 255, 0, 0.1)",
                    }}
                  >
                    <svg
                      className="w-8 h-8 text-green-400"
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
                </div>

                <div
                  className="absolute bottom-16 right-4 bg-white rounded-lg p-2 shadow-lg"
                  style={{
                    border: "2px solid black",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  Hi!
                  <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white border-r-2 border-b-2 border-black transform rotate-45"></div>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-8 shadow-2xl relative overflow-hidden"
              style={{
                backgroundColor: "#2a2a2a",
                minHeight: "280px",
              }}
            >
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-4">
                TOP NOTCH SHOTS
              </div>

              <div
                className="flex items-center justify-center mb-8"
                style={{ height: "120px" }}
              >
                <div style={{ color: "#1a1a1a" }}>
                  <svg
                    className="w-20 h-20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.1-.75-.08-.21-.17-.31-.46-.24-.74C6.01 2.62 8.88 1.5 12.01 1.5c2.23 0 4.29.6 6.08 1.73.18.11.29.31.27.52-.02.21-.15.39-.35.47-.07.03-.15.04-.22.25zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.33-.47-.24-.75C3.74 7.19 4.97 4.87 6.84 3.19c.18-.16.46-.15.64.02.18.17.2.45.05.63C6.09 5.29 5.03 7.4 4.63 9.72c-.05.28-.3.48-.58.48-.03.01-.05.01-.08 0zm16.24-.19c-.05 0-.1-.01-.15-.03-.26-.1-.54.05-.64.31-.42 1.11-1.05 2.13-1.87 3.03-.19.21-.51.23-.73.04-.22-.19-.24-.51-.05-.73.73-.81 1.29-1.72 1.65-2.72.1-.26.36-.41.62-.31.26.1.41.36.31.62-.33.85-.82 1.64-1.44 2.35.19.21.51.23.73.05.21-.19.23-.51.05-.73-.73-.81-1.29-1.72-1.65-2.72-.1-.26.05-.54.31-.64.26-.1.54.05.64.31.42 1.11 1.05 2.13 1.87 3.03.19.21.23.51.04.73-.1.11-.25.17-.4.17zm-2.99 3.75c-.08 0-.16-.02-.23-.06-.26-.14-.58-.06-.75.17-1.37 1.85-3.49 2.95-5.87 2.95-1.36 0-2.65-.37-3.75-1.09-.22-.14-.5-.16-.73-.05-.23.11-.38.34-.38.6 0 .26.15.49.38.6 1.23.78 2.66 1.19 4.15 1.19 2.73 0 5.19-1.24 6.85-3.42.16-.22.18-.51.05-.75-.08-.12-.2-.19-.33-.24z" />
                  </svg>
                </div>
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div className="text-white text-2xl font-bold">
                  Encrypted Approach
                </div>
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  <svg
                    className="w-5 h-5 text-white"
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
                </button>
              </div>
            </div>

            <div
              className="md:col-span-3 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
              style={{
                backgroundColor: "#00FF00",
                minHeight: "120px",
              }}
            >
              <div className="flex items-center justify-between h-full">
                <div className="text-black text-2xl font-bold">
                  Explore Features
                </div>
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  <svg
                    className="w-5 h-5 text-white"
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
                </button>
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

      <section
        className="py-20 px-6 lg:px-8 relative overflow-hidden"
        style={{
          backgroundColor: "#1f1f1f",
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
              className="text-9xl md:text-[10rem] lg:text-[12rem] font-black leading-none"
              style={{
                color: "#4a4a4a",
                letterSpacing: "-0.02em",
                position: "relative",
                backgroundImage: `
                  repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px),
                  repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)
                `,
                backgroundSize: "6px 6px",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "#4a4a4a",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              HOWDOES
            </h2>
          </div>

          <div className="relative" style={{ minHeight: "850px" }}>
            <div
              className="absolute"
              style={{ top: "0px", left: "0px", width: "280px" }}
            >
              <svg className="w-5 h-5 mb-3" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.09 8.26L22 9.27L17 14.14L18.18 22.02L12 18.77L5.82 22.02L7 14.14L2 9.27L9.91 8.26L12 2Z"
                  fill="url(#starGrad1)"
                />
              </svg>

              <h3 className="text-white font-bold text-lg mb-3 leading-tight">
                Purchase of Governance token
              </h3>

              <p
                className="text-white text-sm leading-relaxed"
                style={{ lineHeight: "1.6" }}
              >
                Users purchase xyz tokens. The tokens give users the right to
                vote on proposals and to be eligible for certain rewards such as
                shares of the startup.
              </p>
            </div>

            <div className="absolute" style={{ top: "50px", left: "380px" }}>
              <div className="mb-6">
                <div
                  className="rounded-full bg-black flex items-center"
                  style={{
                    height: "50px",
                    width: "280px",
                    border: "4px solid #84cc16",
                    paddingLeft: "16px",
                  }}
                >
                  <div
                    className="rounded-full flex items-center justify-center shrink-0"
                    style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: "#1a1a1a",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <span className="text-white text-xs font-medium">xyz</span>
                  </div>
                  <span
                    className="ml-3 text-white text-xs"
                    style={{ opacity: 0.8 }}
                  >
                    pher
                  </span>
                </div>
              </div>

              <div>
                <div
                  className="rounded-full bg-black flex items-center justify-center"
                  style={{
                    height: "65px",
                    width: "320px",
                    border: "4px solid #a855f7",
                  }}
                >
                  <span
                    className="text-white text-2xl font-bold"
                    style={{ letterSpacing: "0.2em" }}
                  >
                    x y z
                  </span>
                </div>
              </div>
            </div>

            <div
              className="absolute text-right"
              style={{ top: "240px", right: "0px", width: "320px" }}
            >
              <div className="flex justify-end mb-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L14.09 8.26L22 9.27L17 14.14L18.18 22.02L12 18.77L5.82 22.02L7 14.14L2 9.27L9.91 8.26L12 2Z"
                    fill="url(#starGrad2)"
                  />
                </svg>
              </div>

              <h3 className="text-white font-bold text-lg mb-3 leading-tight">
                Closure of Purchase
              </h3>

              <p
                className="text-white text-sm leading-relaxed"
                style={{ lineHeight: "1.6" }}
              >
                The purchase of tokens is closed and the list of top holders is
                determined based on the number of tokens they hold.
              </p>
            </div>

            <div
              className="absolute"
              style={{ bottom: "80px", left: "0px", width: "300px" }}
            >
              <svg className="w-5 h-5 mb-3" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.09 8.26L22 9.27L17 14.14L18.18 22.02L12 18.77L5.82 22.02L7 14.14L2 9.27L9.91 8.26L12 2Z"
                  fill="url(#starGrad3)"
                />
              </svg>

              <h3 className="text-white font-bold text-lg mb-3 leading-tight">
                Submission of Proposals
              </h3>

              <p
                className="text-white text-sm leading-relaxed mb-0"
                style={{ lineHeight: "1.6" }}
              >
                Top holders and other token holders can submit proposals for new
                projects.
              </p>
            </div>

            <div className="absolute" style={{ bottom: "40px", left: "380px" }}>
              <div
                className="rounded-full bg-black relative"
                style={{
                  height: "80px",
                  width: "380px",
                  border: "4px solid #d4a574",
                }}
              >
                <div
                  className="absolute rounded shadow-2xl"
                  style={{
                    left: "16px",
                    top: "12px",
                    backgroundColor: "#2a2a2a",
                    borderTop: "4px solid #fbbf24",
                    padding: "10px 14px",
                    width: "190px",
                    borderRadius: "4px",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-white text-xs font-medium">
                        Submit your proposal
                      </span>
                    </div>
                    <svg
                      className="w-3.5 h-3.5 text-white cursor-pointer"
                      style={{ opacity: 0.6 }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
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
