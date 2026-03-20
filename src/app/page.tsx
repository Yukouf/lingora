"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { GhostMascot } from "@/components/ui/ghost-mascot";
import { useI18n } from "@/lib/i18n/context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { DemoChat } from "@/components/landing/DemoChat";

/* ——— Animations ——— */
const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease },
  }),
};


export default function Home() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);

  // Pick a random subtitle variation on mount (client-only to avoid hydration mismatch)
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  useEffect(() => {
    setSubtitleIndex(Math.floor(Math.random() * t.hero.subtitles.length));
  }, [t.hero.subtitles.length]);
  const subtitle = t.hero.subtitles[subtitleIndex];

  const navigateWithTransition = useCallback((href: string) => {
    setTransitioning(true);
    setTimeout(() => router.push(href), 300);
  }, [router]);

  return (
    <div className="atmo-page overflow-x-hidden">
      <Header onNavigate={navigateWithTransition} />

      {/* Page transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] bg-[#0a1628]"
          />
        )}
      </AnimatePresence>

      {/* ═══════ HERO ═══════ */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 sm:px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-[15%] top-[20%] h-[300px] w-[300px] rounded-full bg-[#2563eb]/15 blur-[80px] sm:h-[500px] sm:w-[500px] sm:blur-[120px]" />
          <div className="absolute -right-[10%] bottom-[15%] h-[250px] w-[250px] rounded-full bg-[#7c3aed]/10 blur-[60px] sm:h-[400px] sm:w-[400px] sm:blur-[100px]" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
            className="mb-10"
          >
            <GhostMascot className="scale-100" />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.p
              key={`hero-tagline-${locale}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease }}
              className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/30"
            >
              {t.hero.tagline}
            </motion.p>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.h1
              key={`hero-title-${locale}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease }}
              className="mt-6 text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl md:text-7xl"
            >
              {t.hero.title.split(" ").map((word, i) => (
                <motion.span
                  key={`${locale}-${i}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease }}
                  className="inline-block will-change-transform"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
              {" "}
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease }}
                className="atmo-shimmer relative inline-block bg-gradient-to-r from-[#60a5fa] via-[#c084fc] to-[#60a5fa] bg-[length:200%_auto] bg-clip-text text-transparent will-change-transform"
              >
                {t.hero.brand}
                <span className="pointer-events-none absolute -inset-4 -z-10 block rounded-full bg-[#7c3aed]/20 blur-2xl" />
              </motion.span>
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`hero-subtitle-${locale}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease }}
              className="mt-8 max-w-2xl text-center"
            >
              {/* First line — the provoc' */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6, ease }}
                className="text-base leading-relaxed text-white/35 line-through decoration-white/15 md:text-lg"
              >
                {subtitle[0].text}
              </motion.p>

              {/* Second line — the promise, with highlighted words */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6, ease }}
                className="mt-3 text-lg md:text-xl font-medium leading-relaxed"
              >
                {subtitle.slice(1).map((segment: { text: string; highlight?: boolean; dim?: boolean }, i: number) =>
                  segment.highlight ? (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + i * 0.2, duration: 0.5, ease }}
                      className="relative inline-block bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#c084fc] bg-clip-text text-transparent"
                    >
                      {segment.text}
                      <span className="pointer-events-none absolute -inset-1 -z-10 block rounded-md bg-[#7c3aed]/10 blur-sm" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 + i * 0.2, duration: 0.5, ease }}
                      className="text-white/60"
                    >
                      {" "}{segment.text}{" "}
                    </motion.span>
                  )
                )}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* CTA */}
          <motion.div custom={3} variants={fadeUp} className="mt-10 flex flex-col items-center gap-5">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5, ease }}
              onClick={() => {
                document.getElementById("languages")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] px-8 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white shadow-lg shadow-[#a78bfa]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#a78bfa]/30 hover:brightness-110"
            >
              {t.hero.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>

          <motion.p
            custom={5}
            variants={fadeUp}
            className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-white/20"
          >
            {t.hero.free}
          </motion.p>
        </motion.div>
      </section>

      {/* ——— Divider ——— */}
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ═══════ LANGUAGES ═══════ */}
      <section id="languages" className="px-4 py-16 sm:px-6 sm:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.p custom={0} variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/45">
            {t.languages.label}
          </motion.p>
          <motion.p custom={1} variants={fadeUp} className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
            {t.hero.cta}
          </motion.p>

          <motion.div custom={2} variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-5">
            {[
              { code: "fr", flag: "🇫🇷", hoverBorder: "hover:border-[#002395]/40", hoverBg: "hover:bg-[#002395]/10", hoverGlow: "#002395" },
              { code: "gb", flag: "🇬🇧", hoverBorder: "hover:border-[#c8102e]/40", hoverBg: "hover:bg-[#c8102e]/10", hoverGlow: "#c8102e" },
              { code: "es", flag: "🇪🇸", hoverBorder: "hover:border-[#f1bf00]/40", hoverBg: "hover:bg-[#f1bf00]/10", hoverGlow: "#f1bf00" },
              { code: "jp", flag: "🇯🇵", hoverBorder: "hover:border-[#bc002d]/40", hoverBg: "hover:bg-[#bc002d]/10", hoverGlow: "#bc002d" },
              { code: "ru", flag: "🇷🇺", hoverBorder: "hover:border-[#0039a6]/40", hoverBg: "hover:bg-[#0039a6]/10", hoverGlow: "#0039a6" },
              { code: "cn", flag: "🇨🇳", hoverBorder: "hover:border-[#de2910]/40", hoverBg: "hover:bg-[#de2910]/10", hoverGlow: "#de2910" },
              { code: "kr", flag: "🇰🇷", hoverBorder: "hover:border-[#003478]/40", hoverBg: "hover:bg-[#003478]/10", hoverGlow: "#003478" },
            ].map((lang, i) => {
              const langName = t.languages.items.find((l) => l.code === lang.code)?.name ?? lang.code;
              return (
                <motion.button
                  key={lang.code}
                  custom={i + 3}
                  variants={fadeUp}
                  onClick={() => navigateWithTransition(`/register?lang=${lang.code}`)}
                  className={`group relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 ${lang.hoverBorder} ${lang.hoverBg}`}
                >
                  {/* Glow effect on hover */}
                  <div
                    className="pointer-events-none absolute -inset-2 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-[0.12]"
                    style={{ background: lang.hoverGlow }}
                  />
                  {/* Flag image */}
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://flagcdn.com/w80/${lang.code}.png`}
                      srcSet={`https://flagcdn.com/w160/${lang.code}.png 2x`}
                      alt={langName}
                      width={40}
                      height={30}
                      className="relative rounded-sm transition-all duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className="relative font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors group-hover:text-white/80">
                    {langName}
                  </span>
                  {/* Language code badge on hover */}
                  <span className="absolute -right-1 -top-1 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-white/60 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    {lang.code}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          <motion.p custom={10} variants={fadeUp} className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
            {t.languages.soon}
          </motion.p>
        </motion.div>
      </section>

      {/* ——— Divider ——— */}
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ═══════ ANTI-FEATURES ═══════ */}
      <section className="px-4 py-8 sm:px-6 sm:py-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mx-auto max-w-3xl rounded-2xl border border-white/[0.06] bg-white/[0.02] px-8 py-6 backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {t.anti.items.map((text, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                className="flex items-center gap-2.5"
              >
                <Check className="h-3.5 w-3.5 text-[#60a5fa]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/60">
                  {text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ——— Divider ——— */}
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ═══════ IMAGINE ═══════ */}
      <section className="px-4 py-16 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="text-center"
          >
            <motion.p custom={0} variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#fbbf24]/60">
              {t.imagine.label}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="mt-12 grid gap-4 sm:grid-cols-2"
          >
            {t.imagine.scenes.map((scene: { emoji: string; city: string; text: string }, i: number) => {
              const cityImages: Record<string, string> = {
                "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
                "Londres": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80",
                "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80",
                "Barcelone": "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=600&q=80",
                "Barcelona": "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=600&q=80",
                "Berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&q=80",
              };
              const bgImage = cityImages[scene.city] || "";
              return (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  className="group relative h-48 overflow-hidden rounded-2xl border border-white/[0.06] transition-all duration-500 hover:border-[#fbbf24]/30"
                >
                  {/* Background image — visible on hover with zoom */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-0 transition-[opacity,transform] duration-700 ease-out group-hover:opacity-100 group-hover:scale-110"
                    style={{ backgroundImage: `url(${bgImage})` }}
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-[#0a1628]/80 transition-opacity duration-500 group-hover:bg-[#0a1628]/50" />
                  {/* Gradient bottom for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/95 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  {/* Content */}
                  <div className="relative z-10 flex h-full flex-col justify-end p-6">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl drop-shadow-lg">{scene.emoji}</span>
                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-[#fbbf24]/50 transition-colors duration-500 group-hover:text-[#fbbf24]/80">
                          {scene.city}
                        </p>
                        <p className="mt-2 text-[15px] leading-relaxed text-white/70 transition-colors duration-500 group-hover:text-white">
                          {scene.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6, ease }}
            className="mt-10 text-center text-lg font-semibold text-white/80"
          >
            {t.imagine.punchline}
          </motion.p>
        </div>
      </section>

      {/* ——— Divider ——— */}
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ═══════ DEMO MOCKUP ═══════ */}
      <section className="px-4 py-16 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-10 sm:gap-16 lg:grid-cols-[1fr_1.1fr]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <motion.p custom={0} variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#34d399]/70">
                {t.demo.label}
              </motion.p>
              <motion.h2 custom={1} variants={fadeUp} className="mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
                {t.demo.title}
              </motion.h2>
              <motion.div custom={2} variants={fadeUp} className="mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-[#34d399] to-[#60a5fa]" />
              <motion.p custom={3} variants={fadeUp} className="mt-6 text-sm leading-relaxed text-white/55">
                {t.demo.subtitle}
              </motion.p>

              {/* Social proof stats */}
              <motion.div custom={4} variants={fadeUp} className="mt-10 grid grid-cols-2 gap-4">
                {[
                  { value: "∞", label: t.social.conversations },
                  { value: "50+", label: t.social.scenarios },
                  { value: "24/7", label: t.social.corrections },
                  { value: "A1→C2", label: t.social.levels },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Conversation mockup — auto-cycling languages */}
            <DemoChat />
          </div>
        </div>
      </section>

      {/* ——— Divider ——— */}
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />


      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="px-4 py-16 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-16 flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <motion.p custom={0} variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#f472b6]/70">
                {t.testimonials.label}
              </motion.p>
              <motion.h2 custom={1} variants={fadeUp} className="mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
                {t.testimonials.title}
              </motion.h2>
              <motion.div custom={2} variants={fadeUp} className="mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-[#f472b6] to-[#a78bfa]" />
            </div>
            <motion.div custom={2} variants={fadeUp} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-4">
              <p className="text-3xl font-bold text-white">{t.testimonials.count}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">{t.testimonials.countLabel}</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid gap-5 md:grid-cols-2"
          >
            {t.testimonials.items.map((item: { name: string; role: string; avatar: string; text: string; lang: string; level: string }, i: number) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-sm transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.06]"
              >
                <div className="relative">
                  {/* Quote mark */}
                  <span className="absolute -top-2 -left-1 text-4xl text-white/[0.06] font-serif">&ldquo;</span>

                  <p className="relative z-10 text-[14px] leading-relaxed text-white/60 italic transition-colors group-hover:text-white/75">
                    {item.text}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#60a5fa]/30 to-[#a78bfa]/30 font-mono text-[11px] font-semibold text-white/70">
                        {item.avatar}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white/85">{item.name}</p>
                        <p className="font-mono text-[10px] text-white/35">{item.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#a78bfa]/60">{item.lang}</p>
                      <p className="font-mono text-[10px] font-semibold text-white/40">{item.level}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ——— Divider ——— */}
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ═══════ PRICING ═══════ */}
      <section id="pricing" className="px-4 py-16 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-16 text-center"
          >
            <motion.p custom={0} variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#a78bfa]/70">
              {t.pricing.label}
            </motion.p>
            <motion.h2 custom={1} variants={fadeUp} className="mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
              {t.pricing.title}
            </motion.h2>
            <motion.div custom={2} variants={fadeUp} className="mx-auto mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#60a5fa]" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid gap-6 md:grid-cols-2"
          >
            {/* Free */}
            <motion.div custom={0} variants={fadeUp} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-9 backdrop-blur-sm transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.06]">
              {/* Subtle glow */}
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#60a5fa]/[0.05] blur-3xl transition-all duration-500 group-hover:bg-[#60a5fa]/[0.1]" />

              <div className="relative">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/50">{t.pricing.free.name}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">{t.pricing.free.levels}</p>
                <p className="mt-6 text-5xl font-bold text-white">
                  {t.pricing.free.price}<span className="ml-1 text-lg text-white/40">€</span>
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">{t.pricing.free.period}</p>

                <div className="mt-8 space-y-4">
                  {t.pricing.free.features.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#60a5fa]/15">
                        <Check className="h-2.5 w-2.5 text-[#60a5fa]" />
                      </div>
                      <span className="text-sm text-white/60">{item}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => navigateWithTransition("/register")} className="mt-8 block w-full cursor-pointer rounded-full border border-white/15 bg-white/[0.06] py-3.5 text-center font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-white/80 transition-all hover:border-white/25 hover:bg-white/[0.12] hover:text-white">
                  {t.pricing.free.cta}
                </button>
              </div>
            </motion.div>

            {/* Premium */}
            <motion.div custom={1} variants={fadeUp} className="group relative rounded-2xl border border-[#a78bfa]/20 bg-gradient-to-b from-[#a78bfa]/[0.08] via-[#60a5fa]/[0.04] to-transparent p-9 pt-12 transition-all duration-500 hover:border-[#a78bfa]/35">
              {/* Premium glow — clipped separately */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#a78bfa]/[0.08] blur-3xl transition-all duration-500 group-hover:bg-[#a78bfa]/[0.15]" />
                <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-[#60a5fa]/[0.05] blur-3xl" />
              </div>

              <div className="relative">
                <div className="absolute -top-8 left-0">
                  <span className="rounded-full bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-white shadow-lg shadow-[#a78bfa]/20">
                    {t.pricing.premium.badge}
                  </span>
                </div>

                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#a78bfa]/80">{t.pricing.premium.name}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">{t.pricing.premium.levels}</p>
                <p className="mt-6 text-5xl font-bold text-white">
                  {t.pricing.premium.price}<span className="ml-1 text-lg text-white/40">€</span>
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">{t.pricing.premium.period}</p>

                <div className="mt-8 space-y-4">
                  {t.pricing.premium.features.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#a78bfa]/20">
                        <Check className="h-2.5 w-2.5 text-[#a78bfa]" />
                      </div>
                      <span className="text-sm font-medium text-white/70">{item}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => navigateWithTransition("/register")} className="mt-8 block w-full cursor-pointer rounded-full bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] py-3.5 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white shadow-lg shadow-[#a78bfa]/25 transition-all hover:shadow-xl hover:shadow-[#a78bfa]/30 hover:brightness-110">
                  {t.pricing.premium.cta}
                </button>
                <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
                  {t.pricing.premium.note}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ——— Divider ——— */}
      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ═══════ CTA ═══════ */}
      <section className="relative overflow-hidden bg-[#0a1628]/60 px-4 py-20 sm:px-6 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0a1628]/40 to-[#0a1628]/80" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2563eb]/10 blur-[140px]" />
          <div className="absolute -right-[10%] top-[20%] h-[300px] w-[300px] rounded-full bg-[#7c3aed]/8 blur-[100px]" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 mx-auto max-w-3xl text-center"
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t.cta.title}{" "}
            <span className="bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#c084fc] bg-clip-text text-transparent">
              {t.cta.highlight}
            </span>
          </motion.h2>

          <motion.p custom={1} variants={fadeUp} className="mt-6 text-base text-white/55 md:text-lg">
            {t.cta.subtitle}
          </motion.p>

          <motion.div custom={2} variants={fadeUp}>
            <button
              onClick={() => navigateWithTransition("/register")}
              className="group mt-10 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-8 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0f2a4a] transition-all duration-300 hover:shadow-xl hover:shadow-white/10"
            >
              {t.cta.button}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative border-t border-white/[0.08] bg-[#0a1628]/80 px-4 py-10 sm:px-6 sm:py-16 backdrop-blur-sm">
        {/* Dark overlay to counteract the atmo-page gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050d1a] via-[#0a1628]/90 to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
            {/* Brand */}
            <div className="space-y-3">
              <span className="bg-gradient-to-r from-white/80 to-white/50 bg-clip-text font-mono text-sm font-bold uppercase tracking-[0.25em] text-transparent">
                Lingyou
              </span>
              <p className="max-w-xs text-[13px] leading-relaxed text-white/40">
                {t.footer.description}
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-10 sm:gap-16">
              <div className="space-y-3">
                <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{t.footer.product}</h4>
                <nav className="flex flex-col gap-2.5">
                  <a href="#pricing" className="text-[13px] text-white/35 transition-colors hover:text-white/70">{t.nav.pricing}</a>
                </nav>
              </div>
              <div className="space-y-3">
                <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{t.footer.legal}</h4>
                <nav className="flex flex-col gap-2.5">
                  <Link href="#" className="text-[13px] text-white/35 transition-colors hover:text-white/70">{t.footer.privacy}</Link>
                  <Link href="#" className="text-[13px] text-white/35 transition-colors hover:text-white/70">{t.footer.terms}</Link>
                  <Link href="#" className="text-[13px] text-white/35 transition-colors hover:text-white/70">{t.footer.contact}</Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 border-t border-white/[0.06] pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25">
              &copy; {new Date().getFullYear()} Lingyou. {t.footer.rights}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
