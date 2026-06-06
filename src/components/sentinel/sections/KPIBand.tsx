import { KPI } from "./KPI";

export interface KPIBandData {
  hero: {
    label: string;
    display: string;
    italicWord: string;
    delta: { value: string; positive: boolean };
    meta: string;
    spark: number[];
  };
  cards: Array<{
    label: string;
    display: string;
    delta?: { value: string; positive: boolean };
    meta?: string;
    spark?: number[];
  }>;
}

interface KPIBandProps {
  data: KPIBandData;
}

export function KPIBand({ data }: KPIBandProps) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] py-8 lg:py-11 px-6 sm:px-10 lg:px-14"
      style={{
        gap: 24,
      }}
    >
      <KPI
        hero
        label={data.hero.label}
        display={data.hero.display}
        italicWord={data.hero.italicWord}
        delta={data.hero.delta}
        meta={data.hero.meta}
        spark={{ values: data.hero.spark, color: "var(--signal)" }}
        delayMs={0}
      />
      {data.cards.map((c, i) => (
        <KPI
          key={c.label}
          label={c.label}
          display={c.display}
          delta={c.delta}
          meta={c.meta}
          spark={
            c.spark ? { values: c.spark, color: "var(--cream-3)" } : undefined
          }
          delayMs={120 + i * 80}
        />
      ))}
    </div>
  );
}
