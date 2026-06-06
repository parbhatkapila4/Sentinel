interface IssueColumnProps {
  issueNumber: number;
  dateLine: string;
  weatherLine: string;
  metaLines: string[];
}

export function IssueColumn({
  issueNumber,
  dateLine,
  weatherLine,
  metaLines,
}: IssueColumnProps) {
  return (
    <div className="anim-rise" style={{ animationDelay: "0ms" }}>
      <div
        className="font-mono-jb"
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
          marginBottom: 22,
        }}
      >
        ISSUE №
      </div>
      <div
        className="tabular"
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 78,
          lineHeight: 0.95,
          color: "var(--cream)",
          letterSpacing: "-0.02em",
          marginBottom: 28,
        }}
      >
        {issueNumber}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {dateLine}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        {weatherLine}
      </div>
      <div
        style={{
          borderTop: "1px solid var(--rule)",
          paddingTop: 18,
        }}
      >
        {metaLines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.14em",
              color: "var(--cream-4)",
              textTransform: "uppercase",
              lineHeight: 1.7,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
