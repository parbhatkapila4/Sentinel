import { ForecastScenarios } from "./ForecastScenarios";
import { Recommendations } from "./Recommendations";
import { MetricExplainer } from "@/components/sentinel/MetricExplainer";

interface InsightsGridProps {
  scenarios: {
    months: string[];
    best: number[];
    expected: number[];
    worst: number[];
  };
  anomalies: Array<{
    severity: "high" | "medium" | "low";
    dealName: string;
    reason: string;
  }>;
  patterns: Array<{
    type: string;
    description: string;
    impact: "positive" | "negative" | "neutral";
  }>;
  recommendations: string[];
}

export function InsightsGrid(props: InsightsGridProps) {
  return (
    <section
      className="grid grid-cols-1 lg:grid-cols-2 pt-8 pb-12 lg:pt-11 lg:pb-16 px-6 sm:px-10 lg:px-14"
      style={{
        gap: 0,
      }}
      aria-label="Pipeline & insights"
    >
      <div className="flex flex-col border-b pb-10 lg:border-b-0 lg:pb-0 lg:pr-8 lg:border-r" style={{ borderColor: "var(--rule)" }}>
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 30,
            color: "var(--cream)",
            marginBottom: 6,
            letterSpacing: "-0.01em",
          }}
        >
          Three{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--signal)",
              fontFamily: "var(--font-serif)",
            }}
          >
            scenarios
          </em>
          <MetricExplainer
            side="left"
            title="Three scenarios"
            subtitle="Your most likely six-month revenue, plus the best and worst it could be."
            steps={[
              {
                label: "What we count",
                body: "Only your open deals. Anything already won or lost is out of the picture.",
              },
              {
                label: "Most likely (dashed cream line)",
                body: "For each open deal, we estimate the chance it'll close based on its stage. Early-stage deals count for less, near-close deals count for more. Multiply by deal value, add it all up, split across six months.",
              },
              {
                label: "Best and worst (green and red lines)",
                body: "We nudge those odds up for the green line (best case) and down for the red line (worst case). The gap between them is your range of likely outcomes.",
              },
              {
                label: "Why the lines are flat",
                body: "We spread the totals evenly across the six months instead of guessing which month each deal closes in. Read it as a six-month range, not a calendar.",
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
            marginBottom: 22,
          }}
        >
          NEXT SIX MONTHS · MODEL OUTPUT
        </p>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <ForecastScenarios
            months={props.scenarios.months}
            best={props.scenarios.best}
            expected={props.scenarios.expected}
            worst={props.scenarios.worst}
          />
        </div>
      </div>

      <div className="flex flex-col pt-10 lg:pt-0 lg:pl-8">
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 30,
            color: "var(--cream)",
            marginBottom: 6,
            letterSpacing: "-0.01em",
          }}
        >
          Insights &{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--signal)",
              fontFamily: "var(--font-serif)",
            }}
          >
            recommendations
          </em>
        </h3>
        <p
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--cream-4)",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          DERIVED FROM PATTERN MODEL
        </p>
        <Recommendations
          anomalies={props.anomalies}
          patterns={props.patterns}
          recommendations={props.recommendations}
        />
      </div>
    </section>
  );
}
