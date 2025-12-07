import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script, Inter } from "next/font/google"; 
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// Geist (default)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// NEW: Font premium untuk watermark Caméree
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-dancing-script",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Caméree - Photo Booth",
  description: "Capture retro and modern photos with Caméree.",
  icons: "images/logo-cameree.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Optional: preload font untuk performa lebih cepat */}
        <link
          rel="preload"
          href="/fonts/dancing-script-v24-latin-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${inter.variable} antialiased font-sans`}
      >
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}