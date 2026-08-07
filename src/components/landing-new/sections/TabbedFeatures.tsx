"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { fadeUp, tabContent as tabContentVariants, VIEWPORT_ONCE } from "../motion";

const tabs = ["Risk scoring", "Champion dormancy", "Competitor keywords", "Pipeline forecast"];
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
  `0.00-1.00 composite risk score per opportunity, recomputed on read, with reasons tied to source events.`,
  `Flag deals where no inbound reply has arrived in 14 days. Opt-in signal, off by default.`,
  `Track where competitor keywords appear in email threads and notes before the opportunity decays.`,
  `Weight pipeline value by a heuristic win probability instead of rep-reported commit.`,
];
const tabContent = [
  <>
    <div className="t-line"><span className="pre">$</span> sentinel deal score <span className="flag">--all</span></div>
    <span className="t-out ok">Risk recomputed from timeline events</span>
    <div className="t-empty-line" />
    <div className="t-line"><span className="pre">$</span> sentinel ask</div>
    <div className="t-claude"><div className="t-claude-icon" /><div className="t-claude-info"><span className="name">Sentinel</span><span className="ver">v1.0.4</span><span className="model">Risk index · illustrative</span><span className="path">acme-corp / pipeline</span></div></div>
    <div className="t-divider" />
    <div className="t-instruction">Show me the highest-risk deals and what&apos;s driving the scores</div>
    <div className="t-divider-thin" />
    <span className="t-out">Scoring open deals from stage, value and activity...</span>
    <span className="t-out"><span className="num">3 deals</span> at high risk · <span className="num">5 deals</span> trending down</span>
    <div className="t-empty-line" />
    <span className="t-out ok">Acme Corp · score <span className="num">0.82</span> · no inbound reply 14d</span>
    <span className="t-out ok">Northwind · score <span className="num">0.71</span> · competitor keyword 3×</span>
    <span className="t-out ok">Helix Co · score <span className="num">0.68</span> · stage age 3.1×</span>
    <div className="t-empty-line" />
    <span className="t-out"><span className="green-text">+ 3 high-risk</span> 5 medium 39 healthy</span>
  </>,
  <>
    <div className="t-line"><span className="pre">$</span> sentinel deal list <span className="flag">--dormant</span></div>
    <span className="t-out ok"><span className="num">8 deals</span> with no inbound reply in 14 days</span>
    <div className="t-empty-line" />
    <div className="t-line"><span className="pre">$</span> sentinel ask</div>
    <div className="t-claude"><div className="t-claude-icon" /><div className="t-claude-info"><span className="name">Sentinel</span><span className="ver">v1.0.4</span><span className="model">Risk index · illustrative</span><span className="path">northwind / pipeline</span></div></div>
    <div className="t-divider" />
    <div className="t-instruction">Which deals have gone quiet on the customer side?</div>
    <div className="t-divider-thin" />
    <span className="t-out">Checking last inbound email per deal...</span>
    <span className="t-out">Champion-dormancy signal is opt-in · enable in risk settings</span>
    <div className="t-empty-line" />
    <span className="t-out ok">Acme · last inbound Mar 22 · dormant <span className="num">14d</span></span>
    <span className="t-out ok">Tessera · inbound resumed after <span className="num">9d</span> silence</span>
    <span className="t-out ok">Northwind · no inbound since stage change</span>
  </>,
  <>
    <div className="t-line"><span className="pre">$</span> sentinel competitor track</div>
    <span className="t-out ok"><span className="num">12 keyword matches</span> across pipeline</span>
    <div className="t-empty-line" />
    <div className="t-line"><span className="pre">$</span> sentinel ask</div>
    <div className="t-claude"><div className="t-claude-icon" /><div className="t-claude-info"><span className="name">Sentinel</span><span className="ver">v1.0.4</span><span className="model">Risk index · illustrative</span><span className="path">helix / pipeline</span></div></div>
    <div className="t-divider" />
    <div className="t-instruction">Where is competitive pressure showing up in our deals?</div>
    <div className="t-divider-thin" />
    <span className="t-out">Scanning email, notes and Slack text for competitor keywords...</span>
    <span className="t-out">Matches raise the risk score and are cited as a reason</span>
    <div className="t-empty-line" />
    <span className="t-out ok">Acme Corp · &quot;comparing solutions&quot; matched <span className="num">2×</span></span>
    <span className="t-out ok">Northwind · &quot;other vendor&quot; matched <span className="num">3×</span></span>
    <span className="t-out ok">Helix · &quot;pricing comparison&quot; matched <span className="num">1×</span></span>
  </>,
  <>
    <div className="t-line"><span className="pre">$</span> sentinel forecast</div>
    <span className="t-out ok">Pipeline weighted by heuristic win probability</span>
    <div className="t-empty-line" />
    <div className="t-line"><span className="pre">$</span> sentinel ask</div>
    <div className="t-claude"><div className="t-claude-icon" /><div className="t-claude-info"><span className="name">Sentinel</span><span className="ver">v1.0.4</span><span className="model">Forecast · illustrative</span><span className="path">forecast / qbr-prep</span></div></div>
    <div className="t-divider" />
    <div className="t-instruction">Show the weighted pipeline next to the raw total</div>
    <div className="t-divider-thin" />
    <span className="t-out">Raw open pipeline: <span className="num">$2,400,000</span></span>
    <span className="t-out">Weighted (expected): <span className="num">$1,800,000</span></span>
    <div className="t-empty-line" />
    <span className="t-out ok">Best / worst case bands from the same weights</span>
    <span className="t-out ok">Inputs: historical win rate · stage · risk level · recency</span>
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
