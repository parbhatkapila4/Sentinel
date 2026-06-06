"use client";

import { motion, useReducedMotion } from "motion/react";
import { staggerContainer, staggerItem, VIEWPORT_ONCE } from "../motion";

const LOGOS = [
  "Salesforce",
  "HubSpot",
  "Google Calendar",
  "Slack",
  "Webhooks",
  "Audit Logs",
];

export function LogoGrid() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      className="logo-grid-wrap"
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={staggerContainer}
    >
      <motion.span className="logo-grid-label" variants={staggerItem}>
        READ-ONLY ARCHITECTURE · AUDITABLE RISK SCORING
      </motion.span>
      <div className="logo-grid">
        {LOGOS.map((label) => (
          <motion.div className="logo-cell" key={label} variants={staggerItem}>
            <span className="lg-text">{label}</span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
