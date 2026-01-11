"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function Navbar({ className }: { className?: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setIsSignedIn(!!data.user);
      })
      .catch(() => setIsSignedIn(false));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
      
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
      
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={cn(
        "fixed top-10 inset-x-0 max-w-7xl mx-auto z-50 px-6 transition-all duration-300 ease-in-out",
        isVisible 
          ? "translate-y-0 opacity-100 pointer-events-auto" 
          : "-translate-y-[120%] opacity-0 pointer-events-none",
        className
      )}
    >
      <div className="flex items-center justify-between w-full">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">RS</span>
          </div>
          <span className="text-xl font-bold text-white">Revenue Sentinel</span>
        </Link>

        <nav className="relative rounded-full border border-white/[0.2] bg-black shadow-input flex justify-center space-x-4 px-8 py-6">
          <Link
            href="#features"
            className="cursor-pointer text-white hover:opacity-[0.9] transition-opacity"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="cursor-pointer text-white hover:opacity-[0.9] transition-opacity"
          >
            Pricing
          </Link>
          <Link
            href="#blog"
            className="cursor-pointer text-white hover:opacity-[0.9] transition-opacity"
          >
            Resources
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  setIsSignedIn(false);
                  router.push("/");
                  router.refresh();
                }}
                className="px-5 py-2.5 bg-gray-700 text-white rounded-lg font-semibold text-sm hover:bg-gray-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                Sign Up
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;

