import { CourseModule, Locale, QuizQuestion } from "@shared/types";

export type GeneratedQuizResult = {
  questions: QuizQuestion[];
  source: "ai" | "local";
  model: string;
  knowledgeEntryIds: string[];
  warning?: string;
};

export const requestGeneratedQuizQuestions = async ({
  locale,
  module,
  count = 3,
}: {
  locale: Locale;
  module: CourseModule;
  count?: number;
}): Promise<GeneratedQuizResult> => {
  const response = await fetch("/api/ai/quiz-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale, module, count }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "No se pudieron generar preguntas.");
  }

  const data = await response.json();
  return {
    questions: Array.isArray(data.questions) ? data.questions : [],
    source: data.source === "ai" ? "ai" : "local",
    model: data.model ?? "validated-local-generator",
    knowledgeEntryIds: Array.isArray(data.knowledgeEntryIds) ? data.knowledgeEntryIds : [],
    warning: data.warning,
  };
};
