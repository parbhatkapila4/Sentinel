"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

type Props = {
  secondaryHref: string;
  secondaryLabel: ReactNode;
};

export function FeatureBlockCTA({ secondaryHref, secondaryLabel }: Props) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="feature-cta" aria-busy="true">
        <span className="feature-cta-btn landing-cta-skeleton" aria-hidden>
          Start free
        </span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="feature-cta">
        <Link href={secondaryHref} className="feature-cta-link">
          {secondaryLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="feature-cta">
      <Link href="/sign-in" className="feature-cta-btn">
        Start free
      </Link>
      <Link href={secondaryHref} className="feature-cta-link">
        {secondaryLabel}
      </Link>
    </div>
  );
}
