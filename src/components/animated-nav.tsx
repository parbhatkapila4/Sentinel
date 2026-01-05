"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { SignInButtonWrapper } from "@/components/sign-in-button";

export function AnimatedNav() {
  const { isSignedIn } = useUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-white/10 bg-black/95 backdrop-blur-xl"
          : "border-white/10 bg-black/80 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-500 rounded shrink-0"></div>
            <div>
              <span className="text-xl font-bold text-white">
                REVENUE SENTINEL
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-white hover:text-white/80 transition-colors"
            >
              SOLUTIONS
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-white hover:text-white/80 transition-colors"
            >
              INTEGRATIONS
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-white hover:text-white/80 transition-colors"
            >
              PRICING
            </Link>
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-white hover:text-white/80 transition-colors"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 py-2 bg-blue-500 rounded-lg text-white font-semibold flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                  OPEN DASHBOARD
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="#"
                  className="text-sm font-medium text-white hover:text-white/80 transition-colors"
                >
                  SIGN IN
                </Link>
                <div className="px-6 py-2 bg-blue-500 rounded-lg text-white font-semibold flex items-center gap-2 hover:bg-blue-600 transition-colors cursor-pointer">
                  <SignInButtonWrapper />
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


