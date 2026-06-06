"use client";

import { motion, useReducedMotion } from "motion/react";
import { fadeUp, staggerContainer, staggerItem, VIEWPORT_ONCE } from "../motion";

const ROWS: Array<[string, string, string, "dim" | "icon"]> = [
  ["Risk Detection", "Days / Weeks", "Real-time", "dim"],
  ["Data Sources", "CRM only", "CRM + calendar + email + calls", "dim"],
  ["Score attribution", "Opaque", "Inputs cited per score", "dim"],
  ["Forecast Accuracy", "Rep optimism", "Signal-based truth", "dim"],
  ["Setup Time", "2-4 weeks", "< 4 minutes", "dim"],
  ["One-click action drafts", "✕", "✓", "icon"],
];

export function ComparisonTable() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      id="comparison"
      className="compare-section"
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={fadeUp}
    >
      <div className="compare-inner">
        <div className="compare-head">
          <div className="compare-head-l">
            <div className="section-folio">06 · COMPARISON</div>
            <div className="compare-kicker">COMPARISON</div>
            <h2 className="compare-title">Why modern revenue teams<br />use <em>Sentinel</em></h2>
          </div>
        </div>
        <motion.table
          className="compare-table"
          initial={reduceMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={staggerContainer}
        >
          <tbody>
            <tr><th></th><th>Traditional CRM</th><th>Sentinel</th></tr>
            {ROWS.map(([label, traditional, sentinel, kind]) => (
              <motion.tr key={label} variants={staggerItem}>
                <td>{label}</td>
                {kind === "icon" ? (
                  <>
                    <td><span className="x-icon">{traditional}</span></td>
                    <td><span className="check-icon">{sentinel}</span></td>
                  </>
                ) : (
                  <>
                    <td className="dim">{traditional}</td>
                    <td className="bright">{sentinel}</td>
                  </>
                )}
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
        <div className="custom-plan">
          <div className="custom-plan-text">
            <h4>Need a custom plan?</h4>
            <p>We can tailor workflows, integrations, and limits to fit your team&apos;s needs.</p>
          </div>
          <a className="btn-outline" href="mailto:parbhat@parbhat.work">
            Talk to the founder →
          </a>
        </div>
      </div>
    </motion.section>
  );
}
