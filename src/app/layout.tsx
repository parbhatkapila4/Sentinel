import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { CommandPalette } from "@/components/command-palette";
import { WebVitalsTracker } from "@/components/web-vitals-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sentinel",
  description: "Sentinel - Deal Management Platform",
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
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
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
