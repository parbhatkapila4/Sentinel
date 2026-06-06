import { ComparisonTable } from "./sections/ComparisonTable";
import { CustomerImpact } from "./sections/CustomerImpact";
import { FeatureBlocks } from "./sections/FeatureBlocks";
import { FinalCTA } from "./sections/FinalCTA";
import { Footer } from "./sections/Footer";
import { HatchDivider } from "./sections/HatchDivider";
import { Hero } from "./sections/Hero";
import { LiveDealStream } from "./sections/LiveDealStream";
import { LogoGrid } from "./sections/LogoGrid";
import { Nav } from "./sections/Nav";
import { Performance } from "./sections/Performance";
import { Providers } from "./sections/Providers";
import { TabbedFeatures } from "./sections/TabbedFeatures";
import { TickerBar } from "./sections/TickerBar";

export function LandingNewPage() {
  return (
    <main className="landing-new">
      <TickerBar />
      <Nav />
      <HatchDivider />
      <Hero />
      <LiveDealStream />
      <HatchDivider />
      <LogoGrid />
      <HatchDivider />
      <FeatureBlocks />
      <HatchDivider />
      <TabbedFeatures />
      <HatchDivider />
      <Performance />
      <HatchDivider />
      <ComparisonTable />
      <HatchDivider />
      <Providers />
      <HatchDivider />
      <CustomerImpact />
      <HatchDivider />
      <FinalCTA />
      <HatchDivider />
      <Footer />
    </main>
  );
}
