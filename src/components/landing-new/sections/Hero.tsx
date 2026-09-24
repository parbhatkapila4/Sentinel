"use client";

import { motion, useReducedMotion } from "motion/react";
import { HeroAuthCTAs } from "./HeroAuthCTAs";
import {
  heroPanel,
  heroTitle,
  staggerContainer,
  staggerItem,
} from "../motion";

export function Hero() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? "visible" : "hidden";

  return (
    <section id="top" className="hero-wrap">
      <div className="hero">
        <motion.div
          className="hero-left"
          initial={initial}
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div className="trust-badge" variants={staggerItem}>
            <div className="trust-mark">✓</div>
            <span>Read-only by design · Built for modern revenue teams</span>
          </motion.div>
          <motion.h1 className="hero-h" variants={heroTitle}>
            Every deal has a
            <br />
            <span className="green-text">heartbeat.</span>
            <br />
            We read it.<span className="cursor-block" />
          </motion.h1>
          <motion.p className="hero-sub" variants={staggerItem}>
            Sentinel connects <b>Salesforce, HubSpot, and Google Calendar</b>{" "}
            (read-only), routes alerts through <b>Slack</b> and{" "}
            <b>HMAC-signed webhooks</b>, then scores every deal{" "}
            <b>0.00-1.00</b> from stage, value, and activity recency. See
            <a href="/integrations" className="hero-sub-link">
              {" "}
              integrations
            </a>{" "}
            for exact scopes.
          </motion.p>
          <motion.div variants={staggerItem}>
            <HeroAuthCTAs />
          </motion.div>
          <motion.div className="hero-trust" variants={staggerItem}>
            <span className="hero-trust-item"><span className="check-mini">✓</span>Read-only by default</span>
            <span className="hero-trust-item"><span className="check-mini">✓</span>TLS + encrypted tokens</span>
            <span className="hero-trust-item"><span className="check-mini">✓</span>No shared-model training</span>
            <span className="hero-trust-item"><span className="check-mini">✓</span>Tokens deleted on disconnect</span>
          </motion.div>
          <motion.div className="hero-substats" variants={staggerItem}>
            <div className="substat"><div className="substat-num"><span className="green-text">0-1</span></div><div className="substat-lbl">Risk score</div></div>
            <div className="substat"><div className="substat-num"><span className="green-text">Daily</span></div><div className="substat-lbl">CRM sync</div></div>
            <div className="substat"><div className="substat-num"><span className="green-text">HMAC</span></div><div className="substat-lbl">Webhook signing</div></div>
            <div className="substat"><div className="substat-num"><span className="green-text">AES-256</span></div><div className="substat-lbl">GCM · tokens at rest</div></div>
          </motion.div>
        </motion.div>
        <motion.div
          className="hero-right"
          initial={initial}
          animate="visible"
          variants={heroPanel}
        >
          <div className="hero-product-wrap theme-current">
            <div className="hp-annotation">
              <span className="hp-ann-pulse" />
              <span className="hp-ann-text">EXAMPLE <b>DEAL VIEW</b></span>
            </div>
            <div className="hero-product">
              <div className="hp-chrome">
                <div className="term-dots-mini"><span /><span /><span /></div>
                <div className="hp-url"><span className="hp-lock">●</span><b>sentinels.in</b><span className="hp-path">/pipeline/at-risk</span></div>
                <div className="hp-tools">⌘K</div>
              </div>
              <div className="hp-status">
                <span className="hp-stat-item"><span className="hp-pulse" />4 CONNECTED SOURCES</span>
                <span className="hp-stat-spacer" />
                <span className="hp-stat-item live"><span className="hp-pulse-green" />EXAMPLE</span>
              </div>
              <div className="hp-body">
                <div className="hp-deal-head">
                  <div className="hp-deal-l">
                    <div className="hp-deal-meta">SENTINEL · ACME CORP · EXAMPLE DATA</div>
                    <div className="hp-deal-name">Acme Corp.</div>
                    <div className="hp-deal-tags">
                      <span className="hp-tag">ENTERPRISE</span>
                      <span className="hp-tag">STAGE 4 / 6</span>
                      <span className="hp-tag flag">⚑ AT RISK</span>
                    </div>
                  </div>
                  <div className="hp-deal-r">
                    <div className="hp-deal-amt">$247K</div>
                    <div className="hp-deal-delta">SCORE ↑ FROM 0.34 TO 0.82</div>
                  </div>
                </div>
                <div className="hp-signals">
                  <div className="hp-risk-gauge">
                    <div className="hp-gauge-ring">
                      <div className="hp-gauge-core">
                        <div className="hp-gauge-score">0.82</div>
                        <div className="hp-gauge-max">/ 1.00</div>
                        <div className="hp-gauge-label">HIGH RISK</div>
                      </div>
                    </div>
                  </div>
                  <div className="hp-signal-list">
                    <div className="hp-signal-row">
                      <span className="hp-signal-left"><span className="hp-signal-dot red" />No inbound reply</span>
                      <span className="hp-signal-right">14d</span>
                    </div>
                    <div className="hp-signal-row">
                      <span className="hp-signal-left"><span className="hp-signal-dot red" />Competitor keyword in timeline</span>
                      <span className="hp-signal-right">2×</span>
                    </div>
                    <div className="hp-signal-row">
                      <span className="hp-signal-left"><span className="hp-signal-dot amber" />Stage age vs average</span>
                      <span className="hp-signal-right">2.4×</span>
                    </div>
                  </div>
                </div>
                <div className="hp-diag">
                  <div className="hp-diag-head">
                    <span className="hp-diag-tag"><span className="hp-spark" />SENTINEL · BRIEF</span>
                    <span className="hp-diag-meta">4 SOURCES</span>
                  </div>
                  <div className="hp-diag-body">Acme has been <em>silent for 14 days</em> since the security review. No inbound reply from the customer side, and a competitor keyword matched twice in its timeline events. Route to <u>Marcus</u> before Friday. <em>Win probability 68%</em>.<span className="hp-caret" /></div>
                </div>
                <div className="hp-actions">
                  <button className="hp-action hi" type="button"><span className="hp-action-lbl">SUGGESTED · HIGH IMPACT</span><span className="hp-action-text">Draft re-engagement email</span></button>
                  <button className="hp-action" type="button"><span className="hp-action-lbl">MEDIUM</span><span className="hp-action-text">Route to Marcus (CTO)</span></button>
                  <button className="hp-action" type="button"><span className="hp-action-lbl">LOW</span><span className="hp-action-text">Set follow-up</span></button>
                </div>
                <div className="hp-foot">
                  <span className="hp-foot-lbl">WIN PROBABILITY</span>
                  <div className="hp-foot-bar"><div className="hp-foot-fill" /></div>
                  <span className="hp-foot-val">68%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
