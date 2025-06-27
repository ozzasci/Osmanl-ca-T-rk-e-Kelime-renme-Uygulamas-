import type { UserProgress } from "@shared/schema";

export interface SpacedRepetitionResult {
  interval: number;
  easeFactor: number;
  nextReviewDate: Date;
}

export function calculateNextReview(
  difficulty: 'easy' | 'medium' | 'hard',
  currentProgress?: UserProgress
): SpacedRepetitionResult {
  const now = new Date();
  
  // Default values for new words
  let interval = 1;
  let easeFactor = 2.5;
  let repetitions = 0;

  if (currentProgress) {
    interval = currentProgress.interval;
    easeFactor = currentProgress.easeFactor;
    repetitions = currentProgress.repetitions;
  }

  // SM-2 Algorithm implementation
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  if (difficulty === 'hard') {
    // Reset interval for hard answers
    newInterval = 1;
    newEaseFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    // Successful recall
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }

    // Adjust ease factor based on difficulty
    if (difficulty === 'easy') {
      newEaseFactor = easeFactor + 0.1;
    } else if (difficulty === 'medium') {
      newEaseFactor = Math.max(1.3, easeFactor - 0.08);
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReviewDate,
  };
}

export function getDifficultyFromScore(score: number): 'easy' | 'medium' | 'hard' {
  if (score >= 4) return 'easy';
  if (score >= 3) return 'medium';
  return 'hard';
}

export function getReviewPriority(progress: UserProgress): number {
  const now = new Date();
  const daysSinceReview = Math.floor(
    (now.getTime() - new Date(progress.nextReviewDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Words overdue for review get higher priority
  if (daysSinceReview > 0) {
    return daysSinceReview * 10 + (1 / progress.easeFactor);
  }
  
  return 0;
}
