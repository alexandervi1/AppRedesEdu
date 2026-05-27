import { CommandTopic } from "../data/commands";
import { CourseTrack, Locale } from "../types";

export type AiStatus = {
  available: boolean;
  model: string;
  modelInstalled: boolean;
  models: string[];
  message?: string;
};

export type PracticeMode = "recognize" | "write" | "configure" | "diagnose";

export type TutorChallenge = CommandTopic["challenge"];

export type NextChallengeResult = {
  challenge: TutorChallenge;
  content: string;
  model?: string;
  source?: "ai" | "local";
};

export const getAiStatus = async (): Promise<AiStatus> => {
  const response = await fetch("/api/ai/status");
  if (!response.ok) throw new Error("No se pudo consultar el estado de IA.");
  return response.json();
};

export const requestTutorFeedback = async ({
  locale,
  courseTrack,
  trackLabel,
  topic,
  challenge,
  studentAnswer,
  isCorrect,
  mode,
}: {
  locale: Locale;
  courseTrack: CourseTrack;
  trackLabel: string;
  topic: CommandTopic;
  challenge: TutorChallenge;
  studentAnswer: string;
  isCorrect: boolean;
  mode: PracticeMode;
}): Promise<string> => {
  const response = await fetch("/api/ai/tutor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      locale,
      courseTrack,
      trackLabel,
      topic,
      challenge,
      studentAnswer,
      isCorrect,
      mode,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "No se pudo obtener feedback del tutor IA.");
  }

  const data = await response.json();
  return data.content ?? "";
};

export const requestNextChallenge = async ({
  locale,
  courseTrack,
  trackLabel,
  topic,
  recentAttempts,
  mode,
}: {
  locale: Locale;
  courseTrack: CourseTrack;
  trackLabel: string;
  topic: CommandTopic;
  recentAttempts: unknown[];
  mode: PracticeMode;
}): Promise<NextChallengeResult> => {
  const response = await fetch("/api/ai/next-challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale, courseTrack, trackLabel, topic, recentAttempts, mode }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "No se pudo generar el siguiente reto.");
  }

  const data = await response.json();
  return {
    challenge: data.challenge ?? topic.challenge,
    content: data.content ?? "",
    model: data.model,
    source: data.source,
  };
};
