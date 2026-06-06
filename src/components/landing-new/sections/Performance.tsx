export function Performance() {
  return (
    <section className="perf-section">
      <div className="perf-inner">
        <div className="perf-head">
          <div className="perf-head-l">
            <div className="section-folio">05 · PERFORMANCE</div>
            <div className="perf-kicker">PERFORMANCE</div>
            <h2 className="perf-title">Built to scale with<br /><em>your pipeline</em></h2>
            <p className="perf-sub">Illustrative product view based on implemented Sentinel capabilities.</p>
          </div>
        </div>
        <div className="perf-grid">
          <div className="perf-card latency-card">
            <div className="perf-card-corner">FIG · 01</div>
            <div className="perf-card-title">Risk Recomputed on Read</div>
            <div className="perf-card-sub">Each deal view recomputes risk and returns auditable reasons.</div>
            <div className="bar-chart">
              <div className="bar-col">
                <div className="bar-block tall">INPUTS</div>
                <div className="bar-label">Signals + deal history</div>
              </div>
              <div className="bar-col">
                <div className="green-pill">Computed on request</div>
                <div className="bar-block short">OUTPUT</div>
                <div className="bar-label">Risk + reasons</div>
              </div>
            </div>
            <div className="line-chart">
              <svg viewBox="0 0 280 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="latencyArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="20" y1="145" x2="270" y2="145" stroke="#1f252b" strokeWidth="1" />
                <line x1="20" y1="108" x2="270" y2="108" stroke="#1a2026" strokeWidth="0.7" />
                <line x1="20" y1="72" x2="270" y2="72" stroke="#1a2026" strokeWidth="0.7" />
                <path d="M20,142 L80,138 L130,130 L170,112 L205,86 L238,58 L270,34" stroke="#4ADE80" strokeWidth="2.2" fill="none" />
                <path d="M20,142 L80,138 L130,130 L170,112 L205,86 L238,58 L270,34 L270,170 L20,170 Z" fill="url(#latencyArea)" />
                <circle cx="270" cy="34" r="3.2" fill="#4ADE80" />
              </svg>
            </div>
            <div className="chart-legend"><div className="legend-item"><span className="legend-dot" />Input context</div><div className="legend-item"><span className="legend-dot active" />Computed result</div></div>
          </div>
          <div className="perf-card efficiency-card">
            <div className="perf-card-corner">FIG · 02</div>
            <div className="perf-card-title">Read-Only Integrations</div>
            <div className="perf-card-sub">HubSpot, Salesforce, and Google Calendar are consumed read-only.</div>
            <div className="line-chart">
              <svg viewBox="0 0 280 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="effFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="20" y1="24" x2="270" y2="24" stroke="#1a2026" strokeWidth="0.7" />
                <line x1="20" y1="56" x2="270" y2="56" stroke="#1a2026" strokeWidth="0.7" />
                <line x1="20" y1="88" x2="270" y2="88" stroke="#1a2026" strokeWidth="0.7" />
                <line x1="20" y1="120" x2="270" y2="120" stroke="#1a2026" strokeWidth="0.7" />
                <line x1="20" y1="152" x2="270" y2="152" stroke="#1f252b" strokeWidth="1" />
                <path d="M20,150 L56,138 L90,122 L128,102 L166,84 L204,66 L238,46 L270,30" stroke="#5a5a5a" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                <path d="M20,147 L56,146 L90,144 L128,143 L166,142 L204,141 L238,140 L270,138" stroke="#4ADE80" strokeWidth="2.2" fill="none" />
                <path d="M20,147 L56,146 L90,144 L128,143 L166,142 L204,141 L238,140 L270,138 L270,170 L20,170 Z" fill="url(#effFill)" />
                <text x="20" y="170" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">ingest</text>
                <text x="102" y="170" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">norm</text>
                <text x="182" y="170" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">score</text>
                <text x="256" y="170" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">why</text>
              </svg>
            </div>
            <div className="perf-callout">Implemented: read-only CRM + calendar connectors</div>
            <div className="chart-legend"><div className="legend-item"><span className="legend-dot" />Source systems</div><div className="legend-item"><span className="legend-dot active" />Sentinel analysis layer</div></div>
          </div>
          <div className="perf-card burst-card">
            <div className="perf-card-corner">FIG · 03</div>
            <div className="perf-card-title">Sync + Manual Refresh</div>
            <div className="perf-card-sub">Daily integration sync with manual sync available.</div>
            <div className="peak-chart">
              <svg viewBox="0 0 280 180" preserveAspectRatio="none">
                <line x1="36" y1="40" x2="270" y2="40" stroke="#5a5a5a" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="36" y1="80" x2="270" y2="80" stroke="#1a2026" strokeWidth="0.7" />
                <line x1="36" y1="120" x2="270" y2="120" stroke="#1a2026" strokeWidth="0.7" />
                <line x1="36" y1="156" x2="270" y2="156" stroke="#1a2026" strokeWidth="0.7" />
                <path d="M36,156 L50,156 L62,94 L74,156 L98,156 L114,156 L130,70 L142,156 L168,156 L182,156 L198,116 L212,156 L234,156 L248,96 L260,156 L270,156" stroke="#4ADE80" strokeWidth="2.2" fill="none" />
                <circle cx="62" cy="94" r="2.5" fill="#4ADE80" />
                <circle cx="130" cy="70" r="2.5" fill="#4ADE80" />
                <circle cx="248" cy="96" r="2.5" fill="#4ADE80" />
                <text x="36" y="176" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">mon</text>
                <text x="90" y="176" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">tue</text>
                <text x="146" y="176" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">wed</text>
                <text x="202" y="176" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">thu</text>
                <text x="256" y="176" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">fri</text>
              </svg>
            </div>
            <div className="line-chart mini-chart">
              <svg viewBox="0 0 280 86" preserveAspectRatio="none">
                <line x1="20" y1="42" x2="270" y2="42" stroke="#2a3138" strokeWidth="1" />
                <rect x="26" y="30" width="22" height="24" rx="2" fill="#4ADE80" opacity="0.85" />
                <rect x="92" y="28" width="30" height="28" rx="2" fill="#4ADE80" opacity="0.86" />
                <rect x="176" y="30" width="18" height="24" rx="2" fill="#4ADE80" opacity="0.84" />
                <rect x="230" y="29" width="26" height="26" rx="2" fill="#4ADE80" opacity="0.85" />
                <text x="22" y="74" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">daily</text>
                <text x="96" y="74" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">manual</text>
                <text x="182" y="74" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">retry</text>
                <text x="248" y="74" fill="#c9d1d9" fontSize="11" fontWeight="500" letterSpacing="0.04em">audit</text>
              </svg>
            </div>
            <div className="perf-callout">Implemented: daily cron plus manual refresh flow</div>
            <div className="chart-legend"><div className="legend-item"><span className="legend-dot" />Scheduled sync</div><div className="legend-item"><span className="legend-dot active" />On-demand sync</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
