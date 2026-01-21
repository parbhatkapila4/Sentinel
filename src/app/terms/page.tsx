import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function TermsPage() {
  const user = await getAuthenticatedUser();

  return (
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
            Terms of Service
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            Last Updated: January 2026
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Agreement to Terms
            </h2>
            <p className="text-white/70 leading-relaxed">
              By accessing or using Sentinel (&quot;the Service&quot;), you agree to be
              bound by these Terms of Service (&quot;Terms&quot;). If you disagree with
              any part of these terms, you may not access the Service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Use License
            </h2>
            <p className="text-white/70 mb-4 leading-relaxed">
              Permission is granted to temporarily use Sentinel for personal or
              commercial use. This is the grant of a license, not a transfer of
              title, and under this license you may not:
            </p>
            <ul className="space-y-2 text-white/80 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Modify or copy the materials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Use the materials for any commercial purpose without
                  explicit written permission</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Attempt to reverse engineer any software contained in
                  Sentinel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Remove any copyright or other proprietary notations from
                  the materials</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              User Accounts
            </h2>
            <p className="text-white/70 mb-4 leading-relaxed">
              When you create an account with us, you must provide information
              that is accurate, complete, and current at all times. You are
              responsible for safeguarding the password and for all activities
              that occur under your account.
            </p>
            <p className="text-white/70 leading-relaxed">
              You agree not to disclose your password to any third party and to
              take sole responsibility for any activities or actions under your
              account, whether or not you have authorized such activities or
              actions.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Acceptable Use
            </h2>
            <p className="text-white/70 mb-4 leading-relaxed">
              You agree not to use the Service:
            </p>
            <ul className="space-y-2 text-white/80 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>In any way that violates any applicable national or
                  international law or regulation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>To transmit, or procure the sending of, any advertising or
                  promotional material without our prior written consent</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>To impersonate or attempt to impersonate the company, a
                  company employee, another user, or any other person or entity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>In any way that infringes upon the rights of others, or in
                  any way is illegal, threatening, fraudulent, or harmful</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Subscription and Billing
            </h2>
            <p className="text-white/70 mb-4 leading-relaxed">
              Some parts of the Service are billed on a subscription basis
              (&quot;Subscription(s)&quot;). You will be billed in advance on a
              recurring and periodic basis (&quot;Billing Cycle&quot;). Billing cycles
              are set on a monthly or annual basis.
            </p>
            <p className="text-white/70 mb-4 leading-relaxed">
              At the end of each Billing Cycle, your Subscription will
              automatically renew under the exact same conditions unless you
              cancel it or Sentinel cancels it. You may cancel your
              Subscription renewal through your account settings.
            </p>
            <p className="text-white/70 leading-relaxed">
              A valid payment method, including credit card or PayPal, is
              required to process the payment for your Subscription. You shall
              provide Sentinel with accurate and complete billing information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Data and Privacy
            </h2>
            <p className="text-white/70 mb-4 leading-relaxed">
              You retain all rights to your data. Sentinel does not claim
              ownership of your data. You are responsible for maintaining
              backups of your data.
            </p>
            <p className="text-white/70 leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy.
              Please review our Privacy Policy, which also governs your use of
              the Service, to understand our practices.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Termination
            </h2>
            <p className="text-white/70 mb-4 leading-relaxed">
              We may terminate or suspend your account and bar access to the
              Service immediately, without prior notice or liability, under our
              sole discretion, for any reason whatsoever and without limitation,
              including but not limited to a breach of the Terms.
            </p>
            <p className="text-white/70 leading-relaxed">
              If you wish to terminate your account, you may simply discontinue
              using the Service or cancel your subscription through your account
              settings.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Disclaimer
            </h2>
            <p className="text-white/70 leading-relaxed">
              The information on this Service is provided on an &quot;as is&quot; basis.
              To the fullest extent permitted by law, Sentinel excludes all
              representations, warranties, conditions, and terms relating to our
              website and the use of this website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Limitation of Liability
            </h2>
            <p className="text-white/70 leading-relaxed">
              In no event shall Sentinel, nor its directors, employees,
              partners, agents, suppliers, or affiliates, be liable for any
              indirect, incidental, special, consequential, or punitive damages,
              including without limitation, loss of profits, data, use, goodwill,
              or other intangible losses, resulting from your use of the Service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Changes to Terms
            </h2>
            <p className="text-white/70 leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will
              provide at least 30 days notice prior to any new terms taking
              effect.
            </p>
            <p className="text-white/70 leading-relaxed">
              What constitutes a material change will be determined at our sole
              discretion. By continuing to access or use our Service after those
              revisions become effective, you agree to be bound by the revised
              terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Contact Information
            </h2>
            <p className="text-white/70 leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us at{" "}
              <a
                href="mailto:parbhat@parbhat.dev"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                parbhat@parbhat.dev
              </a>
              .
            </p>
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
                Start managing your deals and preventing silent decay today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/deals/new"
                  className="px-6 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Create Your First Deal
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white mb-4">
                Login Required
              </h2>
              <p className="text-white/60 mb-8">
                Please log in first to access the dashboard and start managing
                your deals.
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
  );
}
