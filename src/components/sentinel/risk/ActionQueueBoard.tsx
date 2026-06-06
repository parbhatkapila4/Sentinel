import Link from "next/link";

export interface ActionQueueDeal {
  id: string;
  name: string;
  valueDisplay: string;
  meta: string;
  recommendedAction?: string | null;
  overdueDays?: number | null;
}

export interface ActionQueueColumn {
  key: "urgent" | "important" | "safe";
  label: string;
  caption: string;
  pulse?: boolean;
  deals: ActionQueueDeal[];
  emptyHeadline: string;
  emptyBody?: string;
}

interface ActionQueueBoardProps {
  columns: ActionQueueColumn[];
}

function columnTone(key: ActionQueueColumn["key"]) {
  if (key === "urgent") return "var(--wine)";
  if (key === "important") return "var(--copper)";
  return "var(--ivy)";
}

export function ActionQueueBoard({ columns }: ActionQueueBoardProps) {
  return (
    <section
      aria-label="Action queue"
      className="grid grid-cols-1 lg:grid-cols-3"
      style={{
        gap: 0,
        borderTop: "1px solid var(--rule-strong)",
        borderBottom: "1px solid var(--rule-strong)",
      }}
    >
      {columns.map((col, i) => (
        <ActionColumn key={col.key} column={col} isLast={i === columns.length - 1} />
      ))}
    </section>
  );
}

function ActionColumn({
  column,
  isLast,
}: {
  column: ActionQueueColumn;
  isLast: boolean;
}) {
  const tone = columnTone(column.key);
  return (
    <article
      style={{
        borderRight: isLast ? "none" : "1px solid var(--rule)",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        background: "var(--ink)",
      }}
    >
      <header
        style={{
          padding: "22px 24px 18px",
          borderBottom: "1px solid var(--rule)",
          position: "relative",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 2,
            background: tone,
          }}
        />
        <div
          className="flex items-center"
          style={{ gap: 10, marginBottom: 10 }}
        >
          <span
            aria-hidden
            className={column.pulse ? "animate-pulse" : ""}
            style={{
              width: 10,
              height: 10,
              background: tone,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: tone,
              textTransform: "uppercase",
            }}
          >
            {column.label}
          </span>
          <span style={{ flex: 1 }} />
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              color: "var(--cream)",
              letterSpacing: "-0.02em",
            }}
          >
            {column.deals.length}
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            lineHeight: 1.5,
            color: "var(--cream-2)",
            fontStyle: "italic",
          }}
        >
          {column.caption}
        </p>
      </header>

      <ul
        style={{
          margin: 0,
          padding: 14,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxHeight: 480,
          overflowY: "auto",
          flex: 1,
        }}
      >
        {column.deals.length === 0 ? (
          <li
            style={{
              padding: "32px 0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "var(--cream-4)",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {column.emptyHeadline}
            </div>
            {column.emptyBody && (
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--cream-3)",
                  lineHeight: 1.5,
                }}
              >
                {column.emptyBody}
              </div>
            )}
          </li>
        ) : (
          column.deals.map((d, j) => (
            <li
              key={d.id}
              className="anim-rise"
              style={{ animationDelay: `${100 + j * 30}ms` }}
            >
              <ActionDealCard deal={d} tone={tone} />
            </li>
          ))
        )}
      </ul>
    </article>
  );
}

function ActionDealCard({
  deal,
  tone,
}: {
  deal: ActionQueueDeal;
  tone: string;
}) {
  return (
    <Link
      href={`/deals/${deal.id}`}
      style={{
        display: "block",
        padding: "12px 14px",
        background: "var(--ink-02)",
        border: "1px solid var(--rule)",
        textDecoration: "none",
        position: "relative",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: 2,
          background: tone,
        }}
      />
      <div
        className="flex items-baseline"
        style={{ gap: 10, marginBottom: 6 }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 16,
            color: "var(--cream)",
            lineHeight: 1.25,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {deal.name}
        </span>
        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            color: "var(--cream)",
            letterSpacing: "-0.01em",
          }}
        >
          {deal.valueDisplay}
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.14em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {deal.meta}
      </div>
      {deal.recommendedAction && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid var(--rule)",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 9.5,
            letterSpacing: "0.14em",
            color: tone,
            textTransform: "uppercase",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          → {deal.recommendedAction}
        </div>
      )}
      {typeof deal.overdueDays === "number" && deal.overdueDays > 0 && (
        <div
          style={{
            marginTop: 6,
            fontFamily: "var(--font-mono-jb)",
            fontSize: 9,
            letterSpacing: "0.16em",
            color: "var(--copper)",
            textTransform: "uppercase",
          }}
        >
          {deal.overdueDays}D OVERDUE
        </div>
      )}
    </Link>
  );
}
