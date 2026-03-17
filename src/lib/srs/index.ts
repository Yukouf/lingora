/**
 * SM-2+ Spaced Repetition Algorithm
 * Based on the SuperMemo SM-2 algorithm with modifications
 *
 * Quality ratings:
 * 0 - Complete blackout, no recall
 * 1 - Incorrect, but recognized after seeing answer
 * 2 - Incorrect, but easy to recall after seeing answer
 * 3 - Correct with significant difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect, instant recall
 */

export interface SRSCard {
  easeFactor: number;
  interval: number; // in days
  repetitions: number;
}

export interface SRSResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  mastery: "NEW" | "LEARNING" | "ACQUIRED" | "MASTERED";
}

export function calculateNextReview(card: SRSCard, quality: number): SRSResult {
  // Clamp quality between 0 and 5
  const q = Math.max(0, Math.min(5, quality));

  let { easeFactor, interval, repetitions } = card;

  if (q < 3) {
    // Failed — reset repetitions but keep some ease factor memory
    repetitions = 0;
    interval = 1;
  } else {
    // Successful recall
    repetitions += 1;

    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easeFactor = Math.max(1.3, easeFactor); // Minimum ease factor

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  // Determine mastery level
  let mastery: SRSResult["mastery"];
  if (repetitions === 0) {
    mastery = "NEW";
  } else if (repetitions < 3) {
    mastery = "LEARNING";
  } else if (repetitions < 7 || interval < 30) {
    mastery = "ACQUIRED";
  } else {
    mastery = "MASTERED";
  }

  return { easeFactor, interval, repetitions, nextReview, mastery };
}

export function getCardsForReview(cards: Array<SRSCard & { id: string; nextReview: Date }>): typeof cards {
  const now = new Date();
  return cards
    .filter((card) => card.nextReview <= now)
    .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
}
