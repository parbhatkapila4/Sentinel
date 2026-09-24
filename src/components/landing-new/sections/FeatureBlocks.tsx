"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FeatureBlockCTA } from "./FeatureBlockCTA";
import { fadeUp, VIEWPORT_ONCE } from "../motion";

type FeatureBlockProps = { reverse?: boolean; terminal: ReactNode; copy: ReactNode };

function FeatureBlock({ reverse, terminal, copy }: FeatureBlockProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      className="feature-section"
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={fadeUp}
    >
      <div className={`feature-block${reverse ? " reverse" : ""}`}>
        <div className="feature-terminal">{terminal}</div>
        <div className="feature-copy">{copy}</div>
      </div>
    </motion.section>
  );
}

export function FeatureBlocks() {
  return (
    <>
      <FeatureBlock
        terminal={
          <div className="term-frame diagnose-ui">
            <div className="term-mini-head"><div className="term-dots-mini"><span /><span /><span /></div><div className="term-mini-title"><b>~/sentinel</b> · deal flag + diagnose</div><span className="term-mini-tag">EXAMPLE</span></div>
            <div className="term-frame-body">
              <div className="t-line"><span className="pre">$</span> sentinel deal flag <span className="flag">--threshold</span> <span className="str">&quot;high&quot;</span></div>
              <span className="t-out ok"><span className="num">3 deals</span> flagged at-risk</span>
              <div className="t-empty-line" />
              <div className="t-line"><span className="pre">$</span> sentinel ask</div>
              <div className="t-claude"><div className="t-claude-icon" /><div className="t-claude-info"><span className="name">Sentinel</span><span className="model">Risk index · illustrative</span><span className="path">acme-corp / pipeline</span></div></div>
              <div className="t-divider" />
              <div className="t-instruction"><span className="diag-arrow">›</span> Diagnose Acme Corp and draft outreach for champion re-engagement</div>
              <div className="t-divider-thin" />
              <div className="t-empty-line" />
              <span className="t-out">Recomputing risk from timeline events...</span>
              <div className="t-progress"><div className="t-progress-bar" /></div>
              <div className="t-progress-meta"><span>email · calendar · slack · crm</span><span>illustrative</span></div>
              <div className="t-empty-line" />
              <span className="t-out ok">No inbound email for <span className="warn-text">14 days</span> · champion-dormancy signal</span>
              <span className="t-out ok">Competitor keyword matched <span className="warn-text">2×</span> in timeline events</span>
              <span className="t-out ok">Stage age <span className="warn-text">2.4× average</span> · stage-stall signal</span>
              <div className="t-empty-line" />
              <span className="t-out"><span className="green-text">+ Reason label attached</span> · draft ready in /actions/acme-001</span>
            </div>
          </div>
        }
        copy={
          <>
            <div className="feature-folio">01 · STOP DEAL SLIPPAGE</div>
            <div className="feature-eyebrow">Stop deal slippage</div>
            <h2 className="feature-h">Catch at-risk deals before they reach <em>silence</em></h2>
            <p className="feature-body">Give reps and leaders one read on deal health: synced inputs, scheduled refresh, and a rule-based reason on every at-risk deal. <b>Surface risk before the thread goes quiet.</b></p>
            <div className="feature-meta"><div className="feature-meta-item"><span className="check">✓</span>Daily CRM sync</div><div className="feature-meta-item"><span className="check">✓</span>Recomputed on read, cached briefly</div><div className="feature-meta-item"><span className="check">✓</span>Rule-based reasons</div></div>
            <FeatureBlockCTA
              secondaryHref="/docs"
              secondaryLabel={
                <>
                  Read docs
                </>
              }
            />
          </>
        }
      />
      <div className="hatch" aria-hidden="true" />
      <FeatureBlock
        reverse
        terminal={
          <div className="term-frame diagnose-ui">
            <div className="term-mini-head"><div className="term-dots-mini"><span /><span /><span /></div><div className="term-mini-title"><b>~/sentinel/audit</b> · read-only verification</div><span className="term-mini-tag">EXAMPLE</span></div>
            <div className="term-frame-body">
              <div className="t-line"><span className="pre">$</span> sentinel connector add <span className="arg">hubspot</span> <span className="flag">--scope</span> <span className="str">&quot;read-only&quot;</span></div>
              <span className="t-out ok">Connector &apos;hubspot&apos; authorized via OAuth redirect</span>
              <div className="t-empty-line" />
              <div className="t-line"><span className="pre">$</span> sentinel ask</div>
              <div className="t-claude"><div className="t-claude-icon" /><div className="t-claude-info"><span className="name">Sentinel</span><span className="model">Connectors · illustrative</span><span className="path">connectors / read-only</span></div></div>
              <div className="t-divider" />
              <div className="t-instruction"><span className="diag-arrow">›</span> Verify all connectors are read-only and show what is stored</div>
              <div className="t-divider-thin" />
              <div className="t-empty-line" />
              <span className="t-out">Checking granted OAuth scopes...</span>
              <span className="t-out">Checking ingestion gate...</span>
              <div className="t-empty-line" />
              <span className="t-out ok">Scopes: <span className="value">read-only</span> · no write scope requested</span>
              <span className="t-out ok">Deal data scoped to your <span className="value">account and teams</span></span>
              <span className="t-out ok">Messages persisted only with a CRM-matched participant</span>
              <div className="t-empty-line" />
              <div className="t-line"><span className="pre">$</span> sentinel integration log</div>
              <span className="t-out"><span className="label">Writes to your CRM:</span><span className="value"> <span className="num">0</span></span></span>
              <span className="t-out"><span className="label">Tokens at rest:</span><span className="value"> AES-256-GCM</span></span>
              <span className="t-out"><span className="label">Filter logs:</span><span className="value"> outcome counts only · no emails, no bodies</span></span>
              <div className="t-empty-line" />
              <span className="t-out ok"><span className="green-text">Read-only posture.</span> Sentinel never writes back to a connected system.</span>
            </div>
          </div>
        }
        copy={
          <>
            <div className="feature-folio">02 · READ-ONLY BY DESIGN</div>
            <div className="feature-eyebrow">Read-only by design</div>
            <h2 className="feature-h">Read-only access. <em>Security-first</em> from day one.</h2>
            <p className="feature-body">Sentinel never writes back to your CRM. Never trains shared models on your data. Deal data is scoped to your account and the teams you&apos;re in. <b>A message is ingested only if a participant is already in your CRM.</b></p>
            <div className="feature-meta"><div className="feature-meta-item"><span className="check">✓</span>Read-only OAuth scopes</div><div className="feature-meta-item"><span className="check">✓</span>No shared-model training</div><div className="feature-meta-item"><span className="check">✓</span>Tokens deleted on disconnect</div></div>
            <FeatureBlockCTA
              secondaryHref="/security"
              secondaryLabel={
                <>
                  Security docs
                </>
              }
            />
          </>
        }
      />
      <div className="hatch" aria-hidden="true" />
      <FeatureBlock
        terminal={
          <div className="term-frame bench-ui">
            <div className="term-mini-head"><div className="term-dots-mini"><span /><span /><span /></div><div className="term-mini-title"><b>~/sentinel/pipeline</b> · scoring run</div><span className="term-mini-tag">EXAMPLE</span></div>
            <div className="term-frame-body">
              <div className="t-line"><span className="pre">$</span> sentinel scan <span className="flag">--all-sources</span></div>
              <span className="t-out"><span className="num">4 sources</span> · hubspot, salesforce, calendar, slack</span>
              <div className="t-empty-line" />
              <div className="t-line"><span className="pre">$</span> sentinel deal score</div>
              <span className="t-out ok">Risk recomputed from timeline events on read, cached briefly</span>
              <span className="t-out"><span className="label">Inputs:</span> <span className="value">stage, value, activity recency, competitor keywords</span></span>
              <span className="t-out"><span className="label">Output:</span> <span className="value">score + rule-based reasons</span></span>
              <span className="t-out"><span className="label">Runtime:</span> <span className="value">Vercel serverless</span></span>
              <div className="t-empty-line" />
              <div className="t-line"><span className="pre">$</span> sentinel deal info <span className="arg">acme-corp</span></div>
              <span className="t-out"><span className="label">Deal:</span> <span className="value"><span className="blue-text">acme-corp</span></span></span>
              <span className="t-out"><span className="label">Status:</span> <span className="value"><span className="green-text">at_risk</span></span></span>
              <span className="t-out"><span className="label">Stage:</span> <span className="value">negotiation</span></span>
              <span className="t-out"><span className="label">Risk:</span> <span className="value"><span className="num">0.82</span> / 1.00 <span className="red-text">(HIGH)</span></span></span>
              <span className="t-out"><span className="label">Sources:</span> <span className="value">3 (hubspot, gmail, slack)</span></span>
              <span className="t-out"><span className="label">Reasons:</span> <span className="value">no activity 14d · negotiation stalled</span></span>
              <div className="t-empty-line" />
              <span className="t-out ok">At-risk scores carry rule-based reason labels.</span>
            </div>
          </div>
        }
        copy={
          <>
            <div className="feature-folio">03 · AUDITABLE SCORING</div>
            <div className="feature-eyebrow">Auditable scoring</div>
            <h2 className="feature-h">At-risk deals show <em>a reason</em></h2>
            <p className="feature-body">Risk is not stored with the deal: it is recomputed from timeline events on read and cached briefly. <b>Each at-risk deal shows a reason from a fixed rule set.</b></p>
            <div className="feature-meta"><div className="feature-meta-item"><span className="check">✓</span>Recomputed on read, cached briefly</div><div className="feature-meta-item"><span className="check">✓</span>Rule-based reasons</div><div className="feature-meta-item"><span className="check">✓</span>Configurable thresholds</div></div>
            <FeatureBlockCTA
              secondaryHref="/docs/developers"
              secondaryLabel={
                <>
                  Architecture
                </>
              }
            />
          </>
        }
      />
    </>
  );
}
