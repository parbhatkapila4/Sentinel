"use client";

import { usePricing } from "./pricing-toggle";

export function PricingCards() {
  const { isAnnual } = usePricing();

  const freeFeatures = [
    "Get 3 credits daily",
    "Free Job AI access",
    "Free InterviewGPT access",
    "Free Resume AI access",
    "Free Cover Letter Generator access",
    "Limited Weekly AI insights",
    "Limited company bank access",
  ];

  const proFeatures = [
    { text: "Unlimited credits", included: true },
    { text: "Access to all questions (20k+)", included: true },
    { text: "Full access to company tags", included: true },
    { text: "Full access to company question banks", included: true },
    { text: "AI enhanced responses", included: false },
    { text: "Full Interview GPT access", included: true },
    { text: "Enhanced Weekly AI insights", included: true },
  ];

  const customFeatures = [
    "Customized interview modules.",
    "Customized performance tracker.",
    "Customized response feedback.",
    "Customized AI weekly insights.",
  ];

  const getProPrice = () => {
    return isAnnual ? "$0.99" : "$1.99";
  };

  const getProOriginalPrice = () => {
    return isAnnual ? "$3.99" : "$7.99";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
      <div
        className="rounded-3xl p-7 flex flex-col"
        style={{
          background: "linear-gradient(145deg, #1a2744 0%, #0f1a2e 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <h3 className="text-white font-medium text-2xl mb-4 italic">Free</h3>

        <p className="text-white/50 text-sm mb-6 leading-relaxed">
          Perfect for testing out our platform and practicing basic interview
          questions to see if it&apos;s the right fit for you.
        </p>

        <div className="flex items-baseline gap-1 mb-8">
          <span className="text-white font-bold text-5xl">$0</span>
          <span className="text-white/40 text-sm">/month</span>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-white/30 text-xs">What&apos;s Included?</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {freeFeatures.map((feature, idx) => (
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
          Get a consultation
        </button>
      </div>

      <div
        className="relative rounded-3xl p-[2px] flex flex-col"
        style={{
          background: "linear-gradient(180deg, #7c8dea 0%, #a78bfa 100%)",
        }}
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5b6fd6] text-white text-xs font-medium px-4 py-1.5 rounded-full z-10 whitespace-nowrap">
          Most popular
        </div>

        <div
          className="rounded-3xl p-7 h-full flex flex-col"
          style={{
            background:
              "linear-gradient(145deg, rgba(120, 140, 200, 0.3) 0%, rgba(100, 120, 180, 0.2) 50%, rgba(30, 45, 80, 0.95) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          <h3 className="text-white font-medium text-2xl mb-4 italic">Pro</h3>

          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            Ideal for active job seekers. Access a wide range of questions and
            receive detailed feedback on each response to refine your
            performance.
          </p>

          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-white/40 line-through text-base">
              {getProOriginalPrice()}
            </span>
            <span className="text-white font-bold text-5xl">
              {getProPrice()}
            </span>
            <span className="text-white/40 text-sm">/week.</span>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/15"></div>
            <span className="text-white/40 text-xs">What&apos;s Included?</span>
            <div className="flex-1 h-px bg-white/15"></div>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {proFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <svg
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    feature.included ? "text-[#6b7fd6]" : "text-white/30"
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
            Get a consultation
          </button>
        </div>
      </div>

      <div
        className="rounded-3xl p-7 flex flex-col"
        style={{
          background: "linear-gradient(145deg, #1a2744 0%, #0f1a2e 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <h3 className="text-white font-medium text-2xl mb-4">Custom Plan</h3>

        <p className="text-white/50 text-sm mb-6 leading-relaxed">
          Perfect for groups & teachers.
        </p>

        <div className="mb-8">
          <span className="text-white font-bold text-2xl">Request a quote</span>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-white/30 text-xs">What&apos;s Included?</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {customFeatures.map((feature, idx) => (
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
          Get a consultation
        </button>
      </div>
    </div>
  );
}
