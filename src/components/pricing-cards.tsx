"use client";

import { usePricing } from "./pricing-toggle";

type Plan = {
  name: string;
  monthly: number;
  annual: number;
  description: string;
  included: string[];
  excluded: string[];
  buttonText: string;
  active?: boolean;
  monthlyOriginal?: number;
  popular?: boolean;
  savePercent?: number;
};

export function PricingCards() {
  const { isAnnual } = usePricing();

  const plans: {
    basic: Plan;
    pro: Plan;
    master: Plan;
  } = {
    basic: {
      name: "Starter",
      monthly: 49,
      annual: 490,
      description:
        "Perfect for individual sales reps and small teams getting started with deal tracking and risk detection",
      included: [
        "Track up to 50 active deals",
        "Real-time risk detection",
        "Activity tracking (emails & meetings)",
        "Basic action recommendations",
        "Deal timeline & history",
      ],
      excluded: [
        "Advanced risk analytics",
        "Team collaboration features",
        "API access & integrations",
        "Priority support",
      ],
      buttonText: "Get Started",
      active: false,
    },
    pro: {
      name: "Professional",
      monthly: 149,
      monthlyOriginal: 199,
      annual: 1490,
      description:
        "Ideal for growing sales teams that need advanced risk detection and team collaboration features",
      included: [
        "Track up to 500 active deals",
        "Real-time risk detection",
        "Activity tracking (emails & meetings)",
        "AI-powered action recommendations",
        "Deal timeline & history",
        "Team collaboration & sharing",
        "Advanced risk analytics",
        "Email & chat support",
      ],
      excluded: ["API access & integrations", "Priority support"],
      buttonText: "Start 7-days Free Trial",
      popular: true,
      savePercent: 25,
    },
    master: {
      name: "Enterprise",
      monthly: 499,
      annual: 4990,
      description:
        "Complete solution for large revenue teams with unlimited deals, custom integrations, and dedicated support",
      included: [
        "Unlimited active deals",
        "Real-time risk detection",
        "Activity tracking (emails & meetings)",
        "AI-powered action recommendations",
        "Deal timeline & history",
        "Team collaboration & sharing",
        "Advanced risk analytics",
        "API access & custom integrations",
        "Priority support & onboarding",
        "Custom reporting & dashboards",
      ],
      excluded: [],
      buttonText: "Contact Sales",
    },
  };

  const getPrice = (plan: Plan) => {
    if (isAnnual) {
      return Math.round(plan.annual / 12);
    }
    return plan.monthly;
  };

  const getBillingText = () => {
    return isAnnual ? "/month, annually" : "/month, annually";
  };

  const getYearlyText = (plan: Plan) => {
    if (isAnnual) {
      return `$${plan.annual} billed yearly`;
    }
    return null;
  };

  const getSavings = (plan: Plan) => {
    if (isAnnual) {
      const savings = plan.monthly * 12 - plan.annual;
      return savings > 0 ? savings : null;
    }
    return null;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6">
        <div className="relative bg-gradient-to-br from-gray-800/45 to-gray-900/35 backdrop-blur-md rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.025] to-transparent opacity-20 pointer-events-none"></div>

          <div className="relative flex flex-col grow">
            <h3
              className="text-gray-200 font-semibold text-xl mb-5"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {plans.basic.name}
            </h3>

            <div className="flex items-baseline flex-wrap gap-2 mb-4">
              <span
                className="text-white font-bold text-4xl"
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                ${getPrice(plans.basic)}
              </span>
              <span className="text-gray-400 text-sm">{getBillingText()}</span>
              {getSavings(plans.basic) !== null &&
                getSavings(plans.basic)! > 0 && (
                  <span className="bg-yellow-500/80 text-black text-xs font-medium px-2 py-0.5 rounded-full">
                    Save ${getSavings(plans.basic)}
                  </span>
                )}
            </div>
            {getYearlyText(plans.basic) && (
              <p className="text-gray-500 text-xs mb-2">
                {getYearlyText(plans.basic)}
              </p>
            )}

            <p className="text-gray-400 text-sm mb-7 leading-relaxed">
              {plans.basic.description}
            </p>

            <ul className="space-y-3.5 mb-8">
              {plans.basic.included.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
              {plans.basic.excluded.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600 shrink-0 mt-0.5"
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
                  <span className="text-gray-500 text-sm leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button className="w-full bg-black hover:bg-gray-900 text-white py-3 rounded-xl font-medium text-sm transition-colors border border-white/15 mt-auto">
              {plans.basic.buttonText}
            </button>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-gray-800/45 to-gray-900/35 backdrop-blur-md rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300 lg:scale-[1.01] flex flex-col">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.025] to-transparent opacity-20 pointer-events-none"></div>

          {plans.pro.popular && (
            <div className="absolute top-4 right-4 bg-white text-black text-xs font-medium px-2.5 py-1 rounded-full z-10">
              Popular
            </div>
          )}

          <div className="relative flex flex-col grow">
            <h3
              className="text-gray-200 font-semibold text-xl mb-5 mt-2"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {plans.pro.name}
            </h3>

            <div className="flex items-baseline flex-wrap gap-2 mb-4">
              {plans.pro.monthlyOriginal && !isAnnual && (
                <span className="text-gray-500 line-through text-2xl font-medium">
                  ${plans.pro.monthlyOriginal}
                </span>
              )}
              <span
                className="text-white font-bold text-4xl"
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                ${getPrice(plans.pro)}
              </span>
              <span className="text-gray-400 text-sm">{getBillingText()}</span>
              {getSavings(plans.pro) !== null && getSavings(plans.pro)! > 0 && (
                <span className="bg-yellow-500/80 text-black text-xs font-medium px-2 py-0.5 rounded-full">
                  Save ${getSavings(plans.pro)}
                </span>
              )}
              {!isAnnual && plans.pro.savePercent && (
                <span className="bg-yellow-500/80 text-black text-xs font-medium px-2 py-0.5 rounded-full">
                  Save {plans.pro.savePercent}%
                </span>
              )}
            </div>
            {getYearlyText(plans.pro) && (
              <p className="text-gray-500 text-xs mb-2">
                {getYearlyText(plans.pro)}
              </p>
            )}

            <p className="text-gray-400 text-sm mb-7 leading-relaxed">
              {plans.pro.description}
            </p>

            <ul className="space-y-3.5 mb-8">
              {plans.pro.included.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
              {plans.pro.excluded.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600 shrink-0 mt-0.5"
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
                  <span className="text-gray-500 text-sm leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button className="w-full bg-white hover:bg-gray-50 text-black py-3 rounded-xl font-medium text-sm transition-colors mt-auto">
              {plans.pro.buttonText}
            </button>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-gray-800/45 to-gray-900/35 backdrop-blur-md rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.025] to-transparent opacity-20 pointer-events-none"></div>

          <div className="relative flex flex-col grow">
            <h3
              className="text-gray-200 font-semibold text-xl mb-5"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {plans.master.name}
            </h3>

            <div className="flex items-baseline flex-wrap gap-2 mb-4">
              <span
                className="text-white font-bold text-4xl"
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                ${getPrice(plans.master)}
              </span>
              <span className="text-gray-400 text-sm">{getBillingText()}</span>
              {getSavings(plans.master) !== null &&
                getSavings(plans.master)! > 0 && (
                  <span className="bg-yellow-500/80 text-black text-xs font-medium px-2 py-0.5 rounded-full">
                    Save ${getSavings(plans.master)}
                  </span>
                )}
            </div>
            {getYearlyText(plans.master) && (
              <p className="text-gray-500 text-xs mb-2">
                {getYearlyText(plans.master)}
              </p>
            )}

            <p className="text-gray-400 text-sm mb-7 leading-relaxed">
              {plans.master.description}
            </p>

            <ul className="space-y-3.5 mb-8">
              {plans.master.included.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button className="w-full bg-[#39ff14]/90 hover:bg-[#39ff14] text-white py-3 rounded-xl font-medium text-sm transition-colors">
              {plans.master.buttonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
