import type { CECRLevel } from "@/generated/prisma/enums";

// API response format
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// User with related data
export interface UserWithProgress {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  nativeLanguage: string;
  subscription: {
    status: string;
  } | null;
  userLanguages: Array<{
    id: string;
    languageId: string;
    level: CECRLevel;
    language: {
      code: string;
      name: string;
      flag: string;
    };
  }>;
}

// Dashboard stats
export interface DashboardStats {
  wordsLearned: number;
  lessonsCompleted: number;
  practiceHours: number;
  conversationsHeld: number;
  currentStreak: number;
  currentLevel: CECRLevel;
  levelProgress: number; // 0-100
  skills: SkillRadar;
}

export interface SkillRadar {
  listening: number;    // 0-100
  reading: number;      // 0-100
  writing: number;      // 0-100
  speaking: number;     // 0-100
  grammar: number;      // 0-100
  vocabulary: number;   // 0-100
}

// Chapter with progress
export interface ChapterWithProgress {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  order: number;
  status: "locked" | "in_progress" | "completed";
  lessonsTotal: number;
  lessonsCompleted: number;
}

// Flashcard review session
export interface FlashcardReviewItem {
  id: string;
  front: string;
  back: string;
  audioUrl: string | null;
  mastery: string;
}
