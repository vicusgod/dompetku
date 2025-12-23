import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dompetku",
  description: "Personal Finance Tracker",
  applicationName: "dompetku",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "dompetku",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        {/* Removed Google Fonts CDN links - they fail offline */}
        {/* Using next/font for bundled fonts and Lucide icons for offline support */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background-light font-display`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

