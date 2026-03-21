import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChaptersWithProgress, levelRequiresPremium } from "@/lib/db/queries";
import Link from "next/link";
import { Lock, CheckCircle2, Play, Crown, ArrowRight } from "lucide-react";
import { ChapterIcon } from "@/components/learn/ChapterIcon";
import { LevelLabel, ProgressionLabel, LessonsCount, LevelCompletedCard, PremiumLabel, NextLevelCard, ContinueLabel } from "@/components/learn/LearnLabels";

// Background images per chapter title keyword
const chapterBackgrounds: Record<string, string> = {
  // A1 themes
  "présenter": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=75",
  "restaurant": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=75",
  "courses": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=75",
  "chemin": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=75",
  "hôtel": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=75",
  "famille": "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=75",
  // A2+ themes
  "travail": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=75",
  "santé": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=75",
  "voyage": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=75",
  "météo": "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&q=75",
  "sport": "https://images.unsplash.com/photo-1461896836934-bd45ba3e8cfe?w=600&q=75",
  "musique": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=75",
  "entretien": "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=600&q=75",
  "débattre": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=75",
  "opinion": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=75",
  "histoire": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=75",
  "email": "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&q=75",
  "professionnel": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=75",
  "transport": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=75",
};

function getChapterBg(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, url] of Object.entries(chapterBackgrounds)) {
    if (lower.includes(key)) return url;
  }
  return "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&q=75";
}

export default async function LearnPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { chapters, language, level, isPremium, levelCompleted, nextLevel } = await getChaptersWithProgress(session.user.id);
  const nextLevelNeedsPremium = nextLevel ? levelRequiresPremium(nextLevel) && !isPremium : false;

  if (!language || chapters.length === 0) {
    redirect("/onboarding");
  }

  const totalLessons = chapters.reduce((sum, c) => sum + c.lessonsTotal, 0);
  const completedLessons = chapters.reduce((sum, c) => sum + c.lessonsCompleted, 0);
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="mx-auto max-w-2xl pb-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{language.name}</h1>
            <p className="mt-0.5 text-sm text-white/40"><LevelLabel level={level} /></p>
          </div>
          <span className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-white/50">{language.code}</span>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span><ProgressionLabel level={level} /></span>
            <span className="font-medium text-white/60">{completedLessons}/{totalLessons}</span>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-white/60 transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-3">
        {chapters.map((chapter) => {
          const progress =
            chapter.lessonsTotal > 0
              ? (chapter.lessonsCompleted / chapter.lessonsTotal) * 100
              : 0;
          const isLocked = chapter.status === "locked";
          const isCompleted = chapter.status === "completed";
          const isInProgress = chapter.status === "in_progress";
          const bgUrl = getChapterBg(chapter.title);

          const card = (
            <div
              className={`group relative h-32 overflow-hidden rounded-2xl transition-all duration-300 ${
                isLocked
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20"
              }`}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url(${bgUrl})` }}
              />

              {/* Overlays */}
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                isLocked
                  ? "bg-[#0a1628]/90"
                  : "bg-gradient-to-r from-[#0a1628]/85 via-[#0a1628]/60 to-[#0a1628]/40"
              }`} />

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-between p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <ChapterIcon title={chapter.title} locked={isLocked} />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {chapter.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-white/40">
                        <LessonsCount completed={chapter.lessonsCompleted} total={chapter.lessonsTotal} />
                      </p>
                    </div>
                  </div>

                  {isLocked && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm">
                      <Lock className="h-3.5 w-3.5 text-white/30" />
                    </div>
                  )}
                  {isInProgress && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Play className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  {isCompleted && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 backdrop-blur-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {!isLocked && (
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-emerald-400" : "bg-white/70"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );

          return isLocked ? (
            <div key={chapter.id}>{card}</div>
          ) : (
            <Link key={chapter.id} href={`/learn/${chapter.id}`}>
              {card}
            </Link>
          );
        })}

        {/* Level completed + Next level */}
        {levelCompleted && nextLevel && (
          <div className="mt-4">
            {nextLevelNeedsPremium ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-amber-400" />
                  <h3 className="font-bold text-white"><LevelLabel level={nextLevel} /></h3>
                </div>
                <LevelCompletedCard level={level} nextLevel={nextLevel} />
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black font-medium rounded-xl text-sm hover:bg-white/90 transition-colors"
                >
                  <PremiumLabel />
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <NextLevelCard nextLevel={nextLevel} />
                  </div>
                  <Link
                    href="/api/learn/level-up"
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-xl text-sm hover:bg-white/90 transition-colors"
                  >
                    <ContinueLabel />
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
