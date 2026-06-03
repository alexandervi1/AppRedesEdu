import { ProgressState } from "@shared/types";

const STORAGE_KEY = "app-redes-progress";

export const defaultProgress = (): ProgressState => ({
  completedLessons: [],
  quizScores: {},
  commandAttempts: {},
  studyStreak: 1,
  lastAccess: new Date().toISOString(),
});

export const loadProgress = (): ProgressState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as ProgressState;
    return {
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      quizScores: parsed.quizScores && typeof parsed.quizScores === "object" ? parsed.quizScores : {},
      commandAttempts:
        parsed.commandAttempts && typeof parsed.commandAttempts === "object" ? parsed.commandAttempts : {},
      studyStreak: Number.isFinite(parsed.studyStreak) ? parsed.studyStreak : 1,
      lastAccess: parsed.lastAccess || new Date().toISOString(),
    };
  } catch {
    return defaultProgress();
  }
};

export const saveProgress = (progress: ProgressState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const markLessonComplete = (progress: ProgressState, lessonId: string): ProgressState => {
  if (progress.completedLessons.includes(lessonId)) return progress;
  return {
    ...progress,
    completedLessons: [...progress.completedLessons, lessonId],
    lastAccess: new Date().toISOString(),
  };
};

export const saveQuizScore = (progress: ProgressState, moduleId: string, score: number): ProgressState => ({
  ...progress,
  quizScores: {
    ...progress.quizScores,
    [moduleId]: Math.max(progress.quizScores[moduleId] ?? 0, score),
  },
  lastAccess: new Date().toISOString(),
});

export const recordCommandAttempt = (
  progress: ProgressState,
  challengeId: string,
  answer: string,
  isCorrect: boolean,
): ProgressState => {
  const current = progress.commandAttempts[challengeId] ?? {
    attempts: 0,
    correct: 0,
    lastAnswer: "",
    lastAccess: new Date().toISOString(),
  };

  return {
    ...progress,
    commandAttempts: {
      ...progress.commandAttempts,
      [challengeId]: {
        attempts: current.attempts + 1,
        correct: current.correct + (isCorrect ? 1 : 0),
        lastAnswer: answer,
        lastAccess: new Date().toISOString(),
      },
    },
    lastAccess: new Date().toISOString(),
  };
};
