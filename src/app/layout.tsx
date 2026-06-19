import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Creative Wings";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Where talents soar`,
    template: `%s · ${siteName}`,
  },
  description:
    "Creative Wings is Malaysia's national platform for art competitions, school activities, and creator portfolios. Discover campaigns, submit your work, and earn recognition.",
  openGraph: {
    title: siteName,
    description:
      "Where talents soar. National platform for art competitions, school activities and creator portfolios.",
    url: siteUrl,
    siteName,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="min-h-screen bg-background font-sans text-body">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
