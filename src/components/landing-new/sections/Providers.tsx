"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  cardHover,
  fadeUp,
  staggerContainer,
  staggerItem,
  VIEWPORT_ONCE,
} from "../motion";

export function Providers() {
  const reduceMotion = useReducedMotion();

  const providers = [
    {
      name: "HubSpot",
      iconClass: "hubspot",
      logo: "/HUbspot-B.png",
      alt: "HubSpot logo",
      desc: "Read deals, contacts, stages, and activity history with private-app token auth and read-only pipeline sync.",
      connected: true,
    },
    {
      name: "Salesforce",
      iconClass: "salesforce",
      logo: "/Salesforce-b.png",
      alt: "Salesforce logo",
      desc: "Enterprise sync for opportunities, contacts, and stage movement.",
      connected: true,
    },
    {
      name: "Gmail",
      iconClass: "gmail",
      logo: "/MAIL-B.png",
      alt: "Gmail logo",
      desc: "Thread-level ingest with read-only OAuth scopes and sentiment extraction.",
      connected: true,
    },
    {
      name: "Google Calendar",
      iconClass: "calendar",
      logo: "/CALENDAR%20-B.png",
      alt: "Google Calendar logo",
      desc: "Event-level OAuth ingest, filtered to meetings with CRM-known attendees.",
      connected: true,
    },
    {
      name: "Slack",
      iconClass: "slack",
      logo: "/SLACK-B.png",
      alt: "Slack logo",
      desc: "Internal alerts and summary digests from real pipeline events.",
      connected: true,
    },
  ];

  return (
    <motion.section
      className="providers-section"
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={fadeUp}
    >
      <div className="providers-inner">
        <div className="providers-head">
          <div className="providers-head-l">
            <div className="section-folio">07 · INTEGRATIONS</div>
            <div className="providers-kicker">READS FROM THE STACK YOU ALREADY USE</div>
            <h2 className="providers-title">Designed for the tools<br />your team <em>lives in</em></h2>
          </div>
        </div>
        <motion.div
          className="providers-grid"
          initial={reduceMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={staggerContainer}
        >
          <motion.article
            className="provider-card featured"
            variants={staggerItem}
            whileHover={reduceMotion ? undefined : cardHover}
          >
            <div className="provider-img"><span className="provider-status">CONNECTED</span><div className="provider-icon hubspot"><img className="provider-logo" src="/HUbspot-B.png" alt="HubSpot logo" /></div></div>
            <div className="provider-info"><div className="provider-name">HubSpot <span className="arrow">→</span></div><div className="provider-desc">Read deals, contacts, stages, and activity history. OAuth connect flow and read-only pipeline sync.</div></div>
            <div className="provider-foot"><span>OAUTH · 2-CLICK</span><span className="provider-foot-ok">READ-ONLY</span></div>
          </motion.article>
          {providers.slice(1).map((provider) => (
            <motion.article
              className="provider-card"
              key={provider.name}
              variants={staggerItem}
              whileHover={reduceMotion ? undefined : cardHover}
            >
              <div className="provider-img">
                <span className="provider-status">
                  {provider.connected ? "CONNECTED" : "AVAILABLE"}
                </span>
                <div className={`provider-icon ${provider.iconClass}`}>
                  <img className="provider-logo" src={provider.logo} alt={provider.alt} />
                </div>
              </div>
              <div className="provider-info">
                <div className="provider-name">
                  {provider.name} <span className="arrow">→</span>
                </div>
                <div className="provider-desc">{provider.desc}</div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
