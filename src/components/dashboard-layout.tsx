"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Suspense } from "react";
import { TeamSelector } from "@/components/team-selector";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useRealtime } from "@/hooks/use-realtime";
import { trackPageView } from "@/lib/analytics-client";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  subItems?: { label: string; href: string }[];
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showVideoTutorial, setShowVideoTutorial] = useState(false);
  interface SearchResult {
    id: string;
    name: string;
    stage: string;
    value: number;
  }

  interface Alert {
    id: string;
    type: "high" | "medium";
    message: string;
    dealId: string;
    riskScore: number;
  }

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const helpRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  type TeamItem = {
    id: string;
    name: string;
    slug: string;
    memberCount: number;
    myRole: string;
  };
  const [teams, setTeams] = useState<TeamItem[]>([]);

  useRealtime({
    onEvent(ev) {
      if (
        ev.type === "deal.updated" ||
        ev.type === "deal.created" ||
        ev.type === "deal.deleted" ||
        ev.type === "deal.at_risk"
      ) {
        router.refresh();
      }
    },
  });

  useEffect(() => {
    if (pathname) trackPageView(pathname);
  }, [pathname]);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "home",
      subItems: [
        { label: "Overview", href: "/dashboard" },
        { label: "Analytics", href: "/analytics" },
        { label: "Top Deals", href: "/top-deals" },
      ],
    },
    { label: "Forecast", href: "/deals", icon: "forecast" },
    { label: "Expenses", href: "/deals-by-stage", icon: "expenses" },
    { label: "Alerts", href: "/risk-overview", icon: "alerts" },
    { label: "AI", href: "/insights", icon: "ai" },
    { label: "Reports", href: "/reports", icon: "reports" },
    {
      label: "Settings",
      href: "/settings",
      icon: "settings",
      subItems: [
        { label: "General", href: "/settings" },
        { label: "Team", href: "/settings/team" },
        { label: "Notifications", href: "/settings/notifications" },
        { label: "Webhooks", href: "/settings/webhooks" },
        { label: "Integrations", href: "/settings/integrations" },
      ],
    },
  ];

  const getIcon = (icon: string) => {
    switch (icon) {
      case "home":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        );
      case "forecast":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
        );
      case "expenses":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
            />
          </svg>
        );
      case "income":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "alerts":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        );
      case "ai":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
            />
          </svg>
        );
      case "reports":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        );
      case "settings":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname?.startsWith(href + "/");
  };

  const toggleExpand = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  useEffect(() => {
    const itemsToExpand = new Set<string>();
    navItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some((subItem) =>
          isActiveRoute(subItem.href)
        );
        if (hasActiveSubItem) {
          itemsToExpand.add(item.label);
        }
      }
    });

    if (itemsToExpand.size > 0) {
      setExpandedItems((prev) => {
        if (
          prev.size !== itemsToExpand.size ||
          Array.from(prev).some((item) => !itemsToExpand.has(item))
        ) {
          return itemsToExpand;
        }
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isInsightsPage = pathname === "/insights";

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const response = await fetch(
            `/api/deals/search?q=${encodeURIComponent(searchQuery)}`
          );
          if (response.ok) {
            const json = await response.json();
            const payload = json.data ?? json;
            setSearchResults((payload.deals || []) as SearchResult[]);
            setShowSearchResults(true);
          }
        } catch (error) {
          console.error("Search error:", error);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/teams/me");
        if (res.ok) {
          const json = await res.json();
          const payload = json.data ?? json;
          setTeams((payload.teams || []) as TeamItem[]);
        }
      } catch {
        setTeams([]);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setAlertsLoading(true);
        const response = await fetch("/api/alerts");
        if (response.ok) {
          const json = await response.json();
          const payload = json.data ?? json;
          setAlerts((payload.alerts || []) as Alert[]);
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
        setAlerts([]);
      } finally {
        setAlertsLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowHelp(false);
      }
      if (
        alertsRef.current &&
        !alertsRef.current.contains(event.target as Node)
      ) {
        setShowAlerts(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowHelp(false);
        setShowAlerts(false);
        setShowSearchResults(false);
        setShowVideoTutorial(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/deals?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {!isInsightsPage && (
        <>
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
          )}
          <aside
            className={`fixed inset-y-0 left-0 z-50 ${isSidebarCollapsed ? "w-16" : "w-64"} bg-[#0a0a0a] border-r border-white/10 transform transition-all duration-300 lg:static lg:translate-x-0 flex flex-col h-screen overflow-hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
            aria-label="Main navigation"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2.5 min-w-[44px] min-h-[44px] rounded-lg hover:bg-white/10 flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hidden lg:flex absolute top-6 z-10 w-8 h-8 rounded-lg items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all border border-white/15 hover:border-white/30 shadow-sm ${isSidebarCollapsed ? "left-3" : "left-3"
                }`}
              aria-label={
                isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={isSidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                />
              </svg>
            </button>

            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
              <div className={`pt-16 pb-4 ${isSidebarCollapsed ? "px-2" : "px-3"}`}>
                {!isSidebarCollapsed && (
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-4 px-3">
                    Main
                  </p>
                )}
                <nav className="space-y-1" aria-label="Primary navigation">
                  {navItems.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    const isExpanded = expandedItems.has(item.label);
                    const hasSubItems = item.subItems && item.subItems.length > 0;

                    return (
                      <div key={item.label}>
                        {hasSubItems ? (
                          <div
                            role="button"
                            tabIndex={0}
                            aria-expanded={isExpanded}
                            aria-label={`${item.label} ${isExpanded ? "collapse" : "expand"} submenu`}
                            className={`group flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-3"} py-2.5 rounded-xl transition-all cursor-pointer ${isActive
                              ? "bg-white/10 text-white shadow-sm"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                              }`}
                            onClick={() => toggleExpand(item.label)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleExpand(item.label);
                              }
                            }}
                          >
                            <span
                              className={`shrink-0 ${isActive ? "text-white" : "text-white/60"
                                }`}
                            >
                              {getIcon(item.icon)}
                            </span>
                            {!isSidebarCollapsed && (
                              <>
                                <span className="flex-1 text-sm font-medium">
                                  {item.label}
                                </span>
                                <svg
                                  className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? "rotate-180" : ""
                                    }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 15l3.75-3.75L15.75 15"
                                  />
                                </svg>
                              </>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`group flex items-center ${isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-3"} py-2.5 rounded-xl transition-all ${isActive
                              ? "bg-white/10 text-white shadow-sm"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                              }`}
                          >
                            <span
                              className={`shrink-0 ${isActive ? "text-white" : "text-white/60"
                                }`}
                            >
                              {getIcon(item.icon)}
                            </span>
                            {!isSidebarCollapsed && (
                              <span className="flex-1 text-sm font-medium">
                                {item.label}
                              </span>
                            )}
                          </Link>
                        )}
                        {hasSubItems && !isSidebarCollapsed && isExpanded && (
                          <div className={`ml-4 mt-1 space-y-1 border-l border-white/5 ${isSidebarCollapsed ? "pl-2" : "pl-4"}`}>
                            {item.subItems?.map((subItem) => {
                              const isSubActive = isActiveRoute(subItem.href);
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`block px-3 py-2 rounded-lg text-sm transition-all ${isSubActive
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                  {subItem.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {!isSidebarCollapsed && (
                  <>
                    <div className="mt-6 mb-6 px-3">
                      <div className="rounded-xl bg-gradient-to-br from-[#2a1a1d] to-[#1a0f11] p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                          <svg
                            className="w-4 h-4 text-[#f97316]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                            />
                          </svg>
                          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                            Quick Stats
                          </h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/60">
                              Pipeline Value
                            </span>
                            <span className="text-xs font-semibold text-white">
                              Active
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/60">
                              Total Deals
                            </span>
                            <span className="text-xs font-semibold text-white">
                              Tracking
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/60">
                              Risk Alerts
                            </span>
                            <span className="text-xs font-semibold text-red-400">
                              {alerts.length > 0 ? alerts.length : "None"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 px-3">
                      <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                          <svg
                            className="w-4 h-4 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                            />
                          </svg>
                          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                            Pro Tips
                          </h4>
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] mt-1.5 shrink-0"></div>
                            <p className="text-xs text-white/70 leading-relaxed">
                              Review high-risk deals weekly to prevent revenue loss
                            </p>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] mt-1.5 shrink-0"></div>
                            <p className="text-xs text-white/70 leading-relaxed">
                              Update deal stages regularly for accurate forecasting
                            </p>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] mt-1.5 shrink-0"></div>
                            <p className="text-xs text-white/70 leading-relaxed">
                              Use AI insights to identify at-risk opportunities
                              early
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="mb-6 px-3">
                      <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                          <svg
                            className="w-4 h-4 text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                            />
                          </svg>
                          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                            Quick Actions
                          </h4>
                        </div>
                        <div className="space-y-2">
                          <Link
                            href="/insights"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                          >
                            <svg
                              className="w-3.5 h-3.5 text-white/60 group-hover:text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                              />
                            </svg>
                            <span className="text-xs text-white/70 group-hover:text-white">
                              AI Assistant
                            </span>
                          </Link>
                          <Link
                            href="/reports"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                          >
                            <svg
                              className="w-3.5 h-3.5 text-white/60 group-hover:text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                              />
                            </svg>
                            <span className="text-xs text-white/70 group-hover:text-white">
                              Generate Report
                            </span>
                          </Link>
                          <Link
                            href="/risk-overview"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                          >
                            <svg
                              className="w-3.5 h-3.5 text-white/60 group-hover:text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                              />
                            </svg>
                            <span className="text-xs text-white/70 group-hover:text-white">
                              Risk Overview
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!isSidebarCollapsed && (
              <div className="flex-shrink-0 p-4 border-t border-white/10 space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-[#2a1a1d] to-[#1a0f11] p-5 border border-white/5 max-sm:hidden">
                  <h3 className="text-base font-bold text-white mb-1">
                    Let&apos;s start!
                  </h3>
                  <p className="text-xs text-white/60 mb-4">
                    Creating or adding new deals couldn&apos;t be easier
                  </p>
                  <Link
                    href="/deals/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold text-sm transition-all shadow-lg shadow-[#f97316]/20 min-h-[44px]"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add New Deal
                  </Link>
                </div>

                <div className="px-3 py-2 text-center">
                  <p className="text-xs text-white/30">Sentinel v1.0</p>
                  <p className="text-xs text-white/20 mt-0.5">
                    Revenue Intelligence Platform
                  </p>
                </div>

                <button
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                    router.refresh();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-sm transition-all border border-red-500/20 hover:border-red-500/30 group min-h-[44px]"
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
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {!isInsightsPage && (
          <header className="flex-shrink-0 sticky top-0 z-30 flex items-center justify-between gap-3 px-4 lg:px-6 py-3 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/10 min-w-0 max-md:flex-wrap max-md:gap-2" role="banner">
            <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
              <button
                type="button"
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 max-lg:min-h-[44px] max-lg:min-w-[44px] max-lg:flex max-lg:items-center max-lg:justify-center"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-[#131313] border border-[#1f1f1f] hover:bg-[#1a1a1a] transition-colors cursor-pointer shrink-0 min-w-0"
                aria-label="Home"
              >
                <img
                  src="/Sentinel New logo.png"
                  alt=""
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-contain shrink-0"
                />
                <div className="leading-tight hidden sm:block">
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">Home</p>
                </div>
              </Link>
              {teams.length > 0 && (
                <Suspense
                  fallback={
                    <div className="h-10 w-32 rounded-xl bg-[#131313] border border-[#1f1f1f] animate-pulse" />
                  }
                >
                  <TeamSelector teams={teams} />
                </Suspense>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-end">
              <div ref={searchRef} className="relative w-10 min-w-[2.5rem] shrink-0 sm:min-w-0 sm:flex-1 sm:max-w-72">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center justify-center sm:justify-start gap-0 sm:gap-3 p-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#131313] border border-[#1f1f1f] w-full min-w-0 sm:min-w-[8rem] sm:max-w-full min-h-[44px] overflow-hidden"
                >
                  <svg
                    className="w-4 h-4 sm:w-4 sm:h-4 text-[#808080] shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search deals, companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                    className="bg-transparent text-sm text-white placeholder-[#6b6b6b] placeholder:opacity-0 sm:placeholder:opacity-100 outline-none flex-1 min-w-0"
                    aria-label="Search deals and companies"
                    autoComplete="off"
                  />
                  <span className="text-xs text-white/30 ml-1 sm:ml-2 shrink-0 hidden sm:inline">⌘K</span>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                      className="text-[#6b6b6b] hover:text-white hidden sm:inline-flex shrink-0"
                      aria-label="Clear search"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </form>

                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-full min-w-[12rem] max-w-[calc(100vw-2rem)] sm:w-56 lg:w-72 bg-[#131313] border border-[#1f1f1f] rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((deal) => (
                      <Link
                        key={deal.id}
                        href={`/deals/${deal.id}`}
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery("");
                        }}
                        className="block px-4 py-3 hover:bg-[#1a1a1a] border-b border-[#1f1f1f] last:border-b-0 transition-colors"
                      >
                        <div className="text-sm font-medium text-white">
                          {deal.name}
                        </div>
                        <div className="text-xs text-[#8a8a8a] mt-1">
                          {deal.stage} • ${deal.value.toLocaleString("en-US")}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="shrink-0">
                <NotificationsDropdown />
              </div>

              <div ref={helpRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowHelp(!showHelp);
                    setShowAlerts(false);
                  }}
                  className="p-2.5 min-w-[44px] min-h-[44px] rounded-full bg-[#131313] border border-[#1f1f1f] flex items-center justify-center text-[#8a8a8a] hover:text-white hover:border-white/20 transition-all"
                  aria-label="Help and support"
                  aria-expanded={showHelp}
                  aria-haspopup="true"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                    />
                  </svg>
                </button>

                {showHelp && (
                  <div
                    className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,18rem)] sm:w-72 bg-[#131313] border border-[#1f1f1f] rounded-xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto"
                    role="menu"
                    aria-label="Help and support menu"
                  >
                    <div className="px-4 py-3 border-b border-[#1f1f1f]">
                      <h3 id="help-menu-title" className="text-sm font-semibold text-white">
                        Help & Support
                      </h3>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/insights"
                        onClick={() => setShowHelp(false)}
                        className="block px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
                      >
                        <div className="text-sm font-medium text-white">
                          AI Assistant
                        </div>
                        <div className="text-xs text-[#8a8a8a] mt-1">
                          Get instant answers
                        </div>
                      </Link>
                      <Link
                        href="/docs"
                        onClick={() => setShowHelp(false)}
                        className="block px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
                      >
                        <div className="text-sm font-medium text-white">
                          Documentation
                        </div>
                        <div className="text-xs text-[#8a8a8a] mt-1">
                          Learn how to use Sentinel
                        </div>
                      </Link>
                      <a
                        href="mailto:help@sentinels.in"
                        onClick={() => setShowHelp(false)}
                        className="block px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
                      >
                        <div className="text-sm font-medium text-white">
                          Contact Support
                        </div>
                        <div className="text-xs text-[#8a8a8a] mt-1">
                          help@sentinels.in
                        </div>
                      </a>
                      <button
                        onClick={() => {
                          setShowVideoTutorial(true);
                          setShowHelp(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
                      >
                        <div className="text-sm font-medium text-white">
                          Video tutorial
                        </div>
                        <div className="text-xs text-[#8a8a8a] mt-1">
                          Watch step-by-step guides
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div ref={alertsRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAlerts(!showAlerts);
                    setShowHelp(false);
                  }}
                  className="p-2.5 min-w-[44px] min-h-[44px] rounded-full bg-[#131313] border border-[#1f1f1f] flex items-center justify-center text-[#8a8a8a] hover:text-white hover:border-white/20 transition-all relative"
                  aria-label={`Risk alerts${alerts.length > 0 ? `, ${alerts.length} unread` : ""}`}
                  aria-expanded={showAlerts}
                  aria-haspopup="true"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m0 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  {alerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {alerts.length}
                    </span>
                  )}
                </button>

                {showAlerts && (
                  <div
                    className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,20rem)] sm:w-80 bg-[#131313] border border-[#1f1f1f] rounded-xl shadow-2xl z-50 max-h-[70vh] sm:max-h-96 overflow-y-auto"
                    role="menu"
                    aria-label="Risk alerts"
                  >
                    <div className="px-4 py-3 border-b border-[#1f1f1f] flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">
                        Risk Alerts
                      </h3>
                      {alerts.length > 0 && (
                        <Link
                          href="/risk-overview"
                          onClick={() => setShowAlerts(false)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          View all
                        </Link>
                      )}
                    </div>
                    <div className="py-2">
                      {alertsLoading ? (
                        <div className="px-4 py-8 text-center">
                          <div className="text-sm text-[#8a8a8a]">
                            Loading alerts...
                          </div>
                        </div>
                      ) : alerts.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <div className="text-sm text-[#8a8a8a]">
                            No risk alerts
                          </div>
                          <div className="text-xs text-[#6b6b6b] mt-1">
                            All deals are healthy!
                          </div>
                        </div>
                      ) : (
                        alerts.map((alert) => (
                          <Link
                            key={alert.id}
                            href={`/deals/${alert.dealId}`}
                            onClick={() => setShowAlerts(false)}
                            className="block px-4 py-3 hover:bg-[#1a1a1a] transition-colors border-b border-[#1f1f1f] last:border-b-0"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 shrink-0 ${alert.type === "high"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                                  }`}
                              ></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white">
                                  {alert.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded ${alert.type === "high"
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-amber-500/20 text-amber-400"
                                      }`}
                                  >
                                    Risk: {alert.riskScore}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        <main id="main-content" className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0b0b0b] scrollbar-hide" tabIndex={-1}>
          {children}
        </main>

        {showVideoTutorial && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowVideoTutorial(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-tutorial-title"
          >
            <div
              className="relative w-full max-w-4xl bg-[#131313] rounded-xl border border-[#1f1f1f] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
                <h3 id="video-tutorial-title" className="text-sm font-semibold text-white">
                  Video Tutorial
                </h3>
                <button
                  type="button"
                  onClick={() => setShowVideoTutorial(false)}
                  className="p-2 rounded-full text-[#8a8a8a] hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <video
                src="/Sentinel-tutorial.mp4"
                controls
                autoPlay
                className="w-full aspect-video"
                onEnded={() => setShowVideoTutorial(false)}
                aria-label="Sentinel tutorial video"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
