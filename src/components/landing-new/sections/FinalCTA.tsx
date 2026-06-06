"use client";

import { motion, useReducedMotion } from "motion/react";
import { FinalCTAActions } from "./FinalCTAActions";
import { fadeUp, VIEWPORT_ONCE } from "../motion";

export function FinalCTA() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      id="final"
      className="final-section"
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={fadeUp}
    >
      <div className="final-box">
        <h2 className="final-h">Ship revenue motion<br /><span className="green-text">with clearer risk</span></h2>
        <p className="final-sub">Free tier covers up to 25 open deals. Upgrade when you need more seats or volume.</p>
        <FinalCTAActions />
      </div>
    </motion.section>
  );
}
