export function formatShortMoney(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  const tiers: ReadonlyArray<readonly [number, string]> = [
    [1, ""],
    [1_000, "K"],
    [1_000_000, "M"],
    [1_000_000_000, "B"],
    [1_000_000_000_000, "T"],
  ];

  for (const [tier, suffix] of tiers) {
    const val = abs / tier;
    const decimals = suffix === "" ? 0 : val < 10 ? 2 : val < 100 ? 1 : 0;
    const factor = 10 ** decimals;
    const rounded = Math.round(val * factor) / factor;
    if (rounded >= 1000) continue;
    return `${sign}$${parseFloat(rounded.toFixed(decimals))}${suffix}`;
  }

  return `${sign}$${abs.toExponential(2)}`;
}
