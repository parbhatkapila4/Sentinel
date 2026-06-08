import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { CommandPalette } from "@/components/command-palette";
import { WebVitalsTracker } from "@/components/web-vitals-tracker";
import { SkipLink } from "@/components/skip-link";
import { TopProgressBar } from "@/components/top-progress-bar";
import { ServerActionErrorBoundary } from "@/components/sentinel/ServerActionErrorBoundary";

export const metadata: Metadata = {
  title: "Sentinel",
  description: "Sentinel - Deal Management Platform",
  icons: {
    icon: [
      { url: "/Sentinel%20New%20logo.png", type: "image/png", sizes: "48x48" },
      { url: "/Sentinel%20New%20logo.png", type: "image/png", sizes: "32x32" },
      { url: "/Sentinel%20New%20logo.png", type: "image/png", sizes: "16x16" },
    ],
    shortcut: [{ url: "/Sentinel%20New%20logo.png", type: "image/png" }],
    apple: [{ url: "/Sentinel%20New%20logo.png", type: "image/png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-in"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/"
      appearance={{
        elements: {
          footer: { display: "none" },
          badge: { display: "none" },
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className="antialiased"
        >
          <SkipLink />
          <WebVitalsTracker />
          <ServerActionErrorBoundary />
          <Providers>
            <TopProgressBar />
            <CommandPalette />
            {children}
          </Providers>
          <Toaster
            position="top-right"
            theme="dark"
            duration={4000}
            closeButton={false}
            gap={10}
            offset={16}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
