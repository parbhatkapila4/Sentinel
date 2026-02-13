"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";

function Navbar({ className }: { className?: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (isLoaded && clerkUser) {
      setTimeout(() => {
        setIsSignedIn(true);
        setUserData({
          name: clerkUser.firstName || clerkUser.username || "User",
          email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
        });
      }, 0);
    } else if (isLoaded && !clerkUser) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          setIsSignedIn(!!data.user);
          if (data.user) {
            setUserData({
              name: `${data.user.name || ""} ${data.user.surname || ""}`.trim() || "User",
              email: data.user.email || "",
            });
          }
        })
        .catch(() => {
          setIsSignedIn(false);
          setUserData(null);
        });
    }
  }, [isLoaded, clerkUser]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (mobileNavOpen && !target.closest('[data-mobile-nav]')) {
        setMobileNavOpen(false);
      }
    };

    if (showUserMenu || mobileNavOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu, mobileNavOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setMobileNavOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 pl-10 sm:pl-14 lg:pl-20 pr-4 sm:pr-6 lg:pr-8 py-4",
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-[120%] opacity-0 pointer-events-none",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      <div className="flex items-center justify-between w-full gap-2 min-w-0 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0 min-w-0">
          <svg
            className="w-8 h-8 sm:w-9 sm:h-9"
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
          <span className="text-lg sm:text-xl font-bold text-white truncate">
            Sentinel
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 relative rounded-full border border-white/[0.2] bg-black shadow-input justify-center space-x-4 px-6 lg:px-8 py-4 lg:py-6 ml-4 lg:ml-20 flex-shrink-0" aria-label="Main navigation">
          <Link
            href="/features"
            className="cursor-pointer text-white hover:opacity-[0.9] transition-opacity whitespace-nowrap"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="cursor-pointer text-white hover:opacity-[0.9] transition-opacity whitespace-nowrap"
          >
            Pricing
          </Link>
          <Link
            href="/resources"
            className="cursor-pointer text-white hover:opacity-[0.9] transition-opacity whitespace-nowrap"
          >
            Resources
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4 md:ml-12 flex-shrink-0 relative">
          <button
            type="button"
            data-mobile-nav
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          {mobileNavOpen && (
            <div data-mobile-nav className="absolute top-full right-0 mt-2 rounded-xl border border-white/20 bg-black shadow-xl py-3 w-[min(100vw-2rem,280px)] md:hidden z-50">
              {isSignedIn && (
                <Link href="/dashboard" onClick={() => setMobileNavOpen(false)} className="block px-4 py-3 text-white hover:bg-white/10 transition-colors">
                  Dashboard
                </Link>
              )}
              <Link href="/features" onClick={() => setMobileNavOpen(false)} className="block px-4 py-3 text-white hover:bg-white/10 transition-colors">Features</Link>
              <Link href="/#pricing" onClick={() => setMobileNavOpen(false)} className="block px-4 py-3 text-white hover:bg-white/10 transition-colors">Pricing</Link>
              <Link href="/resources" onClick={() => setMobileNavOpen(false)} className="block px-4 py-3 text-white hover:bg-white/10 transition-colors">Resources</Link>
            </div>
          )}
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline text-sm font-medium text-white/90 hover:text-white transition-colors whitespace-nowrap"
              >
                Dashboard
              </Link>
              <div className="relative user-menu-container">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-2xl bg-[#131313] border border-[#1f1f1f] hover:bg-[#1a1a1a] transition-colors cursor-pointer min-h-[44px]"
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#303030] to-[#161616] flex items-center justify-center border border-[#2a2a2a] shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {userData?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="leading-tight hidden sm:block">
                    <p className="text-sm font-semibold text-white truncate max-w-[120px]">
                      {userData?.name || "User"}
                    </p>
                  </div>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#131313] border border-[#1f1f1f] shadow-lg z-50 overflow-hidden">
                      <button
                        onClick={async () => {
                          await signOut();
                          setIsSignedIn(false);
                          setShowUserMenu(false);
                          router.push("/");
                          router.refresh();
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#1a1a1a] transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="px-4 sm:px-5 py-2.5 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 min-h-[44px] shrink-0"
            >
              Sign In
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
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;

