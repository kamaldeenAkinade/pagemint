import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pagemint.app"),
  title: "PageMint: Paste HTML and Get a Free Shareable Link",
  description:
    "Paste any HTML and instantly publish a live, shareable web page. No code, no hosting, no account. Get a free public URL in one click.",
  keywords: [
    "paste HTML get link",
    "HTML to URL",
    "host HTML free",
    "share HTML page",
    "instant web page",
    "publish HTML online",
  ],
  openGraph: {
    title: "PageMint: Paste HTML and Get a Free Shareable Link",
    description:
      "Paste any HTML and instantly publish a live, shareable web page. No code, no hosting, no account.",
    url: "https://pagemint.app",
    siteName: "PageMint",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PageMint: Paste HTML and Get a Free Shareable Link",
    description:
      "Paste any HTML and instantly publish a live, shareable web page. No code, no hosting, no account.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
