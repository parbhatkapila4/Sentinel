import type { ShortListItem } from "../types";
import { VelocityChart } from "./VelocityChart";
import { ShortList } from "./ShortList";
import { RevenueBars } from "./RevenueBars";
import { ForecastBlock } from "./ForecastBlock";
import { MetricExplainer } from "@/components/sentinel/MetricExplainer";

interface PerformanceGridProps {
  velocity: {
    current: number[];
    prior?: number[];
    labels: string[];
    marker?: { index: number; label: string; value: string } | null;
  };
  shortList: ShortListItem[];
  revenueBars: Array<{ label: string; value: number; share: number }>;
  forecast: {
    expected: number;
    bestCase: number;
    worstCase: number;
    weightedConfidence: number;
    notes: string[];
  };
}

export function PerformanceGrid(props: PerformanceGridProps) {
  return (
    <section
      className="grid grid-cols-1 lg:grid-cols-2 pt-8 pb-12 lg:pt-11 lg:pb-16 px-6 sm:px-10 lg:px-14"
      style={{
        gap: 0,
      }}
      aria-label="Performance"
    >
      <div className="border-b pb-10 lg:border-b-0 lg:pb-0 lg:pr-8 lg:border-r" style={{ borderColor: "var(--rule)" }}>
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 30,
            color: "var(--cream)",
            marginBottom: 6,
            letterSpacing: "-0.01em",
          }}
        >
          Pipeline{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--signal)",
              fontFamily: "var(--font-serif)",
            }}
          >
            velocity
          </em>
          <MetricExplainer
            side="left"
            title="Pipeline velocity"
            subtitle="A six-month window centred on today: where you've been, where you are, and where you're heading."
            steps={[
              {
                label: "The window",
                body: "Two months before today, the current month, and three months ahead. The window slides forward as the calendar does, so the current month is always near the centre.",
              },
              {
                label: "What each point is",
                body: "Every dot is the total dollar value of deals you created in that month. Bigger value, higher dot.",
              },
              {
                label: "The solid line (this year)",
                body: "Your booked deal value, month by month. Future months sit at zero until deals land in them — they're the canvas for momentum to fill in.",
              },
              {
                label: "The dashed line (last year)",
                body: "The same months one year earlier. If you have no data from then, it sits flat at zero — that's normal until you've built up a year of history.",
              },
              {
                label: "The peak marker",
                body: "Highlights the highest month in your current window, so you can spot the best stretch at a glance.",
              },
            ]}
          />
        </h3>
        <p
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--cream-4)",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          BY MONTH · THIS YEAR VS LAST
        </p>
        <VelocityChart
          current={props.velocity.current}
          prior={props.velocity.prior}
          labels={props.velocity.labels}
          marker={props.velocity.marker}
        />

        <h4
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 22,
            color: "var(--cream)",
            margin: "40px 0 6px",
            letterSpacing: "-0.01em",
          }}
        >
          Short{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--signal)",
              fontFamily: "var(--font-serif)",
            }}
          >
            list
          </em>
        </h4>
        <p
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--cream-4)",
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          BY URGENCY × VALUE
        </p>
        <ShortList items={props.shortList} />
      </div>

      <div className="pt-10 lg:pt-0 lg:pl-8">
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 30,
            color: "var(--cream)",
            marginBottom: 6,
            letterSpacing: "-0.01em",
          }}
        >
          Revenue{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--signal)",
              fontFamily: "var(--font-serif)",
            }}
          >
            by channel
          </em>
        </h3>
        <p
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--cream-4)",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          QUARTER TO DATE · WEIGHTED
        </p>
        <RevenueBars bars={props.revenueBars} />

        <div style={{ marginTop: 36 }}>
          <ForecastBlock
            expected={props.forecast.expected}
            bestCase={props.forecast.bestCase}
            worstCase={props.forecast.worstCase}
            weightedConfidence={props.forecast.weightedConfidence}
            notes={props.forecast.notes}
          />
        </div>
      </div>
    </section>
  );
}
