"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Team = {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  myRole: string;
};

function buildHref(teamId: string | null, search: URLSearchParams): string {
  const p = new URLSearchParams(search.toString());
  if (teamId) p.set("team", teamId);
  else p.delete("team");
  const q = p.toString();
  return "/deals" + (q ? `?${q}` : "");
}

export function TeamSelector({ teams }: { teams: Team[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const selectedTeamId = searchParams.get("team");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const label = selectedTeamId
    ? teams.find((t) => t.id === selectedTeamId)?.name ?? "Team"
    : "Personal";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#131313] border border-[#1f1f1f] hover:bg-[#1a1a1a] transition-colors text-sm font-medium text-white"
      >
        <svg
          className="w-4 h-4 text-white/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span>{label}</span>
        <svg
          className={`w-4 h-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 py-1 rounded-xl bg-[#131313] border border-[#1f1f1f] shadow-xl z-50 min-w-[200px]">
          <Link
            href={buildHref(null, searchParams)}
            onClick={() => setOpen(false)}
            className={`block px-4 py-2.5 text-sm transition-colors ${!selectedTeamId
              ? "bg-white/10 text-white font-medium"
              : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
          >
            Personal
          </Link>
          {teams.map((t) => (
            <Link
              key={t.id}
              href={buildHref(t.id, searchParams)}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm transition-colors ${selectedTeamId === t.id
                ? "bg-white/10 text-white font-medium"
                : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
            >
              {t.name}
              <span className="ml-2 text-xs text-white/40">({t.memberCount})</span>
            </Link>
          ))}
          <Link
            href="/settings/team"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/5 border-t border-white/5 mt-1 pt-2"
          >
            Manage teams →
          </Link>
        </div>
      )}
    </div>
  );
}
