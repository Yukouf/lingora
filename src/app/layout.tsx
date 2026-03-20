import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Lingyou — Apprendre une langue, pour de vrai",
  description:
    "La plateforme qui t'apprend vraiment une langue. Conversations IA, exercices contextuels, répétition espacée. Pas de gamification creuse.",
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
      </body>
    </html>
  );
}
