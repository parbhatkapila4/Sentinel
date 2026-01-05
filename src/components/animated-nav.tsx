"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { SignInButtonWrapper } from "@/components/sign-in-button";
import { UserButtonWrapper } from "@/components/user-button";

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
          ? "border-zinc-300/50 bg-white/98 backdrop-blur-xl shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/98"
          : "border-zinc-200/50 bg-white/95 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/95"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-black via-zinc-800 to-black shadow-lg transition-transform duration-300 hover:scale-110 dark:from-white dark:via-zinc-200 dark:to-white"></div>
            <div>
              <span className="text-xl font-bold text-black dark:text-zinc-50">
                Revenue Sentinel
              </span>
              <div className="text-xs text-zinc-500 dark:text-zinc-500">
                Deal Risk Intelligence
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {isSignedIn ? (
              <>
                <Link
                  href="/founder"
                  className="text-sm font-medium text-zinc-600 transition-all duration-300 hover:text-black hover:scale-105 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Overview
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-zinc-600 transition-all duration-300 hover:text-black hover:scale-105 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Dashboard
                </Link>
                <UserButtonWrapper />
              </>
            ) : (
              <SignInButtonWrapper />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

