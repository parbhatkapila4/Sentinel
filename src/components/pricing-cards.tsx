"use client";

import { usePricing } from "./pricing-toggle";

export function PricingCards() {
  const { isAnnual } = usePricing();

  const starterFeatures = [
    "Track up to 25 active deals",
    "Real-time risk detection",
    "Activity tracking (emails & meetings)",
    "Basic deal timeline & history",
    "Email notifications for at-risk deals",
    "7-day activity history",
  ];

  const proFeatures = [
    { text: "Track up to 500 active deals", included: true },
    { text: "Real-time risk detection & scoring", included: true },
    { text: "AI-powered action recommendations", included: true },
    { text: "Advanced activity tracking & analytics", included: true },
    { text: "Team collaboration & sharing", included: true },
    { text: "Unlimited activity history", included: true },
    { text: "Priority email support", included: true },
  ];

  const enterpriseFeatures = [
    "Unlimited active deals",
    "Custom risk detection models",
    "Advanced AI copilots & automation",
    "Custom integrations & API access",
    "Dedicated account manager",
    "Custom reporting & dashboards",
    "SLA guarantees & priority support",
    "On-premise deployment options",
  ];

  const getProPrice = () => {
    return isAnnual ? "$19" : "$29";
  };

  const getProOriginalPrice = () => {
    return isAnnual ? "$29" : "$29";
  };

  const getEnterprisePrice = () => {
    return isAnnual ? "$59" : "$79";
  };

  const getEnterpriseOriginalPrice = () => {
    return isAnnual ? "$79" : "$79";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
      <div
        className="rounded-3xl p-4 flex flex-col"
        style={{
          background: "linear-gradient(145deg, #1a2744 0%, #0f1a2e 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background:
              "linear-gradient(145deg, rgba(30, 45, 75, 0.6) 0%, rgba(20, 35, 60, 0.4) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <h3 className="text-white font-medium text-2xl mb-3 italic">
            Starter
          </h3>

          <p className="text-white/50 text-sm mb-5 leading-relaxed">
            Perfect for individual sales reps getting started with deal tracking
            and risk detection. Never lose a deal to silent decay.
          </p>

          <div className="flex items-baseline gap-1">
            <span className="text-white font-bold text-4xl">$0</span>
            <span className="text-white/40 text-sm">/month</span>
          </div>
        </div>

        <div className="px-2 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/30 text-xs">What&apos;s Included?</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <ul className="space-y-3 mb-6 flex-1">
            {starterFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-white/30 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-white/50 text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            className="w-full py-3.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            Get Started Free
          </button>
        </div>
      </div>

      <div
        className="relative rounded-3xl p-[2px] flex flex-col"
        style={{
          background: "linear-gradient(180deg, #7c8dea 0%, #a78bfa 100%)",
        }}
      >
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            padding: "6px 20px",
            borderRadius: "9999px",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
          }}
        >
          <span className="text-white text-xs font-semibold tracking-wide uppercase">
            Most popular
          </span>
        </div>

        <div
          className="rounded-3xl p-4 h-full flex flex-col"
          style={{
            background: "linear-gradient(145deg, #1a2744 0%, #0f1a2e 100%)",
          }}
        >
          <div
            className="relative rounded-2xl p-5 mb-4 overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, rgba(140, 160, 220, 0.35) 0%, rgba(120, 140, 200, 0.25) 50%, rgba(100, 120, 180, 0.15) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h3 className="text-white font-medium text-2xl mb-3 italic">
              Professional
            </h3>

            <p className="text-white/60 text-sm mb-5 leading-relaxed">
              Ideal for growing sales teams that need advanced risk detection,
              AI-powered recommendations, and team collaboration to close more
              deals.
            </p>

            <div className="flex items-baseline gap-2">
              {isAnnual && (
                <span className="text-white/40 line-through text-base">
                  {getProOriginalPrice()}
                </span>
              )}
              <span className="text-white font-bold text-4xl">
                {getProPrice()}
              </span>
              <span className="text-white/40 text-sm">/month</span>
            </div>
          </div>

          <div className="px-2 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/15"></div>
              <span className="text-white/40 text-xs">
                What&apos;s Included?
              </span>
              <div className="flex-1 h-px bg-white/15"></div>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              {proFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg
                    className={`w-5 h-5 shrink-0 mt-0.5 ${feature.included ? "text-[#6b7fd6]" : "text-white/30"
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-white/60 text-sm">{feature.text}</span>
                </li>
              ))}
            </ul>

            <button
              className="w-full py-3.5 rounded-xl text-sm font-medium text-white transition-colors"
              style={{
                background: "linear-gradient(135deg, #5b6fd6 0%, #7b8ce8 100%)",
              }}
            >
              Start 7-Day Free Trial
            </button>
          </div>
        </div>
      </div>

      <div
        className="rounded-3xl p-4 flex flex-col"
        style={{
          background: "linear-gradient(145deg, #1a2744 0%, #0f1a2e 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background:
              "linear-gradient(145deg, rgba(30, 45, 75, 0.6) 0%, rgba(20, 35, 60, 0.4) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <h3 className="text-white font-medium text-2xl mb-3">Enterprise</h3>

          <p className="text-white/50 text-sm mb-5 leading-relaxed">
            Complete solution for large revenue teams with unlimited scale,
            custom integrations, and dedicated support.
          </p>

          <div className="flex items-baseline gap-2">
            {isAnnual && (
              <span className="text-white/40 line-through text-base">
                {getEnterpriseOriginalPrice()}
              </span>
            )}
            <span className="text-white font-bold text-4xl">
              {getEnterprisePrice()}
            </span>
            <span className="text-white/40 text-sm">/month</span>
          </div>
        </div>

        <div className="px-2 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/30 text-xs">What&apos;s Included?</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <ul className="space-y-3 mb-6 flex-1">
            {enterpriseFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-white/30 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-white/50 text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            className="w-full py-3.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
