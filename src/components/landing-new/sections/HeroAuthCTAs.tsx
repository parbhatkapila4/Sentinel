"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import {
  getYoutubeEmbedUrl,
  shouldUseVideoElement,
} from "@/lib/walkthrough-video";
import { WalkthroughVideoModal } from "./WalkthroughVideoModal";

function walkthroughOpensInModal(url: string): boolean {
  const t = url.trim();
  if (!t) return false;
  if (getYoutubeEmbedUrl(t)) return true;
  if (shouldUseVideoElement(t)) return true;
  return false;
}

const DEFAULT_WALKTHROUGH_VIDEO_URL = "/Loom-Sentinel.mp4";

export function HeroAuthCTAs() {
  const { user, isLoaded } = useUser();
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);

  const walkthroughUrl =
    process.env.NEXT_PUBLIC_WALKTHROUGH_VIDEO_URL?.trim() ||
    DEFAULT_WALKTHROUGH_VIDEO_URL;

  if (!isLoaded) {
    return (
      <div className="hero-cta-row" aria-busy="true">
        <span className="btn-fill landing-cta-skeleton" aria-hidden>
          Start free <span className="arr">→</span>
        </span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="hero-cta-row">
        <Link className="btn-outline" href="/docs">
          Read docs <span className="arr">→</span>
        </Link>
        <Link className="btn-outline" href="/security">
          Security <span className="arr">→</span>
        </Link>
      </div>
    );
  }

  const secondaryWalkthrough =
    walkthroughUrl && walkthroughOpensInModal(walkthroughUrl) ? (
      <>
        <button
          type="button"
          className="btn-outline"
          onClick={() => setWalkthroughOpen(true)}
        >
          ▶ See how it works
        </button>
        <WalkthroughVideoModal
          url={walkthroughUrl}
          open={walkthroughOpen}
          onClose={() => setWalkthroughOpen(false)}
        />
      </>
    ) : walkthroughUrl ? (
      <button
        type="button"
        className="btn-outline"
        onClick={() => window.open(walkthroughUrl, "_blank", "noopener,noreferrer")}
      >
        ▶ See how it works <span className="muted-meta">2 min</span>
      </button>
    ) : (
      <Link className="btn-outline" href="/how">
        ▶ See how it works <span className="muted-meta">2 min</span>
      </Link>
    );

  return (
    <div className="hero-cta-row">
      <Link className="btn-fill" href="/sign-in">
        Start free <span className="arr">→</span>
      </Link>
      {secondaryWalkthrough}
    </div>
  );
}
