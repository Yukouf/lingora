"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useI18n } from "@/lib/i18n/context";
import { locales, localeLabels, type Locale } from "@/lib/i18n/locales";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  onNavigate?: (href: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const { data: session } = useSession();
  const { locale, setLocale, t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleNavigate = useCallback((href: string) => {
    setMobileOpen(false);
    if (onNavigate) {
      onNavigate(href);
    } else {
      router.push(href);
    }
  }, [onNavigate, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled || mobileOpen
            ? "bg-[#0f2a4a]/80 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-6">
          <Link href="/" className="group">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-white/90 transition-colors group-hover:text-white">
              Lingora
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#pricing"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40 transition-colors duration-300 hover:text-white/80"
            >
              {t.nav.pricing}
            </a>
          </nav>

          {/* Desktop right side */}
          <div className="hidden items-center gap-4 md:flex">
            {/* Language switcher */}
            <div className="flex items-center gap-1 rounded-full border border-white/10 px-1 py-0.5">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-all duration-300 ${
                    locale === l
                      ? "bg-white/15 text-white"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {localeLabels[l]}
                </button>
              ))}
            </div>

            <ThemeToggle />

            {session ? (
              <Link
                href="/learn"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white"
              >
                {t.nav.mySpace} &rarr;
              </Link>
            ) : (
              <button
                onClick={() => handleNavigate("/register")}
                className="cursor-pointer rounded-full border border-white/20 bg-white/10 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white"
              >
                {t.nav.start}
              </button>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Language switcher — always visible */}
            <div className="flex items-center gap-0.5 rounded-full border border-white/10 px-0.5 py-0.5">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-all duration-300 ${
                    locale === l
                      ? "bg-white/15 text-white"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {localeLabels[l]}
                </button>
              ))}
            </div>
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-[#0a1628]/95 backdrop-blur-xl pt-14 md:hidden">
          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="font-mono text-sm uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
            >
              {t.nav.pricing}
            </a>

            {session ? (
              <Link
                href="/learn"
                onClick={() => setMobileOpen(false)}
                className="font-mono text-sm uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white"
              >
                {t.nav.mySpace} &rarr;
              </Link>
            ) : (
              <button
                onClick={() => handleNavigate("/register")}
                className="cursor-pointer rounded-full bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] px-8 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white shadow-lg shadow-[#a78bfa]/25 transition-all hover:shadow-xl hover:brightness-110"
              >
                {t.nav.start}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
