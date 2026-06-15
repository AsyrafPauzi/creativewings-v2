import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Creative Wings";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Where Creativity Takes Flight`,
    template: `%s · ${siteName}`,
  },
  description:
    "Creative Wings is the platform for running national art competitions and creative activities. Discover campaigns, submit your artwork, and earn recognition.",
  openGraph: {
    title: siteName,
    description:
      "National platform for art competitions, school activities and creator portfolios.",
    url: siteUrl,
    siteName,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
