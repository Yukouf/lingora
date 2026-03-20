"use client";

import { useI18n } from "@/lib/i18n/context";

export function LevelLabel({ level }: { level: string }) {
  const { t } = useI18n();
  return <>{t.dashboard.common.level} {level}</>;
}

export function ProgressionLabel({ level }: { level: string }) {
  const { t } = useI18n();
  return <>{t.dashboard.learn.progression} {level}</>;
}

export function LessonsCount({ completed, total }: { completed: number; total: number }) {
  const { t } = useI18n();
  return <>{completed}/{total} {t.dashboard.common.lessons}</>;
}

export function LevelCompletedCard({ level, nextLevel }: { level: string; nextLevel: string }) {
  const { t } = useI18n();
  return (
    <>
      <p className="text-white/50 text-sm mb-4">
        {t.dashboard.learn.levelCompleted.replace("{level}", level)}
      </p>
    </>
  );
}

export function PremiumLabel() {
  const { t } = useI18n();
  return <>{t.dashboard.common.premium}</>;
}

export function NextLevelCard({ nextLevel }: { nextLevel: string }) {
  const { t } = useI18n();
  return (
    <>
      <h3 className="font-bold text-white">
        {t.dashboard.learn.nextLevelAvailable.replace("{level}", nextLevel)}
      </h3>
      <p className="text-sm text-white/40 mt-0.5">{t.dashboard.learn.continueCourse}</p>
    </>
  );
}

export function ContinueLabel() {
  const { t } = useI18n();
  return <>{t.dashboard.common.continue}</>;
}

export function BackToCourseLabel() {
  const { t } = useI18n();
  return <>{t.dashboard.learn.backToCourse}</>;
}

export function PremiumContentLabel() {
  const { t } = useI18n();
  return <>{t.dashboard.common.premiumContent}</>;
}

export function ChapterLevelLabel({ level }: { level: string }) {
  const { t } = useI18n();
  return <>{t.dashboard.learn.partOfLevel.replace("{level}", level)}</>;
}

export function BackLabel() {
  const { t } = useI18n();
  return <>{t.dashboard.common.back}</>;
}

export function ExercisesCount({ count }: { count: number }) {
  const { t } = useI18n();
  return <>{count} {t.dashboard.common.exercises}</>;
}

export function StartLessonLabel() {
  const { t } = useI18n();
  return <>{t.dashboard.learn.startLesson}</>;
}
