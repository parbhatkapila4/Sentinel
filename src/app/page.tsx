import { JetBrains_Mono } from "next/font/google";
import { LandingNewPage } from "@/components/landing-new/LandingNewPage";
import "./landing-new.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
});

export default function Page() {
  return (
    <div className={jetbrainsMono.className}>
      <LandingNewPage />
    </div>
  );
}
