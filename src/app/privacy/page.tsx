import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            We are committed to protecting your privacy and being transparent about
            how we collect, use, and safeguard your information.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-20">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Information We Collect
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              We collect information that you provide directly to us and information
              that is automatically collected when you use our services. This helps us
              provide you with a better experience and improve our platform.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  <strong className="text-white">Personal Information:</strong> We may
                  collect personal information such as your name, email address, phone
                  number, company name, and payment information when you register for an
                  account, subscribe to our services, or contact us for support.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  <strong className="text-white">Usage Data:</strong> We automatically
                  collect information about how you interact with our platform,
                  including your IP address, browser type, device information, pages
                  visited, time spent on pages, and other usage statistics to help us
                  improve our services.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              How We Use Information
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              We use the information we collect to provide, maintain, and improve our
              services, as well as to communicate with you about your account and our
              services.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Provide, operate, and maintain our website and services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Improve, personalize, and expand our website and services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Understand and analyze how you use our website and services
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Develop new products, services, features, and functionality
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Communicate with you for customer service and support purposes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Send you updates, marketing communications, and promotional materials
                  (with your consent)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Process transactions and send related information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Detect, prevent, and address technical issues</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Data Security
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              We implement appropriate technical and organizational security measures
              to protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the Internet or electronic storage is 100% secure, and
              we cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Data Retention
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill
              the purposes outlined in this Privacy Policy, unless a longer retention
              period is required or permitted by law. When we no longer need your
              personal information, we will securely delete or anonymize it.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Your Rights
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              You have the right to access, update, or delete your personal
              information at any time. You can also opt-out of receiving marketing
              communications from us. To exercise these rights, please contact us at{" "}
              <a
                href="mailto:parbhat@parbhat.dev"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                parbhat@parbhat.dev
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Changes to This Privacy Policy
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you
              of any changes by posting the new Privacy Policy on this page and
              updating the &quot;Last Updated&quot; date. You are advised to review
              this Privacy Policy periodically for any changes.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Contact Us
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us
              at{" "}
              <a
                href="mailto:parbhat@parbhat.dev"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                parbhat@parbhat.dev
              </a>
              .
            </p>
            <p className="text-white/50 text-sm mt-4">Last Updated: January 2026</p>
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
                Join revenue teams using Sentinel to proactively manage deals and
                prevent silent decay.
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
  );
}
