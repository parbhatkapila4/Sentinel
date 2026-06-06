"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { NavAuthActions } from "./NavAuthActions";
import { EASE_OUT } from "../motion";

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <img className="brand-logo-img" src="/Sentinel%20New%20logo.png" alt="Sentinel logo" />
      <span className="brand-wordmark">Sentinel</span>
    </div>
  );
}

export function Nav() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.nav
      className="nav"
      aria-label="Primary"
      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
    >
      <div className="nav-inner">
        <Link className="brand" href="/#top">
          <BrandMark />
          <span className="brand-tag">v1.0.4</span>
        </Link>
        <div className="nav-links">
          <Link className="nav-link" href="/features">
            Product
          </Link>
          <Link className="nav-link" href="/pricing">
            Pricing
          </Link>
          <Link className="nav-link" href="/docs">
            Docs
          </Link>
          <Link className="nav-link" href="/changelog">
            Changelog
          </Link>
          <Link className="nav-link" href="/security">
            Security
          </Link>
        </div>
        <NavAuthActions />
      </div>
    </motion.nav>
  );
}
