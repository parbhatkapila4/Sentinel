import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { PricingCards } from "@/components/pricing-cards";
import { PricingToggle, PricingToggleDisplay } from "@/components/pricing-toggle";

export default async function PricingPage() {
  const user = await getAuthenticatedUser();

  return (
    <PricingToggle>
      <div className="min-h-screen bg-black text-white">
        <div className="border-b border-white/10 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors -ml-76"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </Link>
          </div>
        </div>

        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pricing
            </h1>
            <p className="text-lg text-white/60 leading-relaxed">
              Transparent, fair pricing designed to grow with your revenue team.
              Start free and scale as you need more features and support.
            </p>
          </div>
        </section>

        <section className="px-6 lg:px-8 pt-8 pb-16">
          <div className="max-w-4xl mx-auto space-y-20">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Why We Charge
              </h2>
              <p className="text-white/70 mb-6 leading-relaxed">
                Building and maintaining a world-class deal management platform
                requires significant investment in infrastructure, security,
                development, and support. Our pricing reflects the value we
                provide while ensuring we can continue to innovate and serve you
                well.
              </p>
              <ul className="space-y-4 text-white/80">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <div>
                    <span className="font-semibold text-white">
                      Continuous Development & Innovation:
                    </span>
                    <span className="ml-2">
                      We invest heavily in building new features, improving our
                      AI capabilities, and staying ahead of the latest technology
                      trends. Every dollar supports ongoing development to make
                      Sentinel better for you.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <div>
                    <span className="font-semibold text-white">
                      Enterprise-Grade Infrastructure:
                    </span>
                    <span className="ml-2">
                      Our platform runs on secure, scalable cloud infrastructure
                      with 99.9% uptime guarantees. Maintaining this level of
                      reliability and performance requires significant ongoing
                      investment in servers, databases, and security systems.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <div>
                    <span className="font-semibold text-white">
                      Advanced AI & Analytics:
                    </span>
                    <span className="ml-2">
                      Our risk detection algorithms and AI assistant require
                      powerful computing resources and continuous model training.
                      These advanced capabilities come at a cost, but they deliver
                      measurable value by helping you prevent revenue loss.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <div>
                    <span className="font-semibold text-white">
                      Security & Compliance:
                    </span>
                    <span className="ml-2">
                      Protecting your data is our top priority. We invest in
                      security audits, compliance certifications, encryption,
                      and monitoring systems to ensure your deal data stays safe
                      and meets industry standards.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <div>
                    <span className="font-semibold text-white">
                      Customer Support & Success:
                    </span>
                    <span className="ml-2">
                      Our team of support specialists, account managers, and
                      engineers are here to help you succeed. From onboarding to
                      ongoing optimization, we&apos;re committed to your success,
                      which requires a dedicated support infrastructure.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <div>
                    <span className="font-semibold text-white">
                      Fair Value Exchange:
                    </span>
                    <span className="ml-2">
                      We believe in fair value exchange. Our free tier allows
                      individuals to get started without barriers, while our paid
                      plans provide advanced features and support for teams that
                      need more. This model ensures we can sustain and improve
                      the platform while keeping it accessible.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Our Pricing Philosophy
              </h2>
              <p className="text-white/70 mb-6 leading-relaxed">
                We&apos;ve designed our pricing to be simple, transparent, and
                aligned with the value you receive. No hidden fees, no complex
                contracts, just clear pricing that scales with your needs.
              </p>
              <ul className="space-y-2 text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    <strong>Free to Start:</strong> Our Starter plan is completely
                    free forever, giving individual sales reps access to essential
                    deal tracking and risk detection features.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    <strong>Transparent Pricing:</strong> All our plans have clear,
                    upfront pricing. What you see is what you pay, no surprises.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    <strong>Annual Discounts:</strong> Save up to 33% by choosing
                    annual billing. We pass these savings directly to you.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    <strong>No Lock-In:</strong> Cancel anytime. Your data belongs
                    to you, and you can export it at any time.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    <strong>Value-Based:</strong> Our pricing reflects the value
                    we provide, helping you prevent revenue loss and close more
                    deals faster.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Choose Your Plan
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">
                Select the plan that best fits your needs. All plans include our
                core deal tracking and risk detection features. Upgrade or
                downgrade anytime as your needs change.
              </p>

              <div className="flex justify-center mb-8">
                <PricingToggleDisplay />
              </div>

              <PricingCards />
            </div>
          </div>
        </section>

        <section className="py-16 px-6 lg:px-8 border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            {user ? (
              <>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to get started?
                </h2>
                <p className="text-white/60 mb-8">
                  Join revenue teams using Sentinel to proactively manage
                  deals and prevent silent decay.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/features"
                    className="px-6 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                  >
                    View Features
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Login Required
                </h2>
                <p className="text-white/60 mb-8">
                  Please log in first to access the dashboard and start managing your deals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/sign-in"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-6 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </PricingToggle>
  );
}
