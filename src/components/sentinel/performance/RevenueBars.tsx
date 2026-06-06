import { formatShortMoney as formatShortCurrency } from "@/lib/format-money";
import { MetricExplainer } from "@/components/sentinel/MetricExplainer";

interface RevenueBar {
  label: string;
  value: number;
  share: number;
}

interface RevenueBarsProps {
  bars: RevenueBar[];
}

export function RevenueBars({ bars }: RevenueBarsProps) {
  const top = bars.reduce<RevenueBar | null>((max, b) => {
    if (!max || b.value > max.value) return b;
    return max;
  }, null);

  return (
    <div style={{ position: "relative" }}>
      <span
        style={{
          position: "absolute",
          top: -4,
          right: 0,
          zIndex: 5,
        }}
      >
        <MetricExplainer
          side="right"
          title="Revenue by channel"
          subtitle="Where your deals are coming from."
          steps={[
            {
              label: "What we use",
              body: "When you add a deal, you pick how it came in: Direct, Organic, Outbound, Referrals, or Partners.",
            },
            {
              label: "How each bar is built",
              body: "Each bar adds up the total value of every deal you tagged with that channel. Bigger bar = more pipeline from that source.",
            },
            {
              label: "Older deals",
              body: "Deals you created before this feature show a rough guess based on their stage. Open them and pick the right channel to make the chart fully accurate.",
            },
          ]}
        />
      </span>
      <div
        className="flex items-end"
        style={{
          gap: 22,
          height: 200,
          paddingBottom: 18,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        {bars.map((b, i) => {
          const isTop = top && b.label === top.label;
          const heightPct = Math.max(4, Math.min(100, b.share * 100));
          return (
            <div
              key={b.label}
              className="flex flex-col items-center justify-end flex-1"
              style={{ height: "100%" }}
            >
              <span
                className="tabular"
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: isTop ? "var(--signal)" : "var(--cream-3)",
                  marginBottom: 8,
                }}
              >
                {formatShortCurrency(b.value)}
              </span>
              <div
                className="anim-bar-rise"
                style={{
                  width: "100%",
                  maxWidth: 56,
                  height: `${heightPct}%`,
                  background: isTop ? "var(--signal)" : "var(--cream-4)",
                  animationDelay: `${200 + i * 80}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        className="flex"
        style={{
          gap: 22,
          marginTop: 12,
        }}
      >
        {bars.map((b) => {
          const isTop = top && b.label === top.label;
          return (
            <div
              key={b.label}
              className="flex-1 text-center"
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: isTop ? "var(--signal)" : "var(--cream-3)",
              }}
            >
              {b.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
