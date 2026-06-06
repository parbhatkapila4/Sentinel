"use client";

import { motion, useReducedMotion } from "motion/react";
import { fadeUp, staggerContainer, staggerItem, VIEWPORT_ONCE } from "../motion";

export function CustomerImpact() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      className="impact-section"
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={fadeUp}
    >
      <div className="impact-inner">
        <div className="impact-head">
          <div className="impact-head-l">
            <div className="section-folio">08 · CUSTOMER IMPACT</div>
            <div className="impact-kicker">CUSTOMER IMPACT</div>
            <h2 className="impact-title">Built for revenue teams<br />moving <em>fast at scale</em></h2>
          </div>
        </div>
        <div className="impact-grid">
          <div className="impact-photo"><img className="impact-photo-img" src="/Picture%202.jpg" alt="Founder portrait" /><div className="corner-tag">PHOTO · FOUNDER · 2026</div></div>
          <div className="impact-r">
            <div className="impact-quote-block">
              <div className="impact-quote">&ldquo;I built Sentinel because most pipeline tools optimize for dashboards, not decisions. <span className="dim">Our goal is simple: give every founder and revenue leader a truthful, signal-based read of deal risk before silence turns into a miss.</span>&rdquo;</div>
              <div><div className="impact-attr">Founder&apos;s note</div><div className="impact-attr-role">Sentinel</div></div>
            </div>
            <motion.div
              className="impact-stats"
              initial={reduceMotion ? "visible" : "hidden"}
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={staggerContainer}
            >
              <motion.div className="impact-stat" variants={staggerItem}>
                <div className="impact-stat-num">0–100</div>
                <div className="impact-stat-label">Risk Index</div>
              </motion.div>
              <motion.div className="impact-stat" variants={staggerItem}>
                <div className="impact-stat-num">AES-256</div>
                <div className="impact-stat-label">GCM at Rest</div>
              </motion.div>
              <motion.div className="impact-stat" variants={staggerItem}>
                <div className="impact-stat-num">Daily</div>
                <div className="impact-stat-label">CRM Sync</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
