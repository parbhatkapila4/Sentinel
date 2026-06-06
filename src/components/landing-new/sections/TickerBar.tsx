export function TickerBar() {
  const items = [
    { label: "RISK INDEX", val: "0–100", trend: "per deal · cited reasons", cls: "" },
    { label: "SYNC", val: "Daily", trend: "Salesforce · HubSpot · Calendar", cls: "" },
    { label: "ALERTS", val: "Real-time", trend: "Slack · HMAC webhooks", cls: "" },
    { label: "SECRETS", val: "AES-256", trend: "GCM at rest", cls: "" },
    { label: "CRM ACCESS", val: "Read-only", trend: "no write-back", cls: "" },
    { label: "AI", val: "Multi-model", trend: "per-task routing", cls: "" },
    { label: "TRAINING", val: "Never", trend: "your data stays yours", cls: "" },
  ];

  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {items.concat(items).map((item, idx) => (
          <span className="tick" key={`${item.label}-${idx}`}>
            <span className="label">{item.label}</span>
            <span className="val">{item.val}</span>
            {item.trend ? <span className={item.cls}>{item.trend}</span> : null}
          </span>
        ))}
      </div>
    </div>
  );
}
