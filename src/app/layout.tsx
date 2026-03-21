import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "./providers";
import { MidnightSky } from "@/components/layout/MidnightSky";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linguamaster-beta.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Lingyou — Apprends une langue pour de vrai",
    template: "%s — Lingyou",
  },
  description:
    "Lingyou est la plateforme d'apprentissage des langues qui t'enseigne vraiment. Conversations IA immersives, exercices contextuels, répétition espacée intelligente et parcours structuré du niveau A1 au C2. Gratuit jusqu'au niveau A2.",
  metadataBase: new URL(baseUrl),
  keywords: [
    "apprendre une langue",
    "apprentissage des langues",
    "cours de langue en ligne",
    "conversations IA",
    "répétition espacée",
    "flashcards",
    "anglais",
    "espagnol",
    "japonais",
    "chinois",
    "allemand",
    "arabe",
    "CECRL",
    "niveau A1",
    "niveau B1",
    "immersion linguistique",
  ],
  authors: [{ name: "Lingyou" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Lingyou — Apprends une langue pour de vrai",
    description:
      "Conversations IA immersives, exercices contextuels, répétition espacée intelligente. Gratuit jusqu'au niveau A2.",
    siteName: "Lingyou",
    type: "website",
    url: baseUrl,
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lingyou — Apprends une langue pour de vrai",
    description:
      "Conversations IA immersives, exercices contextuels, répétition espacée intelligente. Gratuit jusqu'au niveau A2.",
    creator: "@lingyou",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          <MidnightSky />
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
