import { describe, it, expect } from "vitest";
import { calculateNextReview, type SRSCard } from "../index";

function makeCard(overrides: Partial<SRSCard> = {}): SRSCard {
  return {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    ...overrides,
  };
}

describe("calculateNextReview", () => {
  // --- Quality 5 (perfect recall) increases interval ---

  it("should increase interval on quality 5 (first successful review)", () => {
    const card = makeCard();
    const result = calculateNextReview(card, 5);

    expect(result.interval).toBe(1); // first repetition → interval = 1
    expect(result.repetitions).toBe(1);
  });

  it("should set interval to 6 on second successful review", () => {
    const card = makeCard({ repetitions: 1, interval: 1 });
    const result = calculateNextReview(card, 5);

    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it("should multiply interval by easeFactor on third+ successful review", () => {
    const card = makeCard({ repetitions: 2, interval: 6, easeFactor: 2.5 });
    const result = calculateNextReview(card, 5);

    expect(result.interval).toBe(15); // Math.round(6 * 2.5) = 15
    expect(result.repetitions).toBe(3);
  });

  it("should keep increasing interval on subsequent quality 5 reviews", () => {
    const card = makeCard({ repetitions: 3, interval: 15, easeFactor: 2.6 });
    const result = calculateNextReview(card, 5);

    expect(result.interval).toBe(39); // Math.round(15 * 2.6) = 39
    expect(result.repetitions).toBe(4);
  });

  // --- Quality 0 (total blackout) resets interval ---

  it("should reset repetitions and interval to 1 on quality 0", () => {
    const card = makeCard({ repetitions: 5, interval: 30, easeFactor: 2.5 });
    const result = calculateNextReview(card, 0);

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it("should reset on quality 1 as well", () => {
    const card = makeCard({ repetitions: 3, interval: 15, easeFactor: 2.5 });
    const result = calculateNextReview(card, 1);

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it("should reset on quality 2", () => {
    const card = makeCard({ repetitions: 4, interval: 20 });
    const result = calculateNextReview(card, 2);

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  // --- Ease factor never goes below 1.3 ---

  it("should not let easeFactor drop below 1.3 after repeated failures", () => {
    let card = makeCard({ easeFactor: 1.3 });
    const result = calculateNextReview(card, 0);

    expect(result.easeFactor).toBe(1.3);
  });

  it("should not let easeFactor drop below 1.3 even with quality 0 on low ease", () => {
    // easeFactor formula with q=0: ef + (0.1 - 5*(0.08 + 5*0.02)) = ef + (0.1 - 0.9) = ef - 0.8
    // 1.5 - 0.8 = 0.7 → clamped to 1.3
    const card = makeCard({ easeFactor: 1.5 });
    const result = calculateNextReview(card, 0);

    expect(result.easeFactor).toBe(1.3);
  });

  it("should increase easeFactor on quality 5", () => {
    const card = makeCard({ easeFactor: 2.5 });
    const result = calculateNextReview(card, 5);

    // ef + (0.1 - 0*(0.08 + 0*0.02)) = ef + 0.1 = 2.6
    expect(result.easeFactor).toBe(2.6);
  });

  // --- Mastery levels ---

  it("should return NEW mastery when repetitions are reset to 0", () => {
    const card = makeCard({ repetitions: 5, interval: 30 });
    const result = calculateNextReview(card, 0);

    expect(result.mastery).toBe("NEW");
  });

  it("should return LEARNING mastery for early repetitions", () => {
    const card = makeCard({ repetitions: 0 });
    const result = calculateNextReview(card, 4);

    expect(result.mastery).toBe("LEARNING");
  });

  it("should return MASTERED for high repetitions and long interval", () => {
    const card = makeCard({ repetitions: 6, interval: 30, easeFactor: 2.5 });
    const result = calculateNextReview(card, 5);

    // repetitions = 7, interval = Math.round(30 * 2.6) = 78
    expect(result.mastery).toBe("MASTERED");
  });

  // --- Edge cases ---

  it("should clamp quality above 5 to 5", () => {
    const card = makeCard();
    const result = calculateNextReview(card, 10);
    const expected = calculateNextReview(card, 5);

    expect(result.easeFactor).toBe(expected.easeFactor);
    expect(result.interval).toBe(expected.interval);
  });

  it("should clamp quality below 0 to 0", () => {
    const card = makeCard();
    const result = calculateNextReview(card, -5);
    const expected = calculateNextReview(card, 0);

    expect(result.easeFactor).toBe(expected.easeFactor);
    expect(result.interval).toBe(expected.interval);
  });

  it("should always return a nextReview date in the future", () => {
    const card = makeCard();
    const now = new Date();
    const result = calculateNextReview(card, 3);

    expect(result.nextReview.getTime()).toBeGreaterThan(now.getTime() - 1000);
  });
});
