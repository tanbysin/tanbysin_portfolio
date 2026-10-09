import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tanbysin.com"),
  title: "Tanjina Akhter Tonny ✿ tanbysin",
  description:
    "Portfolio of Tanjina Akhter Tonny — CSE graduate (University of Asia Pacific), backend developer and ML tinkerer from Dhaka. Built as a pastel retro desktop.",
  keywords: ["Tanjina Akhter Tonny", "tanbysin", "portfolio", "backend developer", "Django", "BanglaBERT", "GAN", "Dhaka"],
  authors: [{ name: "Tanjina Akhter Tonny", url: "https://tanbysin.com" }],
  openGraph: {
    title: "Tanjina Akhter Tonny ✿ tanbysin",
    description: "Welcome to tonnyOS — a pastel retro desktop portfolio.",
    url: "https://tanbysin.com",
    siteName: "tanbysin",
    type: "website",
  },
  twitter: { card: "summary", title: "Tanjina Akhter Tonny ✿ tanbysin", description: "Welcome to tonnyOS ✿" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#cdb8ff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Pixelify+Sans:wght@400;500;600;700&family=VT323&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
