import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

const daylightSans = Geist({
  subsets: ["latin"],
  variable: "--font-dl-sans",
  display: "swap",
});

const daylightMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-dl-mono",
  display: "swap",
});

const daylightSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dl-serif",
  display: "swap",
});

export const daylightFontClass = `${daylightSans.variable} ${daylightMono.variable} ${daylightSerif.variable}`;
