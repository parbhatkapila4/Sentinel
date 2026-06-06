"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export function FinalCTAActions() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="final-cta-row" aria-busy="true">
        <span className="final-btn landing-cta-skeleton" aria-hidden>
          Start free →
        </span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="final-cta-row">
        <Link className="final-btn-out" href="/docs">
          Read docs
        </Link>
        <Link className="final-btn-out" href="/security">
          Security
        </Link>
      </div>
    );
  }

  return (
    <div className="final-cta-row">
      <Link className="final-btn" href="/sign-in">
        Start free →
      </Link>
      <Link className="final-btn-out" href="/docs">
        Read docs
      </Link>
    </div>
  );
}
