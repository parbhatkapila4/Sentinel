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
            <div className="term-mini-head"><div className="term-dots-mini"><span /><span /><span /></div><div className="term-mini-title"><b>~/sentinel</b> · deal flag + diagnose</div><span className="term-mini-tag">LIVE</span></div>
            <div className="term-frame-body">
              <div className="t-line"><span className="pre">$</span> sentinel deal flag <span className="flag">--threshold</span> <span className="str">&quot;high&quot;</span></div>
              <span className="t-out ok"><span className="num">3 deals</span> flagged at-risk in <span className="num">0.6s</span></span>
              <div className="t-empty-line" />
              <div className="t-line"><span className="pre">$</span> sentinel ask</div>
              <div className="t-claude"><div className="t-claude-icon" /><div className="t-claude-info"><span className="name">Sentinel</span><span className="ver">v1.0.4</span><span className="model">Workspace · risk index</span><span className="path">acme-corp / pipeline</span></div></div>
              <div className="t-divider" />
              <div className="t-instruction"><span className="diag-arrow">›</span> Diagnose Acme Corp and draft outreach for champion re-engagement</div>
              <div className="t-divider-thin" />
              <div className="t-empty-line" />
              <span className="t-out">Running <span className="green-text">deal diagnosis suite</span>...</span>
              <div className="t-progress"><div className="t-progress-bar" /></div>
              <div className="t-progress-meta"><span>4 sources analyzed</span><span>87% complete</span></div>
              <div className="t-empty-line" />
              <span className="t-out ok">Champion <span className="warn-text">Sarah Chen</span> dormant <span className="warn-text">14 days</span> · last reply Mar 22</span>
              <span className="t-out ok">Competitor <span className="warn-text">Fiveran</span> mentioned <span className="warn-text">2×</span> in security review</span>
              <span className="t-out ok">Stage age <span className="warn-text">2.4× average</span> · stalling pattern detected</span>
              <span className="t-out ok">Sentiment trend: <span className="red-text">-0.34</span> over 4 calls</span>
              <div className="t-empty-line" />
              <span className="t-out"><span className="green-text">+ Save probability: 68%</span> · draft ready in /actions/acme-001</span>
            </div>
          </div>
        }
        copy={
          <>
            <div className="feature-folio">01 · STOP DEAL SLIPPAGE</div>
            <div className="feature-eyebrow">Stop deal slippage</div>
            <h2 className="feature-h">Catch at-risk deals before they reach <em>silence</em></h2>
            <p className="feature-body">Give reps and leaders one read on deal health: live inputs, scheduled refresh, and cited reasons on every score. <b>Surface risk before the thread goes quiet.</b></p>
            <div className="feature-meta"><div className="feature-meta-item"><span className="check">✓</span>Refresh hourly</div><div className="feature-meta-item"><span className="check">✓</span>0.6s diagnosis</div><div className="feature-meta-item"><span className="check">✓</span>4 source types</div></div>
            <FeatureBlockCTA
              secondaryHref="/docs"
              secondaryLabel={
                <>
                  Read docs <span>→</span>
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
            <div className="term-mini-head"><div className="term-dots-mini"><span /><span /><span /></div><div className="term-mini-title"><b>~/sentinel/audit</b> · read-only verification</div><span className="term-mini-tag">SECURE</span></div>
            <div className="term-frame-body">
              <div className="t-line"><span className="pre">$</span> sentinel connector add <span className="arg">hubspot</span> <span className="flag">--scope</span> <span className="str">&quot;read-only&quot;</span></div>
              <span className="t-out ok">Connector &apos;hubspot&apos; authorized in <span className="num">5.4s</span></span>
              <div className="t-empty-line" />
              <div className="t-line"><span className="pre">$</span> sentinel ask</div>
              <div className="t-claude"><div className="t-claude-icon" /><div className="t-claude-info"><span className="name">Sentinel</span><span className="ver">v1.0.4</span><span className="model">Workspace · audit</span><span className="path">connectors / read-only</span></div></div>
              <div className="t-divider" />
              <div className="t-instruction"><span className="diag-arrow">›</span> Verify all connectors are read-only and audit data access logs</div>
              <div className="t-divider-thin" />
              <div className="t-empty-line" />
              <span className="t-out">Scanning <span className="num">847</span> CRM endpoints...</span>
              <span className="t-out">Auditing OAuth scopes...</span>
              <div className="t-empty-line" />
              <span className="t-out ok"><span className="num">12,403</span> records readable</span>
              <span className="t-out ok">Workspace isolation validated · <span className="num">0</span> cross-tenant leaks</span>
              <span className="t-out ok">Spot check: 50 random samples · all isolated</span>
              <div className="t-empty-line" />
              <div className="t-line"><span className="pre">$</span> sentinel audit log <span className="flag">--last</span> <span className="str">30d</span></div>
              <span className="t-out"><span className="t-diff-add">14,203 reads</span> <span className="t-diff-remove">0 writes</span></span>
              <span className="t-out"><span className="label">Schema changes:</span><span className="value"> <span className="num">0</span></span></span>
              <span className="t-out"><span className="label">Production rows modified:</span><span className="value"> <span className="num">0</span></span></span>
              <div className="t-empty-line" />
              <span className="t-out ok"><span className="green-text">All checks passed.</span> Read-only posture verified · no CRM writes.</span>
            </div>
          </div>
        }
        copy={
          <>
            <div className="feature-folio">02 · ZERO DATA RISK</div>
            <div className="feature-eyebrow">Zero data risk</div>
            <h2 className="feature-h">Read-only access. <em>Security-first</em> from day one.</h2>
            <p className="feature-body">Sentinel never writes back to your CRM. Never trains shared models on your data. Each workspace is fully isolated. <b>Compliance baked in, not bolted on.</b></p>
            <div className="feature-meta"><div className="feature-meta-item"><span className="check">✓</span>Read-only by default</div><div className="feature-meta-item"><span className="check">✓</span>No shared-model training</div><div className="feature-meta-item"><span className="check">✓</span>24h deletion SLA</div></div>
            <FeatureBlockCTA
              secondaryHref="/security"
              secondaryLabel={
                <>
                  Security docs <span>→</span>
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
            <div className="term-mini-head"><div className="term-dots-mini"><span /><span /><span /></div><div className="term-mini-title"><b>~/sentinel/scale</b> · performance benchmark</div><span className="term-mini-tag">BENCH</span></div>
            <div className="term-frame-body">
              <div className="t-line"><span className="pre">$</span> sentinel scan <span className="flag">--all-sources</span></div>
              <span className="t-out"><span className="num">4 sources</span> · 47 deals · <span className="num">8.2K signals</span></span>
              <div className="t-empty-line" />
              <div className="t-line"><span className="pre">$</span> sentinel deal score <span className="flag">--bench</span></div>
              <span className="t-out ok">Pipeline scored in <span className="num">2.4s</span></span>
              <span className="t-out"><span className="label">Source:</span> <span className="value">12,403 production signals</span></span>
              <span className="t-out"><span className="label">Storage used:</span> <span className="value"><span className="num">0 MB</span> (read-only sync)</span></span>
              <span className="t-out"><span className="label">Compute:</span> <span className="value">dedicated container</span></span>
              <div className="t-empty-line" />
              <div className="t-line"><span className="pre">$</span> sentinel deal info <span className="arg">acme-corp</span></div>
              <span className="t-out"><span className="label">Deal:</span> <span className="value"><span className="blue-text">acme-corp</span></span></span>
              <span className="t-out"><span className="label">Status:</span> <span className="value"><span className="green-text">scored</span></span></span>
              <span className="t-out"><span className="label">Stage:</span> <span className="value">4 / 6</span></span>
              <span className="t-out"><span className="label">Risk:</span> <span className="value"><span className="num">82</span> / 100 <span className="red-text">(HIGH)</span></span></span>
              <span className="t-out"><span className="label">Sources:</span> <span className="value">3 (hubspot, gmail, slack)</span></span>
              <span className="t-out"><span className="label">Endpoint:</span> <span className="value"><span className="blue-text">api.sentinel.run/deal/acme</span></span></span>
              <div className="t-empty-line" />
              <span className="t-out ok">Diagnosis ready · <span className="num">68% save probability</span></span>
            </div>
          </div>
        }
        copy={
          <>
            <div className="feature-folio">03 · SPEED AT SCALE</div>
            <div className="feature-eyebrow">Speed at scale</div>
            <h2 className="feature-h">Real-time scoring across <em>thousands</em> of deals</h2>
            <p className="feature-body">Score updates in seconds, scale to zero between syncs, autoscale compute on demand. <b>Zero management. Your team only sees results.</b></p>
            <div className="feature-meta"><div className="feature-meta-item"><span className="check">✓</span>Sub-second sync</div><div className="feature-meta-item"><span className="check">✓</span>Autoscale</div><div className="feature-meta-item"><span className="check">✓</span>No infrastructure</div></div>
            <FeatureBlockCTA
              secondaryHref="/docs/developers"
              secondaryLabel={
                <>
                  Architecture <span>→</span>
                </>
              }
            />
          </>
        }
      />
    </>
  );
}
