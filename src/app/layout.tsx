import type { Metadata } from "next";
import { Fraunces, Raleway } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LLMS_URL } from "@/usage/theme-docs.mjs";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  // Both styles: without "italic" next/font ships the upright faces only and the
  // accent word and captions (`.fraunces-accent`, `.fraunces-caption`) render a
  // synthesised italic — the apps get the true italic from the Google import.
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(new URL(LLMS_URL).origin),
  title: "Quill — an editorial design system for digital products",
  description:
    "Warm neutral grounds, ink-toned type, and a narrow accent palette reserved for meaning. The Quill Design System by Craftwell.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-180.png",
  },
  // The agent-facing overview, discoverable from the page head as well as from
  // the footer and robots.txt: `<link rel="alternate" type="text/plain">`.
  alternates: { types: { "text/plain": "/llms.txt" } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${raleway.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
