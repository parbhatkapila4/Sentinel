import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { CommandPalette } from "@/components/command-palette";
import { WebVitalsTracker } from "@/components/web-vitals-tracker";
import { SkipLink } from "@/components/skip-link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sentinel",
  description: "Sentinel - Deal Management Platform",
  icons: {
    icon: [
      { url: "/Sentinel%20New%20logo.png", sizes: "48x48", type: "image/png" },
      { url: "/Sentinel%20New%20logo.png", sizes: "32x32", type: "image/png" },
      { url: "/Sentinel%20New%20logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/Sentinel%20New%20logo.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} antialiased`}
        >
          <SkipLink />
          <WebVitalsTracker />
          <Providers>
            <CommandPalette />
            {children}
          </Providers>
          <Toaster
            position="top-right"
            theme="dark"
            richColors
            duration={3000}
            closeButton={false}
            toastOptions={{
              style: {
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                color: "#ffffff",
              },
              className: "dark-toast",
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
