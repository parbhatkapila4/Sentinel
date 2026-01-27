"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";

export function AnimatedNav() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${scrolled
        ? "border-white/10 bg-black/95 backdrop-blur-xl"
        : "border-white/10 bg-black/80 backdrop-blur-xl"
        }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <svg
              className="w-9 h-9"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="36" height="36" rx="10" fill="#10B981" />
              <path
                d="M18 8V28"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M22 12C22 12 20.5 10 18 10C15.5 10 13 11.5 13 14C13 16.5 15 17 18 18C21 19 23 19.5 23 22C23 24.5 20.5 26 18 26C15.5 26 14 24 14 24"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xl font-bold text-white">Sentinel</span>
          </Link>
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
                  DASHBOARD
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                    router.refresh();
                  }}
                  className="px-6 py-2 bg-gray-700 rounded-lg text-white font-semibold hover:bg-gray-600 transition-colors"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-white hover:text-white/80 transition-colors"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/sign-up"
                  className="px-6 py-2 bg-blue-500 rounded-lg text-white font-semibold flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                  SIGN UP
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
