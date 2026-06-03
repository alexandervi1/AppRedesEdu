import knowledgeBase from "./knowledgeBase.json";
import { BilingualText, CourseModule, Lesson, QuizQuestion } from "@shared/types";

const MIN_QUIZ_QUESTIONS = 50;

const genericOptions: BilingualText[] = [
  { es: "Revisar capa física antes de cambiar routing", en: "Check the physical layer before changing routing" },
  { es: "Validar tabla de routing y ruta de retorno", en: "Validate the routing table and return path" },
  { es: "Confirmar VLAN, trunk y gateway", en: "Confirm VLAN, trunk, and gateway" },
  { es: "Verificar estado, modo y comando show apropiado", en: "Verify state, mode, and the appropriate show command" },
  { es: "Aislar el problema por capas", en: "Isolate the problem by layers" },
  { es: "Comparar configuración esperada contra estado operativo", en: "Compare expected configuration against operational state" },
  { es: "Probar conectividad con ping y traceroute", en: "Test connectivity with ping and traceroute" },
  { es: "Documentar el cambio y guardar configuración", en: "Document the change and save configuration" },
];

const sourceName = (sourceId: string) => knowledgeBase.sources.find((source) => source.id === sourceId)?.file ?? sourceId;

const dedupeOptions = (correct: BilingualText, candidates: BilingualText[], seed: number) => {
  const seen = new Set<string>([correct.es.toLowerCase()]);
  const options = [correct];

  for (const candidate of candidates) {
    const key = candidate.es.toLowerCase();
    if (seen.has(key)) continue;
    options.push(candidate);
    seen.add(key);
    if (options.length === 4) break;
  }

  for (const fallback of genericOptions) {
    const key = fallback.es.toLowerCase();
    if (seen.has(key)) continue;
    options.push(fallback);
    seen.add(key);
    if (options.length === 4) break;
  }

  const correctIndex = seed % 4;
  const rotated = [...options.slice(0, 4)];
  const [answer] = rotated.splice(0, 1);
  rotated.splice(correctIndex, 0, answer);
  return { options: rotated, correctIndex };
};

const allLessonTerms = (module: CourseModule) => module.lessons.flatMap((lesson) => lesson.keyTerms);

const makeQuestion = ({
  id,
  prompt,
  correct,
  distractors,
  explanation,
  seed,
}: {
  id: string;
  prompt: BilingualText;
  correct: BilingualText;
  distractors: BilingualText[];
  explanation: BilingualText;
  seed: number;
}): QuizQuestion => {
  const { options, correctIndex } = dedupeOptions(correct, distractors, seed);
  return { id, prompt, options, correctIndex, explanation };
};

const lessonQuestionTemplates = (module: CourseModule, lesson: Lesson, lessonIndex: number): QuizQuestion[] => {
  const terms = allLessonTerms(module);
  const otherTerms = terms.filter((term) => !lesson.keyTerms.some((own) => own.es === term.es));
  const sourceOptions = knowledgeBase.sources.map((source) => ({ es: source.file, en: source.file }));
  const firstSource = lesson.sourceRefs[0];
  const sourceCorrect = { es: firstSource ? sourceName(firstSource.sourceId) : module.title.es, en: firstSource ? sourceName(firstSource.sourceId) : module.title.en };

  return [
    makeQuestion({
      id: `${lesson.id}-objective`,
      prompt: {
        es: `¿Cuál es el objetivo principal del bloque "${lesson.title.es}"?`,
        en: `What is the main objective of "${lesson.title.en}"?`,
      },
      correct: lesson.objective,
      distractors: module.lessons.filter((item) => item.id !== lesson.id).map((item) => item.objective),
      explanation: {
        es: `El bloque se centra en: ${lesson.objective.es}`,
        en: `The lesson focuses on: ${lesson.objective.en}`,
      },
      seed: lessonIndex,
    }),
    makeQuestion({
      id: `${lesson.id}-practice`,
      prompt: {
        es: `¿Qué práctica de Packet Tracer corresponde mejor a "${lesson.title.es}"?`,
        en: `Which Packet Tracer practice best matches "${lesson.title.en}"?`,
      },
      correct: lesson.practice,
      distractors: module.lessons.filter((item) => item.id !== lesson.id).map((item) => item.practice),
      explanation: {
        es: "La práctica propuesta refuerza el objetivo operativo del bloque.",
        en: "The suggested practice reinforces the lesson's operational objective.",
      },
      seed: lessonIndex + 1,
    }),
    makeQuestion({
      id: `${lesson.id}-example`,
      prompt: {
        es: `Según el ejemplo del bloque, ¿qué acción o concepto aplica mejor al escenario?`,
        en: `According to the lesson example, which action or concept best applies to the scenario?`,
      },
      correct: lesson.keyTerms[0] ?? module.title,
      distractors: otherTerms,
      explanation: lesson.example,
      seed: lessonIndex + 2,
    }),
    makeQuestion({
      id: `${lesson.id}-source`,
      prompt: {
        es: `¿Qué fuente/PDF está enlazada como referencia para "${lesson.title.es}"?`,
        en: `Which source/PDF is linked as reference for "${lesson.title.en}"?`,
      },
      correct: sourceCorrect,
      distractors: sourceOptions.filter((source) => source.es !== sourceCorrect.es),
      explanation: {
        es: "Las referencias del bloque conectan la lección con la base de conocimiento local.",
        en: "The lesson references connect the lesson to the local knowledge base.",
      },
      seed: lessonIndex + 3,
    }),
    ...lesson.keyTerms.map((term, termIndex) =>
      makeQuestion({
        id: `${lesson.id}-term-${termIndex}`,
        prompt: {
          es: `¿Cuál de estos conceptos clave pertenece al bloque "${lesson.title.es}"?`,
          en: `Which key concept belongs to "${lesson.title.en}"?`,
        },
        correct: term,
        distractors: otherTerms,
        explanation: {
          es: `"${term.es}" aparece como concepto clave de este bloque.`,
          en: `"${term.en}" appears as a key concept in this lesson.`,
        },
        seed: lessonIndex + termIndex + 4,
      }),
    ),
  ];
};

const reinforceQuestion = (module: CourseModule, index: number): QuizQuestion => {
  const lesson = module.lessons[index % module.lessons.length];
  const terms = allLessonTerms(module);
  const term = lesson.keyTerms[index % Math.max(1, lesson.keyTerms.length)] ?? module.title;
  const variants = [
    {
      suffix: "diagnosis",
      prompt: {
        es: `En un laboratorio de ${module.title.es}, ¿qué concepto debes revisar primero si el síntoma coincide con el resumen del bloque?`,
        en: `In a ${module.title.en} lab, which concept should you review first if the symptom matches the lesson summary?`,
      },
      correct: term,
      explanation: lesson.summary,
    },
    {
      suffix: "verification",
      prompt: {
        es: `Para comprobar que entendiste "${lesson.title.es}", ¿qué opción resume mejor el enfoque del bloque?`,
        en: `To check your understanding of "${lesson.title.en}", which option best summarizes the lesson focus?`,
      },
      correct: lesson.objective,
      explanation: lesson.objective,
    },
    {
      suffix: "lab",
      prompt: {
        es: `¿Qué tarea práctica deberías ejecutar para reforzar "${module.title.es}"?`,
        en: `Which practical task should you run to reinforce "${module.title.en}"?`,
      },
      correct: lesson.practice,
      explanation: lesson.practice,
    },
    {
      suffix: "source",
      prompt: {
        es: `¿Qué bloque del curso se relaciona con este escenario: ${lesson.example.es}`,
        en: `Which course block relates to this scenario: ${lesson.example.en}`,
      },
      correct: lesson.title,
      explanation: lesson.example,
    },
  ];
  const variant = variants[index % variants.length];
  const distractors = [
    ...terms.filter((item) => item.es !== term.es),
    ...module.lessons.filter((item) => item.id !== lesson.id).map((item) => item.title),
    ...genericOptions,
  ];

  return makeQuestion({
    id: `${module.id}-reinforce-${index}-${variant.suffix}`,
    prompt: variant.prompt,
    correct: variant.correct,
    distractors,
    explanation: variant.explanation,
    seed: index,
  });
};

export const ensureMinimumQuizSize = (module: CourseModule, minimum = MIN_QUIZ_QUESTIONS): CourseModule => {
  const quiz = [...module.quiz];
  const generated = module.lessons.flatMap((lesson, index) => lessonQuestionTemplates(module, lesson, index));
  const seen = new Set(quiz.map((question) => question.id));

  for (const question of generated) {
    if (quiz.length >= minimum) break;
    if (seen.has(question.id)) continue;
    quiz.push(question);
    seen.add(question.id);
  }

  let index = 0;
  while (quiz.length < minimum) {
    const question = reinforceQuestion(module, index);
    if (!seen.has(question.id)) {
      quiz.push(question);
      seen.add(question.id);
    }
    index += 1;
  }

  return { ...module, quiz };
};
