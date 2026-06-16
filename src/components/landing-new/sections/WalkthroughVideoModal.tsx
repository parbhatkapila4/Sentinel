"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  getYoutubeEmbedUrl,
  shouldUseVideoElement,
} from "@/lib/walkthrough-video";

type Props = {
  url: string;
  open: boolean;
  onClose: () => void;
};

export function WalkthroughVideoModal({ url, open, onClose }: Props) {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onKeyDown]);

  if (!open || typeof document === "undefined") return null;

  const trimmed = url.trim();
  const youtubeEmbed = getYoutubeEmbedUrl(trimmed);
  const useVideo = shouldUseVideoElement(trimmed);

  return createPortal(
    <div
      className="walkthrough-modal-root"
      role="dialog"
      aria-modal="true"
      aria-label="Product walkthrough video"
    >
      <button
        type="button"
        className="walkthrough-modal-backdrop"
        aria-label="Close video"
        onClick={onClose}
      />
      <div className="walkthrough-modal-panel">
        <div className="walkthrough-modal-chrome">
          <span className="walkthrough-modal-title">Walkthrough</span>
          <button
            type="button"
            className="walkthrough-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div
          className={`walkthrough-modal-frame ${
            youtubeEmbed ? "is-embed" : "is-video"
          }`}
        >
          {youtubeEmbed ? (
            <iframe
              src={`${youtubeEmbed}?rel=0`}
              title="Walkthrough"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="walkthrough-modal-iframe"
            />
          ) : useVideo ? (
            <video
              className="walkthrough-modal-video"
              controls
              playsInline
              preload="metadata"
              src={trimmed}
            >
              Your browser does not support the video tag.
            </video>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
