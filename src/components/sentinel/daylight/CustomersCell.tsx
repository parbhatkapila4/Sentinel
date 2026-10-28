import { CustomersGlobe } from "./CustomersGlobe";
import { cellSubStyle, cellTitleStyle } from "./ui";

interface CustomersCellProps {
  pins: Array<{ country: string; count: number }>;
}

export function CustomersCell({ pins }: CustomersCellProps) {
  const total = pins.reduce((sum, p) => sum + p.count, 0);
  const listed = pins.slice(0, 6);

  return (
    <section
      aria-label="Customers by country"
      className="dl-third"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "18px var(--dl-gutter) 18px",
      }}
    >
      <h2 style={cellTitleStyle}>Customers by country</h2>
      <p style={{ ...cellSubStyle, marginTop: 1 }}>
        {total} {total === 1 ? "customer" : "customers"} in {pins.length}{" "}
        {pins.length === 1 ? "country" : "countries"}
      </p>
      <div
        className="flex flex-1 flex-wrap items-center"
        style={{ gap: "12px 18px", marginTop: 10 }}
      >
        <CustomersGlobe pins={pins} />
        {listed.length > 0 && (
          <ul style={{ flex: "1 1 100px", minWidth: 0 }}>
            {listed.map((pin, i) => (
              <li
                key={pin.country}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  height: 30,
                  borderTop: i === 0 ? undefined : "1px solid var(--dl-row)",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: 13.5,
                    color: "var(--dl-text-2)",
                  }}
                >
                  {pin.country}
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {pin.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
