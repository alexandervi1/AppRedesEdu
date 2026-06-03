import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createTeacherContent,
  deleteTeacherContent,
  listTeacherContent,
  updateTeacherContent,
} from "./teacherContentStore.js";
import { createSubject, deleteSubject, listSubjects, updateSubject } from "./subjectStore.js";

const app = express();
const port = Number(process.env.PORT ?? 5174);
const ollamaHost = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
const ollamaModel = process.env.OLLAMA_MODEL ?? "llama3.2:3b";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const knowledgeBasePath = path.resolve(__dirname, "../src/data/knowledgeBase.json");
const teacherContentPath = path.resolve(__dirname, "../data/teacherContent.json");
const subjectsPath = path.resolve(__dirname, "../data/subjects.json");
const knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, "utf8"));

app.use(cors({ origin: ["http://127.0.0.1:5173", "http://localhost:5173"] }));
app.use(express.json({ limit: "1mb" }));

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const sanitizeCiscoTerminology = (content) =>
  content
    .replace(/modo privado/gi, "modo privilegiado EXEC")
    .replace(/modo private/gi, "modo privilegiado EXEC")
    .replace(/modo privilegiado privado/gi, "modo privilegiado EXEC")
    .replace(/contraseña del modo privado/gi, "contraseña del modo privilegiado EXEC");

const callOllama = async (messages, options = {}) => {
  const response = await fetch(`${ollamaHost}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel,
      stream: false,
      messages,
      options: {
        temperature: options.temperature ?? 0.35,
        num_predict: options.num_predict ?? 280,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Ollama ${response.status}: ${detail}`);
  }

  const data = await response.json();
  return sanitizeCiscoTerminology(data?.message?.content ?? "");
};

const pickKnowledgeForModule = (module) => {
  const lessonEntryIds = new Set(
    Array.isArray(module?.lessons) ? module.lessons.map((lesson) => lesson.knowledgeEntryId).filter(Boolean) : [],
  );
  const moduleTerms = normalizeText(
    [
      module?.id,
      module?.title?.es,
      module?.title?.en,
      module?.description?.es,
      module?.description?.en,
    ].join(" "),
  );

  const linkedEntries = knowledgeBase.entries.filter((entry) => lessonEntryIds.has(entry.id));
  if (linkedEntries.length > 0) return linkedEntries.slice(0, 5);

  return knowledgeBase.entries
    .filter((entry) => {
      const searchable = normalizeText([entry.id, entry.title, ...(entry.tags ?? [])].join(" "));
      return moduleTerms.split(/\s+/).some((term) => term.length > 3 && searchable.includes(term));
    })
    .slice(0, 5);
};

const normalizeGeneratedQuestion = (question, index, locale = "es") => {
  const prompt = question?.prompt;
  const options = Array.isArray(question?.options) ? question.options : [];
  const explanation = question?.explanation;
  const correctIndex = Number(question?.correctIndex);

  if (
    !prompt?.es ||
    !prompt?.en ||
    options.length !== 4 ||
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex > 3 ||
    !explanation?.es ||
    !explanation?.en
  ) {
    return null;
  }

  return {
    id: `ai-quiz-${Date.now().toString(36)}-${index}`,
    prompt: {
      es: String(prompt.es),
      en: String(prompt.en),
    },
    options: options.map((option) => ({
      es: String(option?.es ?? option),
      en: String(option?.en ?? option?.es ?? option),
    })),
    correctIndex,
    explanation: {
      es: String(explanation.es),
      en: String(explanation.en),
    },
  };
};

const buildLocalQuizQuestions = ({ module, entries, count = 3 }) => {
  const usableEntries = entries.length > 0 ? entries : knowledgeBase.entries.slice(0, 3);
  return usableEntries.slice(0, count).map((entry, index) => {
    const fact = entry.facts?.[index % Math.max(1, entry.facts.length)] ?? entry.summary;
    const distractors = usableEntries
      .filter((candidate) => candidate.id !== entry.id)
      .slice(0, 3)
      .map((candidate) => ({
        es: candidate.title,
        en: candidate.title,
      }));
    while (distractors.length < 3) {
      distractors.push({
        es: ["Switching", "Routing", "Direccionamiento"][distractors.length] ?? "Redes",
        en: ["Switching", "Routing", "Addressing"][distractors.length] ?? "Networks",
      });
    }

    return {
      id: `local-quiz-${module?.id ?? "module"}-${entry.id}-${index}`,
      prompt: {
        es: `Segun la base de conocimiento, ¿que tema se relaciona mejor con esta idea: "${fact}"?`,
        en: `According to the knowledge base, which topic best matches this idea: "${fact}"?`,
      },
      options: [{ es: entry.title, en: entry.title }, ...distractors].slice(0, 4),
      correctIndex: 0,
      explanation: {
        es: entry.summary,
        en: entry.summary,
      },
    };
  });
};

app.get("/api/ai/status", async (_req, res) => {
  try {
    const response = await fetch(`${ollamaHost}/api/tags`);
    if (!response.ok) throw new Error(`Ollama status ${response.status}`);
    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models.map((model) => model.name) : [];
    res.json({
      available: true,
      model: ollamaModel,
      modelInstalled: models.some((name) => name === ollamaModel || name.startsWith(`${ollamaModel}:`)),
      models,
    });
  } catch (error) {
    res.json({
      available: false,
      model: ollamaModel,
      modelInstalled: false,
      models: [],
      message: "Ollama no esta disponible. Inicia Ollama y descarga el modelo configurado.",
    });
  }
});

app.get("/api/knowledge", (_req, res) => {
  res.json({
    version: knowledgeBase.version,
    sources: knowledgeBase.sources,
    entries: knowledgeBase.entries.map(({ id, title, tags, summary, sourceRefs }) => ({
      id,
      title,
      tags,
      summary,
      sourceRefs,
    })),
  });
});

app.get("/api/teacher/content", (_req, res) => {
  res.json({ items: listTeacherContent(teacherContentPath) });
});

app.get("/api/student/teacher-content", (_req, res) => {
  const items = listTeacherContent(teacherContentPath).filter((item) => item.status === "published");
  res.json({ items });
});

app.get("/api/subjects", (_req, res) => {
  const subjects = listSubjects(subjectsPath).filter((subject) => subject.status === "active");
  res.json({ subjects });
});

app.get("/api/teacher/subjects", (_req, res) => {
  res.json({ subjects: listSubjects(subjectsPath) });
});

app.post("/api/teacher/subjects", (req, res) => {
  const result = createSubject(subjectsPath, req.body ?? {});
  if (result.errors) return res.status(400).json({ errors: result.errors });
  res.status(201).json(result.subject);
});

app.put("/api/teacher/subjects/:id", (req, res) => {
  const result = updateSubject(subjectsPath, req.params.id, req.body ?? {});
  if (result.notFound) return res.status(404).json({ error: "Asignatura no encontrada." });
  if (result.errors) return res.status(400).json({ errors: result.errors });
  res.json(result.subject);
});

app.delete("/api/teacher/subjects/:id", (req, res) => {
  const result = deleteSubject(subjectsPath, req.params.id);
  if (result.notFound) return res.status(404).json({ error: "Asignatura no encontrada." });
  if (result.errors) return res.status(400).json({ errors: result.errors });
  res.status(204).send();
});

app.post("/api/teacher/content", (req, res) => {
  const result = createTeacherContent(teacherContentPath, req.body ?? {});
  if (result.errors) return res.status(400).json({ errors: result.errors });
  res.status(201).json(result.item);
});

app.put("/api/teacher/content/:id", (req, res) => {
  const result = updateTeacherContent(teacherContentPath, req.params.id, req.body ?? {});
  if (result.notFound) return res.status(404).json({ error: "Contenido no encontrado." });
  if (result.errors) return res.status(400).json({ errors: result.errors });
  res.json(result.item);
});

app.delete("/api/teacher/content/:id", (req, res) => {
  const result = deleteTeacherContent(teacherContentPath, req.params.id);
  if (result.notFound) return res.status(404).json({ error: "Contenido no encontrado." });
  res.status(204).send();
});

app.post("/api/ai/quiz-questions", async (req, res) => {
  const { locale = "es", module, count = 3 } = req.body ?? {};
  if (!module?.id || !module?.title || !Array.isArray(module?.lessons)) {
    return res.status(400).json({ error: "Falta contexto del modulo para generar preguntas." });
  }

  const questionCount = Math.max(1, Math.min(8, Number(count) || 3));
  const entries = pickKnowledgeForModule(module);
  const fallbackQuestions = buildLocalQuizQuestions({ module, entries, count: questionCount });

  try {
    const context = entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      summary: entry.summary,
      facts: entry.facts,
      commands: entry.commands,
      tags: entry.tags,
    }));

    const contentText = await callOllama([
      {
        role: "system",
        content: `Eres un disenador instruccional experto en redes.
Genera preguntas de opcion multiple a partir de una base de conocimiento validada.
Responde UNICAMENTE JSON valido con esta forma:
{
  "questions": [
    {
      "prompt": {"es": "...", "en": "..."},
      "options": [{"es": "...", "en": "..."}, {"es": "...", "en": "..."}, {"es": "...", "en": "..."}, {"es": "...", "en": "..."}],
      "correctIndex": 0,
      "explanation": {"es": "...", "en": "..."}
    }
  ]
}
Reglas:
- Genera exactamente ${questionCount} preguntas.
- Cada pregunta debe tener 4 opciones.
- No inventes conceptos fuera del contexto enviado.
- Evita preguntas triviales de memorizacion si puedes preguntar aplicacion o diagnostico.
- La explicacion debe justificar por que la respuesta correcta es correcta.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          idiomaPreferido: locale === "en" ? "ingles" : "espanol",
          modulo: {
            id: module.id,
            title: module.title,
            description: module.description,
          },
          baseConocimiento: context,
        }),
      },
    ], { temperature: 0.35 });

    let parsed;
    try {
      parsed = JSON.parse(contentText);
    } catch {
      const first = contentText.indexOf("{");
      const last = contentText.lastIndexOf("}");
      if (first === -1 || last === -1) throw new Error("Ollama no devolvio JSON valido.");
      parsed = JSON.parse(contentText.slice(first, last + 1));
    }

    const questions = (Array.isArray(parsed.questions) ? parsed.questions : [])
      .map((question, index) => normalizeGeneratedQuestion(question, index, locale))
      .filter(Boolean)
      .slice(0, questionCount);

    if (questions.length === 0) throw new Error("No se generaron preguntas validas.");

    res.json({
      questions,
      source: "ai",
      model: ollamaModel,
      knowledgeEntryIds: entries.map((entry) => entry.id),
    });
  } catch (error) {
    res.json({
      questions: fallbackQuestions,
      source: "local",
      model: "validated-local-generator",
      knowledgeEntryIds: entries.map((entry) => entry.id),
      warning: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`AI quiz/content server running at http://127.0.0.1:${port}`);
  console.log(`Ollama target: ${ollamaHost} (${ollamaModel})`);
});
