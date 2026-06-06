import type { LeadHeadline } from "../derive";

interface LeadColumnProps {
  kicker: string;
  headline: LeadHeadline;
}

export function LeadColumn({ kicker, headline }: LeadColumnProps) {
  const decorate = (text: string): React.ReactNode => {
    if (headline.emphases.length === 0) return text;
    let pieces: React.ReactNode[] = [text];
    for (const emp of headline.emphases) {
      pieces = pieces.flatMap((piece, idx) => {
        if (typeof piece !== "string") return [piece];
        const parts = piece.split(emp);
        if (parts.length === 1) return [piece];
        const out: React.ReactNode[] = [];
        parts.forEach((p, i) => {
          if (i > 0)
            out.push(
              <strong
                key={`${emp}-${idx}-${i}`}
                style={{ color: "var(--cream)", fontWeight: 500 }}
              >
                {emp}
              </strong>
            );
          out.push(p);
        });
        return out;
      });
    }
    return pieces;
  };

  const hangingClause = headline.hangingClause.split("\n").map((line, i) => (
    <span key={i} style={{ display: "block" }}>
      {line}
    </span>
  ));

  return (
    <div className="anim-rise" style={{ animationDelay: "100ms" }}>
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--signal)",
          textTransform: "uppercase",
          marginBottom: 22,
        }}
      >
        {kicker}
      </div>

      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontSize: "clamp(48px, 7vw, 82px)",
          lineHeight: 0.98,
          color: "var(--cream)",
          letterSpacing: "-0.02em",
          marginBottom: 26,
        }}
      >
        {headline.prefix}{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "var(--signal)",
            fontFamily: "var(--font-serif)",
          }}
        >
          {headline.italicWord}
        </em>
        {headline.suffix ? ` ${headline.suffix}` : ""}
      </h1>

      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 22,
          lineHeight: 1.3,
          color: "var(--cream-2)",
          marginBottom: 26,
        }}
      >
        {hangingClause}
      </div>

      <p
        style={{
          fontSize: 15,
          lineHeight: 1.65,
          color: "var(--cream-2)",
          maxWidth: 560,
        }}
      >
        {decorate(headline.deck)}
      </p>
    </div>
  );
}
