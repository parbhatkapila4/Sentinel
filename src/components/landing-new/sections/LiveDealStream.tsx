export function LiveDealStream() {
  const deals = [
    { name: "Acme Corp", amount: "$247K", score: "0.82 HIGH", cls: "high" },
    { name: "Northwind", amount: "$165K", score: "0.55 MED", cls: "med" },
    { name: "Meridian Group", amount: "$320K", score: "0.77 HIGH", cls: "high" },
    { name: "BluePeak", amount: "$94K", score: "0.22 LOW", cls: "low" },
    { name: "Orchid Labs", amount: "$129K", score: "0.48 MED", cls: "med" },
    { name: "Vertex Health", amount: "$212K", score: "0.74 HIGH", cls: "high" },
  ];

  return (
    <div className="deal-stream-wrap">
      <div className="deal-stream-label">EXAMPLE DEALS →</div>
      <div className="deal-stream-body">
        <div className="deal-stream">
          {deals.concat(deals).map((deal, idx) => (
            <div className="deal-chip" key={`${deal.name}-${idx}`}>
              <span className="name">{deal.name}</span>
              <span className="amount">{deal.amount}</span>
              <span className={`score ${deal.cls}`}>{deal.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
