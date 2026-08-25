import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qrovia — QR codes that never die",
  description:
    "Dynamic QR codes with instant destination switching and scan analytics. Print once, change anytime.",
};

export const viewport: Viewport = {
  themeColor: "#08070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-bg font-sans text-ink">{children}</body>
    </html>
  );
}
