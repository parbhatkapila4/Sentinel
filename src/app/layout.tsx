import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/theme-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Revenue Sentinel",
  description: "Revenue Sentinel - Deal Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster
          position="top-center"
          richColors
          theme="light"
          toastOptions={{
            classNames: {
              toast:
                "!bg-white !border !border-gray-200 !text-gray-900 !shadow-lg !rounded-2xl !p-6 !min-w-[450px] !max-w-[500px] !overflow-hidden !flex !flex-col",
              title: "!hidden",
              description: "!hidden",
              actionButton:
                "!bg-red-500 hover:!bg-red-600 !text-white !font-semibold !px-6 !py-2.5 !rounded-full !transition-all !duration-200 !border-0 !min-w-[120px]",
              cancelButton:
                "!bg-white hover:!bg-gray-50 !text-red-500 !font-medium !px-6 !py-2.5 !rounded-full !transition-all !duration-200 !border !border-red-500 !min-w-[120px]",
            },
          }}
          closeButton={false}
          expand={true}
        />
      </body>
    </html>
  );
}
