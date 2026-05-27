import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT ?? 5174);
const ollamaHost = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
const ollamaModel = process.env.OLLAMA_MODEL ?? "llama3.2:3b";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const knowledgeBasePath = path.resolve(__dirname, "../src/data/knowledgeBase.json");
const knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, "utf8"));

app.use(cors({ origin: ["http://127.0.0.1:5173", "http://localhost:5173"] }));
app.use(express.json({ limit: "1mb" }));

const systemPrompt = `Eres un tutor local de redes para rutas CCNA y CCNP Enterprise en Cisco IOS/IOS XE.
Responde en espanol claro, breve y didactico.
Usa terminologia Cisco correcta:
- "modo usuario EXEC" para Router>
- "modo privilegiado EXEC" para Router#
- "modo de configuracion global" para Router(config)#
- "modo de configuracion de interfaz" para Router(config-if)#
Nunca digas "modo privado"; ese termino es incorrecto.
No seas un chat generico: corrige razonamiento, pide justificar, da pistas graduadas y conecta el comando con el dispositivo y modo.
No inventes comandos fuera del contexto enviado. No agregues historias largas ni supuestos no dados.
Si el comando del estudiante esta mal, explica el error y luego da una pista antes de mostrar la respuesta.
Si el estudiante responde "interface ..." cuando la respuesta esperada es "no shutdown", explica que "interface ..." entra al modo de configuracion de esa interfaz, pero no la activa.
Nunca digas que "interface ..." muestra la interfaz; para mostrar/verificar se usan comandos show.
Formato para feedback: Diagnostico, Explicacion corta, Siguiente pregunta.
Formato para retos: Reto, Pista. No muestres la respuesta esperada si el backend ya la envia separada.`;

const sanitizeCiscoTerminology = (content) =>
  content
    .replace(/modo privado/gi, "modo privilegiado EXEC")
    .replace(/modo private/gi, "modo privilegiado EXEC")
    .replace(/modo privilegiado privado/gi, "modo privilegiado EXEC")
    .replace(/contraseña del modo privado/gi, "contraseña del modo privilegiado EXEC");

const sanitizeTutorFeedback = (content, { studentAnswer, expectedAnswer }) => {
  let sanitized = sanitizeCiscoTerminology(content);
  const student = normalizeText(studentAnswer);
  const expected = normalizeText(expectedAnswer);

  if (student.startsWith("interface ") && expected === "no shutdown") {
    sanitized = sanitized.replace(
      /El estudiante ha ingresado al modo de configuracion global del router\.?/i,
      'El estudiante entro al modo de configuracion de interfaz, pero aun no activo la interfaz.',
    );
    sanitized = sanitized.replace(
      /The student has entered global configuration mode\.?/i,
      "The student entered interface configuration mode, but has not enabled the interface yet.",
    );
    sanitized = sanitized.replace(/interfaz\. y ha escrito/i, 'interfaz. Escribio');
  }

  return sanitized;
};

const inferCommandMode = (item, fallbackMode = "Contexto no especificado") => {
  const example = item?.example ?? "";
  if (example.includes("(config-if)#") || example.includes("(config-subif)#")) return "modo de configuracion de interfaz";
  if (example.includes("(config-router)#") || example.includes("(config-rtr)#")) return "modo de configuracion de router";
  if (example.includes("(dhcp-config)#")) return "modo de configuracion DHCP";
  if (example.includes("(config-dhcpv6)#")) return "modo de configuracion DHCPv6";
  if (example.includes("(config-telephony)#")) return "modo de configuracion de telefonia";
  if (example.includes("(config-ephone-dn)#")) return "modo de configuracion de extension telefonica";
  if (example.includes("(config-ephone)#")) return "modo de configuracion de telefono IP";
  if (example.includes("(config-line)#")) return "modo de configuracion de linea";
  if (example.includes("(config-vlan)#")) return "modo de configuracion de VLAN";
  if (example.includes("(config)#")) return "modo de configuracion global";
  if (example.includes("#")) return "modo privilegiado EXEC";
  if (example.includes(">")) return "modo usuario EXEC";
  return fallbackMode;
};

const findCommand = (topic, command) => {
  const expected = String(command ?? "").trim().toLowerCase();
  const commands = Array.isArray(topic?.commands) ? topic.commands : [];
  return commands.find((item) => String(item.command).trim().toLowerCase() === expected);
};

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getRelevantKnowledge = (topic, extraTerms = []) => {
  const searchable = normalizeText(
    [
      topic?.id,
      topic?.device,
      topic?.mode,
      topic?.title?.es,
      topic?.title?.en,
      topic?.description?.es,
      topic?.description?.en,
      ...(Array.isArray(topic?.commands) ? topic.commands.flatMap((item) => [item.command, item.purpose?.es, item.purpose?.en]) : []),
      ...extraTerms,
    ].join(" ")
  );

  return [...knowledgeBase.entries]
    .map((entry) => {
      const tagScore = entry.tags.reduce((score, tag) => (searchable.includes(normalizeText(tag)) ? score + 3 : score), 0);
      const commandScore = entry.commands.reduce((score, command) => (searchable.includes(normalizeText(command)) ? score + 2 : score), 0);
      const titleScore = searchable.includes(normalizeText(entry.title)) ? 4 : 0;
      return { entry, score: tagScore + commandScore + titleScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ entry }) => ({
      titulo: entry.title,
      resumen: entry.summary,
      hechos: entry.facts,
      comandos: entry.commands,
      fuentes: entry.sourceRefs.map((ref) => {
        const source = knowledgeBase.sources.find((item) => item.id === ref.sourceId);
        return { archivo: source?.file ?? ref.sourceId, paginas: ref.pages };
      }),
    }));
};

const buildLocalChallenge = ({ locale, topic, recentAttempts, mode = "write" }) => {
  const commands = Array.isArray(topic.commands) ? topic.commands : [];
  if (commands.length === 0) {
    const challenge = {
      prompt: {
        es: "No hay comandos disponibles para este tema.",
        en: "No commands are available for this topic.",
      },
      answer: "N/A",
      hint: { es: "Elige otro tema.", en: "Choose another topic." },
    };
    return {
      challenge,
      content: locale === "en" ? `Challenge:\n${challenge.prompt.en}\n\nHint:\n${challenge.hint.en}` : `Reto:\n${challenge.prompt.es}\n\nPista:\n${challenge.hint.es}`,
      source: "local",
      selectedCommand: null,
    };
  }

  const weakAttempt = Array.isArray(recentAttempts)
    ? recentAttempts
        .map((entry) => (Array.isArray(entry) ? entry : [undefined, undefined]))
        .map(([id, stats]) => ({ id: String(id ?? ""), stats }))
        .filter(({ id, stats }) => id.startsWith(`${topic.id}:`) && stats?.attempts > 0 && stats.correct < stats.attempts)
        .at(-1)
    : null;
  const modeOffset = ["recognize", "write", "configure", "diagnose"].indexOf(mode);
  const index = weakAttempt ? (weakAttempt.stats.attempts + Math.max(0, modeOffset)) % commands.length : Array.isArray(recentAttempts) ? (recentAttempts.length + Math.max(0, modeOffset)) % commands.length : 0;
  const item = commands[index];
  const command = item.command;
  const purpose = item.purpose?.[locale] ?? item.purpose?.es ?? "";
  const commandMode = inferCommandMode(item, topic.mode);
  const isEnable = command.toLowerCase() === "enable";
  const isShow = command.toLowerCase().startsWith("show ");
  const isInterfaceSelection = command.toLowerCase().startsWith("interface ");

  const promptEn = isEnable
      ? "You are at Router> and need to enter privileged EXEC mode. Write the exact command."
      : isInterfaceSelection
        ? `You are in global configuration mode and need to enter ${command.split(" ")[1]} interface configuration. Write the exact command.`
        : mode === "diagnose"
          ? `A Packet Tracer lab has this symptom: the objective "${purpose}" has not been verified yet. Which exact command would you use to diagnose it?`
      : isShow
        ? `You need to verify this objective: ${purpose} Write the exact Cisco IOS command.`
        : `You need to complete this Packet Tracer task: ${purpose} Write the exact command or configuration value.`;

  const promptEs = isEnable
    ? "Estás en Router> y necesitas entrar al modo privilegiado EXEC. Escribe el comando exacto."
    : isInterfaceSelection
      ? `Estás en modo de configuración global y necesitas entrar a la configuración de la interfaz ${command.split(" ")[1]}. Escribe el comando exacto.`
      : mode === "diagnose"
        ? `Un laboratorio de Packet Tracer tiene este síntoma: todavía no se ha verificado el objetivo "${purpose}". ¿Qué comando exacto usarías para diagnosticarlo?`
    : isShow
      ? `Necesitas verificar este objetivo: ${purpose} Escribe el comando Cisco IOS exacto.`
      : `Necesitas completar esta tarea en Packet Tracer: ${purpose} Escribe el comando o valor de configuración exacto.`;

  const hintEs = `Modo/contexto: ${commandMode}. Usa sintaxis Cisco IOS exacta; revisa mayusculas solo cuando sean parte de nombres configurados.`;
  const hintEn = `Mode/context: ${commandMode}. Use exact Cisco IOS syntax; check capitalization only when it is part of configured names.`;
  const challenge = {
    prompt: { es: promptEs, en: promptEn },
    answer: command,
    hint: { es: hintEs, en: hintEn },
  };

  return {
    challenge,
    content: locale === "en" ? `Challenge:\n${promptEn}\n\nHint:\n${hintEn}` : `Reto:\n${promptEs}\n\nPista:\n${hintEs}`,
    source: "local",
    selectedCommand: item,
  };
};

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

const isSafeAiChallenge = (content, expectedAnswer) => {
  if (!content) return false;
  const normalizedContent = normalizeText(content);
  const normalizedAnswer = normalizeText(expectedAnswer);

  if (normalizedContent.includes("modo usuario exec para configurar")) return false;
  if (normalizedContent.includes("ip static")) return false;
  
  // Reject only if the prompt leaks the exact, full Cisco command
  if (normalizedContent.includes(normalizedAnswer)) return false;
  return true;
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

app.post("/api/ai/tutor", async (req, res) => {
  const { locale, courseTrack, trackLabel, topic, challenge, studentAnswer, isCorrect, mode } = req.body ?? {};

  if (!topic || !challenge || typeof studentAnswer !== "string") {
    return res.status(400).json({ error: "Faltan datos del reto o respuesta del estudiante." });
  }

  try {
    const expectedCommand = findCommand(topic, challenge.answer);
    const expectedMode = inferCommandMode(expectedCommand, topic.mode);
    const studentCommand = findCommand(topic, studentAnswer);
    const studentMode = studentCommand ? inferCommandMode(studentCommand, topic.mode) : "desconocido o fuera del listado validado";
    const relevantKnowledge = getRelevantKnowledge(topic, [challenge.answer, studentAnswer]);

    const content = await callOllama([
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: JSON.stringify({
          idioma: locale === "en" ? "ingles" : "espanol",
          rutaCurso: courseTrack,
          etiquetaRuta: trackLabel,
          modoPractica: mode,
          dispositivo: topic.device,
          tema: topic.title,
          modoCLI: topic.mode,
          descripcion: topic.description,
          comandosPermitidos: topic.commands,
          reto: challenge.prompt,
          respuestaEsperada: challenge.answer,
          modoRespuestaEsperada: expectedMode,
          pistaBase: challenge.hint,
          respuestaEstudiante: studentAnswer,
          modoRespuestaEstudiante: studentMode,
          resultadoDeterminista: isCorrect ? "correcto" : "incorrecto",
          contextoBaseConocimiento: relevantKnowledge,
          reglaCorreccion:
            "Usa contextoBaseConocimiento como material de la materia cuando sea relevante. No cites paginas si no aportan a la respuesta. No asumas que la respuesta del estudiante fue ejecutada en el modo esperado. Si el estudiante escribe un comando que solo entra a un modo, explica que ese comando cambia de contexto pero no completa la tarea.",
        }),
      },
    ]);
    res.json({
      content: sanitizeTutorFeedback(content, {
        studentAnswer,
        expectedAnswer: challenge.answer,
      }),
      model: ollamaModel,
    });
  } catch (error) {
    res.status(503).json({
      error: "No se pudo obtener feedback de Ollama.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post("/api/ai/next-challenge", async (req, res) => {
  const { locale, topic, recentAttempts, mode } = req.body ?? {};

  if (!topic) {
    return res.status(400).json({ error: "Falta el contexto del tema." });
  }

  const fallback = buildLocalChallenge({ locale, topic, recentAttempts, mode });

  try {
    // Check if Ollama is active
    const statusResponse = await fetch(`${ollamaHost}/api/tags`).catch(() => null);
    if (!statusResponse || !statusResponse.ok) {
      throw new Error("Ollama is offline");
    }

    const item = fallback.selectedCommand;
    if (!item) {
      throw new Error("No command available to generate AI scenario");
    }

    const purpose = item.purpose?.[locale] ?? item.purpose?.es ?? "";
    const commandMode = inferCommandMode(item, topic.mode);

    const challengePrompt = [
      {
        role: "system",
        content: `Eres un generador de retos de redes para Cisco CCNA/CCNP Enterprise en Cisco IOS.
Debes reescribir un reto de comando técnico en un escenario práctico, realista y didáctico para Packet Tracer.
Responde ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
{
  "prompt": {
    "es": "Descripción creativa del reto en español...",
    "en": "Creative description of the challenge in English..."
  },
  "hint": {
    "es": "Pista útil en español...",
    "en": "Helpful hint in English..."
  }
}
Instrucciones:
1. La respuesta correcta esperada es EXACTAMENTE: "${fallback.challenge.answer}".
2. NUNCA menciones la respuesta ("${fallback.challenge.answer}") ni partes de ella en el "prompt" ni en el "hint".
3. Describe un escenario real, un problema de redes, o una tarea de Packet Tracer que requiera ejecutar este comando.
4. Responde únicamente con el bloque JSON válido, sin explicaciones ni markdown adicional.`
      },
      {
        role: "user",
        content: `Genera el reto para el tema "${topic.title.es}" (${topic.title.en}).
El comando a practicar tiene el propósito de: "${purpose}".
Debe ejecutarse en el modo: "${commandMode}".`
      }
    ];

    const contentText = await callOllama(challengePrompt, { temperature: 0.5 });
    
    // Parse the JSON robustly
    let parsedChallenge;
    try {
      parsedChallenge = JSON.parse(contentText);
    } catch {
      const match = contentText.match(/```json\s*([\s\S]*?)\s*```/) || contentText.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        parsedChallenge = JSON.parse(match[1].trim());
      } else {
        const first = contentText.indexOf("{");
        const last = contentText.lastIndexOf("}");
        if (first !== -1 && last !== -1) {
          parsedChallenge = JSON.parse(contentText.slice(first, last + 1));
        } else {
          throw new Error("No JSON structure found in Ollama response");
        }
      }
    }

    // Validate the generated prompt
    const promptText = parsedChallenge.prompt?.[locale] ?? parsedChallenge.prompt?.es ?? "";
    if (isSafeAiChallenge(promptText, fallback.challenge.answer)) {
      const challenge = {
        prompt: {
          es: parsedChallenge.prompt?.es ?? fallback.challenge.prompt.es,
          en: parsedChallenge.prompt?.en ?? fallback.challenge.prompt.en,
        },
        answer: fallback.challenge.answer,
        hint: {
          es: parsedChallenge.hint?.es ?? fallback.challenge.hint.es,
          en: parsedChallenge.hint?.en ?? fallback.challenge.hint.en,
        },
      };

      return res.json({
        challenge,
        content: locale === "en" ? `Challenge:\n${challenge.prompt.en}\n\nHint:\n${challenge.hint.en}` : `Reto:\n${challenge.prompt.es}\n\nPista:\n${challenge.hint.es}`,
        model: ollamaModel,
        source: "ai",
      });
    }
  } catch (error) {
    console.warn("AI Challenge generation failed, falling back to local:", error.message);
  }

  // Graceful fallback to deterministic local generator
  return res.json({
    challenge: fallback.challenge,
    content: fallback.content,
    model: "validated-local-generator",
    source: "local",
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`AI tutor server running at http://127.0.0.1:${port}`);
  console.log(`Ollama target: ${ollamaHost} (${ollamaModel})`);
});
