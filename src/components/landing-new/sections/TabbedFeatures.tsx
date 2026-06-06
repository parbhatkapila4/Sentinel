"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { fadeUp, tabContent as tabContentVariants, VIEWPORT_ONCE } from "../motion";

const tabs = ["Risk scoring", "Champion detection", "Competitor radar", "Forecast truth meter"];
const icons: ReactNode[] = [
  <svg key="risk" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 4.6V8L10.6 9.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  <svg key="champion" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2.2 8h2.1l1.4-3.2 2.7 6.4 1.8-4H13.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
  </svg>,
  <svg key="competitor" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M13 8a5 5 0 1 1-1.2-3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M11.2 2.9h2.1V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 5.6v2.7l1.8 1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  <svg key="forecast" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2.4 12.8h11.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M3.2 11.2V4.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M4.7 9.6 7 7.1l2 1.8 2.5-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];
const bodies = [
  `0-100 risk index per opportunity, refreshed on a schedule, with reasons tied to source events.`,
  `See who actually owns the decision on large deals, not only the CRM primary contact.`,
  `Track where competitors appear in calls and threads before the opportunity decays.`,
  `Reconcile rep forecast rollups to signal-based views before quarter close.`,
];
const tabContent = [
  <>
    <div className="t-line"><span className="pre">$</span> sentinel deal score <span className="flag">--all</span></div>
    <span className="t-out ok">Pipeline scored in <span className="num">0.8s</span></span>
    <div className="t-empty-line" />
    <div className="t-line"><span className="pre">$</span> sentinel ask</div>
    <div className="t-claude"><div className="t-claude-icon" /><div className="t-claude-info"><span className="name">Sentinel</span><span className="ver">v1.0.4</span><span className="model">Workspace · risk index</span><span className="path">acme-corp / pipeline</span></div></div>
    <div className="t-divider" />
    <div className="t-instruction">Show me the highest-risk deals and what&apos;s driving the scores</div>
    <div className="t-divider-thin" />
    <span className="t-out">Analyzing 47 deals across <span className="num">12,403</span> signals...</span>
    <span className="t-out"><span className="num">3 deals</span> at high risk · <span className="num">5 deals</span> trending down</span>
    <div className="t-empty-line" />
    <span className="t-out ok">Acme Corp · score <span className="num">82</span> · champion dormant 14d</span>
    <span className="t-out ok">Northwind · score <span className="num">71</span> · competitor named 3×</span>
    <span className="t-out ok">Helix Co · score <span className="num">68</span> · stage age 3.1×</span>
    <div className="t-empty-line" />
    <span className="t-out"><span className="green-text">+ 3 high-risk</span> 5 medium 39 healthy</span>
  </>,
  <>
    <div className="t-line"><span className="pre">$</span> sentinel champion list <span className="flag">--dormant</span></div>
    <span className="t-out ok"><span className="num">8 champions</span> flagged dormant</span>
    <div className="t-empty-line" />
    <div className="t-line"><span className="pre">$</span> sentinel ask</div>
    <div className="t-claude"><div className="t-claude-icon" /><div className="t-claude-info"><span className="name">Sentinel</span><span className="ver">v1.0.4</span><span className="model">Workspace · risk index</span><span className="path">northwind / pipeline</span></div></div>
    <div className="t-divider" />
    <div className="t-instruction">Identify the actual decision-makers across our top 10 enterprise deals</div>
    <div className="t-divider-thin" />
    <span className="t-out">Cross-referencing email threads, call attendees, calendar invites...</span>
    <span className="t-out"><span className="num">94%</span> match rate vs. CRM primary contact (validation sample)</span>
    <div className="t-empty-line" />
    <span className="t-out ok">Sarah Chen (Acme) · last activity Mar 22 · dormant <span className="num">14d</span></span>
    <span className="t-out ok">James Park (Tessera) · re-engaged after <span className="num">9d</span> silence</span>
    <span className="t-out ok">Marcus Liu (Northwind) · primary economic buyer (not in CRM)</span>
  </>,
  <>
    <div className="t-line"><span className="pre">$</span> sentinel competitor track</div>
    <span className="t-out ok"><span className="num">12 mentions</span> across pipeline · <span className="num">3 active threats</span></span>
    <div className="t-empty-line" />
    <div className="t-line"><span className="pre">$</span> sentinel ask</div>
    <div className="t-claude"><div className="t-claude-icon" /><div className="t-claude-info"><span className="name">Sentinel</span><span className="ver">v1.0.4</span><span className="model">Workspace · risk index</span><span className="path">helix / pipeline</span></div></div>
    <div className="t-divider" />
    <div className="t-instruction">Where are competitors showing up in our deals before we lose them?</div>
    <div className="t-divider-thin" />
    <span className="t-out">Scanning recent calls for competitor name matches...</span>
    <span className="t-out"><span className="num">Fiveran</span> · 8 mentions · trending up <span className="num">+40%</span> MoM</span>
    <div className="t-empty-line" />
    <span className="t-out ok">Acme Corp · Fiveran named <span className="num">2×</span> in security review</span>
    <span className="t-out ok">Northwind · Salesforce named <span className="num">3×</span> by procurement</span>
    <span className="t-out ok">Helix · Apex Systems named <span className="num">1×</span> in procurement thread</span>
  </>,
  <>
    <div className="t-line"><span className="pre">$</span> sentinel forecast diff</div>
    <span className="t-out ok">Forecast variance: <span className="num">-25%</span> below stated</span>
    <div className="t-empty-line" />
    <div className="t-line"><span className="pre">$</span> sentinel ask</div>
    <div className="t-claude"><div className="t-claude-icon" /><div className="t-claude-info"><span className="name">Sentinel</span><span className="ver">v1.0.4</span><span className="model">Workspace · risk index</span><span className="path">forecast / qbr-prep</span></div></div>
    <div className="t-divider" />
    <div className="t-instruction">Compare the rep forecast to signal-based reality before the QBR</div>
    <div className="t-divider-thin" />
    <span className="t-out">Stated forecast: <span className="num">$2,400,000</span></span>
    <span className="t-out">Signal-based forecast: <span className="num">$1,800,000</span></span>
    <div className="t-empty-line" />
    <span className="t-out ok">Gap: <span className="num">$640K</span> across 6 deals (avg overestimate <span className="num">+34%</span>)</span>
    <span className="t-out ok">Confidence: <span className="num">91%</span> · backtest vs. 40 closed opportunities</span>
  </>,
];

export function TabbedFeatures() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [cycleId, setCycleId] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTabIndex((curr) => {
        const next = (curr + 1) % tabs.length;
        setCycleId((c) => c + 1);
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [cycleId]);

  const onClick = (idx: number) => {
    setActiveTabIndex(idx);
    setCycleId((c) => c + 1);
  };

  return (
    <motion.section
      id="features"
      className="features-section"
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={fadeUp}
    >
      <div className="features-inner">
        <div className="features-head">
          <div className="features-head-l">
            <div className="section-folio">04 · FEATURES</div>
            <div className="features-kicker">FEATURES</div>
            <h2 className="features-title">Pipeline intelligence from the<br /><em>systems</em> you already run</h2>
          </div>
          <div className="features-head-r">
            <p>Give reps scoring and cited reasons, not another raw CRM export.</p>
            <Link href="/contact">Contact us →</Link>
          </div>
        </div>
        <div className="features-grid">
          <div className="tabs-col">
            {tabs.map((tab, idx) => (
              <button className={`tab-card${activeTabIndex === idx ? " active" : ""}`} key={tab} onClick={() => onClick(idx)} type="button">
                <div className="tab-card-head">
                  <span className="tab-card-num">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="tab-card-icon" aria-hidden="true">{icons[idx]}</span>
                  <span className="tab-card-title">{tab}</span>
                </div>
                {activeTabIndex === idx ? <div className="tab-card-body">{bodies[idx]}</div> : null}
                {activeTabIndex === idx ? <div className="tab-card-progress" key={`progress-${activeTabIndex}-${cycleId}`} /> : null}
              </button>
            ))}
          </div>
          <div className="tab-display">
            <div className="tab-display-head"><span className="live-dot" /> <span>job: sentinel-score</span><span className="pid">pid 4721</span></div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTabIndex}
                className="tab-content active"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {tabContent[activeTabIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
