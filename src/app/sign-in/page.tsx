"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SignInContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const afterSignInUrl = token ? `/invite/${token}` : "/dashboard";
  useEffect(() => {
    const makeAppleLogoWhite = () => {
      const appleButton = document.querySelector(
        'button[data-social-provider="oauth_apple"], button[aria-label*="Apple"], button[aria-label*="apple"]'
      ) as HTMLElement | null;

      if (appleButton) {
        const svgs = appleButton.querySelectorAll("svg");
        svgs.forEach((svg) => {
          svg.style.filter = "brightness(0) invert(1)";
          svg.style.setProperty("filter", "brightness(0) invert(1)", "important");

          const paths = svg.querySelectorAll("path");
          paths.forEach((path) => {
            path.setAttribute("fill", "#ffffff");
            path.setAttribute("stroke", "#ffffff");
            path.style.fill = "#ffffff";
            path.style.stroke = "#ffffff";
            path.style.setProperty("fill", "#ffffff", "important");
            path.style.setProperty("stroke", "#ffffff", "important");
          });

          const allElements = svg.querySelectorAll("*");
          allElements.forEach((el) => {
            (el as HTMLElement).style.fill = "#ffffff";
            (el as HTMLElement).style.stroke = "#ffffff";
            (el as HTMLElement).style.setProperty("fill", "#ffffff", "important");
            (el as HTMLElement).style.setProperty("stroke", "#ffffff", "important");
          });
        });

        const iconContainer = appleButton.querySelector(
          '[class*="icon"], [class*="Icon"], [class*="logo"], [class*="Logo"]'
        ) as HTMLElement | null;
        if (iconContainer) {
          iconContainer.style.filter = "brightness(0) invert(1)";
          iconContainer.style.setProperty("filter", "brightness(0) invert(1)", "important");
        }
      }
    };

    makeAppleLogoWhite();

    const observer = new MutationObserver(() => {
      makeAppleLogoWhite();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const timeout = setTimeout(() => {
      makeAppleLogoWhite();
    }, 500);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);
  return (
    <div className="min-h-screen w-full flex bg-[#030303]">
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#050508]" />

        <div
          className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-[-30%] left-[-20%] w-[900px] h-[900px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 60%)",
            filter: "blur(40px)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
          <div
            className="w-full max-w-[600px]"
            style={{ perspective: "1000px" }}
          >
            <div className="absolute top-12 left-12 flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    boxShadow:
                      "0 8px 32px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  <span className="text-white text-sm font-bold">RS</span>
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-blue-500/20 blur-xl -z-10" />
              </div>
              <div>
                <span className="text-white font-semibold text-base tracking-tight">
                  Sentinel
                </span>
                <span className="block text-[10px] text-white/40 font-medium tracking-wider">
                  INTELLIGENCE PLATFORM
                </span>
              </div>
            </div>

            <div
              className="relative rounded-3xl p-8 mb-6 transform hover:scale-[1.01] transition-transform duration-500"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: `
                  0 0 0 1px rgba(255,255,255,0.03),
                  0 20px 50px -20px rgba(0,0,0,0.5),
                  0 0 100px -50px rgba(59,130,246,0.2)
                `,
                backdropFilter: "blur(40px)",
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.15em]">
                      Total Revenue
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Live
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span
                      className="text-5xl font-bold text-white tracking-tight"
                      style={{ fontFeatureSettings: "'tnum'" }}
                    >
                      $2.4<span className="text-3xl text-white/60">M</span>
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <svg
                        className="w-3.5 h-3.5 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-emerald-400">
                        24.5%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                    <svg
                      className="w-4 h-4 text-white/60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="relative h-40 mb-6">
                <svg
                  viewBox="0 0 500 120"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="areaGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop
                        offset="50%"
                        stopColor="#3b82f6"
                        stopOpacity="0.1"
                      />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="lineGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <line
                    x1="0"
                    y1="30"
                    x2="500"
                    y2="30"
                    stroke="rgba(255,255,255,0.03)"
                    strokeDasharray="4,4"
                  />
                  <line
                    x1="0"
                    y1="60"
                    x2="500"
                    y2="60"
                    stroke="rgba(255,255,255,0.03)"
                    strokeDasharray="4,4"
                  />
                  <line
                    x1="0"
                    y1="90"
                    x2="500"
                    y2="90"
                    stroke="rgba(255,255,255,0.03)"
                    strokeDasharray="4,4"
                  />

                  <path
                    d="M0,100 C40,95 80,90 120,82 C160,74 200,85 240,65 C280,45 320,35 360,40 C400,45 440,30 500,20 L500,120 L0,120 Z"
                    fill="url(#areaGradient)"
                  />

                  <path
                    d="M0,100 C40,95 80,90 120,82 C160,74 200,85 240,65 C280,45 320,35 360,40 C400,45 440,30 500,20"
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />

                  <circle
                    cx="500"
                    cy="20"
                    r="6"
                    fill="#3b82f6"
                    filter="url(#glow)"
                  >
                    <animate
                      attributeName="r"
                      values="6;8;6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="500" cy="20" r="3" fill="white" />
                </svg>

                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-white/30 font-medium">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Active Deals",
                    value: "47",
                    trend: "+12",
                    color: "blue",
                  },
                  {
                    label: "Win Rate",
                    value: "68%",
                    trend: "+8%",
                    color: "emerald",
                  },
                  { label: "At Risk", value: "3", trend: "-2", color: "red" },
                ].map((metric, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-1">
                      {metric.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {metric.value}
                      </span>
                      <span
                        className={`text-xs font-semibold ${metric.color === "red"
                          ? "text-emerald-400"
                          : metric.color === "emerald"
                            ? "text-emerald-400"
                            : "text-blue-400"
                          }`}
                      >
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                className="rounded-2xl p-5 transform hover:scale-[1.02] transition-transform duration-300"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxShadow: "0 10px 40px -20px rgba(0,0,0,0.3)",
                }}
              >
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em] mb-4">
                  Deal Pipeline
                </p>
                <div className="flex items-end gap-2 h-20 mb-3">
                  {[
                    { h: 100, color: "from-blue-500 to-blue-600", label: "12" },
                    {
                      h: 75,
                      color: "from-violet-500 to-violet-600",
                      label: "8",
                    },
                    { h: 50, color: "from-amber-500 to-amber-600", label: "5" },
                    {
                      h: 35,
                      color: "from-emerald-500 to-emerald-600",
                      label: "3",
                    },
                  ].map((bar, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-xs font-bold text-white/80">
                        {bar.label}
                      </span>
                      <div
                        className={`w-full rounded-lg bg-gradient-to-t ${bar.color}`}
                        style={{
                          height: `${bar.h}%`,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-white/30 font-medium">
                  <span>New</span>
                  <span>Qualify</span>
                  <span>Propose</span>
                  <span>Close</span>
                </div>
              </div>

              <div
                className="rounded-2xl p-5 relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.02) 100%)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  boxShadow: "0 10px 40px -20px rgba(239,68,68,0.2)",
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em]">
                      Risk Alert
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-white mb-1">
                    3 deals need attention
                  </p>
                  <p className="text-xs text-white/40">$420K revenue at risk</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-red-400 font-medium">
                      Action required
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-white/30 text-sm">
                Trusted by <span className="text-white/60 font-medium"></span>{" "}
                revenue teams worldwide
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[42%] flex flex-col min-h-screen relative">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #0a0a0b 0%, #050505 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex justify-end items-center p-8">
            <p className="text-sm text-white/30 flex items-center gap-2">
              <span>New here?</span>
              <Link
                href="/sign-up"
                className="text-white font-medium hover:text-blue-400 transition-colors"
              >
                Create account →
              </Link>
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 max-w-[420px] mx-auto w-full">
            <div className="mb-6 text-center ml-24">
              <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
                Welcome!
              </h1>
              <p className="text-white/40 text-base">
                Sign in to continue to your dashboard
              </p>
            </div>

            <div className="clerk-sign-in-wrapper -ml-2">
              <style dangerouslySetInnerHTML={{
                __html: `
                .clerk-sign-in-wrapper button[data-social-provider] *,
                .clerk-sign-in-wrapper button[class*="social"] *,
                .clerk-sign-in-wrapper [class*="socialButton"] *,
                .clerk-sign-in-wrapper button span,
                .clerk-sign-in-wrapper button p,
                .clerk-sign-in-wrapper button div:not([class*="icon"]):not([class*="logo"]) {
                  color: #ffffff !important;
                }
                /* Target icon container in Apple button */
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] > *:first-child,
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] [class*="icon"],
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] [class*="Icon"],
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] [class*="logo"],
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] [class*="Logo"],
                .clerk-sign-in-wrapper button[aria-label*="Apple"] > *:first-child,
                .clerk-sign-in-wrapper button[aria-label*="Apple"] [class*="icon"],
                .clerk-sign-in-wrapper button[aria-label*="Apple"] [class*="Icon"],
                .clerk-sign-in-wrapper button[aria-label*="Apple"] [class*="logo"],
                .clerk-sign-in-wrapper button[aria-label*="Apple"] [class*="Logo"] {
                  filter: brightness(0) invert(1) !important;
                }
                /* Nuclear option - target any element that contains an SVG in Apple button */
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] > svg:first-child,
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] > *:first-child svg,
                .clerk-sign-in-wrapper button[aria-label*="Apple"] > svg:first-child,
                .clerk-sign-in-wrapper button[aria-label*="Apple"] > *:first-child svg {
                  filter: brightness(0) invert(1) !important;
                }
                /* Target all SVGs in Apple button - apply filter */
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] svg,
                .clerk-sign-in-wrapper button[aria-label*="Apple"] svg,
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] svg *,
                .clerk-sign-in-wrapper button[aria-label*="Apple"] svg *,
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] svg path,
                .clerk-sign-in-wrapper button[aria-label*="Apple"] svg path,
                .clerk-sign-in-wrapper [data-social-provider="oauth_apple"] svg,
                .clerk-sign-in-wrapper [data-social-provider="oauth_apple"] svg *,
                .clerk-sign-in-wrapper [data-social-provider="oauth_apple"] svg path,
                .clerk-sign-in-wrapper button:has([data-social-provider="oauth_apple"]) svg,
                .clerk-sign-in-wrapper button:has([data-social-provider="oauth_apple"]) svg *,
                .clerk-sign-in-wrapper button:has([data-social-provider="oauth_apple"]) svg path {
                  fill: #ffffff !important;
                  stroke: #ffffff !important;
                  color: #ffffff !important;
                  filter: brightness(0) invert(1) !important;
                }
                /* Target any SVG with black fill */
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] svg[fill="currentColor"],
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] svg[fill="black"],
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] svg[fill="#000"],
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] svg[fill="#000000"],
                .clerk-sign-in-wrapper button svg[fill="currentColor"],
                .clerk-sign-in-wrapper button svg[fill="black"],
                .clerk-sign-in-wrapper button svg[fill="#000"],
                .clerk-sign-in-wrapper button svg[fill="#000000"] {
                  fill: #ffffff !important;
                  filter: brightness(0) invert(1) !important;
                }
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] svg path[fill="currentColor"],
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] svg path[fill="black"],
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] svg path[fill="#000"],
                .clerk-sign-in-wrapper button[data-social-provider="oauth_apple"] svg path[fill="#000000"],
                .clerk-sign-in-wrapper button svg path[fill="currentColor"],
                .clerk-sign-in-wrapper button svg path[fill="black"],
                .clerk-sign-in-wrapper button svg path[fill="#000"],
                .clerk-sign-in-wrapper button svg path[fill="#000000"] {
                  fill: #ffffff !important;
                  filter: brightness(0) invert(1) !important;
                }
                .clerk-sign-in-wrapper [class*="footer"],
                .clerk-sign-in-wrapper [class*="clerkBranding"],
                .clerk-sign-in-wrapper [data-clerk-element="footer"],
                .clerk-sign-in-wrapper [class*="clerkFooter"],
                .clerk-sign-in-wrapper [class*="clerkFooterText"] {
                  display: none !important;
                }
              `}} />
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "mx-auto w-full",
                    card: "bg-transparent shadow-none border-none p-0",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    formButtonPrimary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg",
                    formFieldInput: "bg-white/5 border-white/10 text-white placeholder-white/20 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500/30",
                    formFieldLabel: "text-xs font-semibold text-white/50 uppercase tracking-wider mb-3",
                    dividerLine: "bg-white/10",
                    dividerText: "text-white/30 text-xs font-medium uppercase tracking-wider",
                    socialButtonsBlockButton: "bg-white/5 border-white/10 text-white rounded-2xl py-4 hover:bg-white/10 transition-all duration-300",
                    socialButtonsBlockButtonText: "text-white text-sm font-medium",
                    footerActionLink: "text-white/50 hover:text-white transition-colors underline underline-offset-2",
                    footerActionText: "text-white/30 text-xs hidden",
                    footer: "hidden",
                    clerkBranding: "hidden",
                    formFieldInputShowPasswordButton: "text-white/40 hover:text-white/60",
                    formButtonReset: "text-white/50 hover:text-white",
                    formResendCodeLink: "text-white/50 hover:text-white",
                    otpCodeFieldInput: "bg-white/5 border-white/10 text-white rounded-2xl",
                  },
                  variables: {
                    colorBackground: "transparent",
                    colorInputBackground: "rgba(255,255,255,0.03)",
                    colorInputText: "#ffffff",
                    colorText: "#ffffff",
                    colorTextSecondary: "#ffffff",
                    colorPrimary: "#3b82f6",
                    colorDanger: "#ef4444",
                    borderRadius: "1rem",
                  },
                }}
                routing="hash"
                signUpUrl={token ? `/sign-up?email=${encodeURIComponent(email || "")}&token=${encodeURIComponent(token)}` : "/sign-up"}
                afterSignInUrl={afterSignInUrl}
                initialValues={email ? { emailAddress: email } : undefined}
              />
            </div>
          </div>

          <div className="p-8 -mt-4 ml-[20rem]">
            <p className="text-white/20 text-xs text-left font-medium tracking-wide">
              © 2026 Sentinel. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#030303]">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
