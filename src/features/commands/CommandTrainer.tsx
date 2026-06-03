import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, RefreshCcw, TerminalSquare } from "lucide-react";
import { deviceCategories, commandTopics as fullCommandTopics, CommandTopic, DeviceCategory } from "@data/commands";
import { appText } from "@app/i18n";
import { CourseTrack, Locale, ProgressState } from "@shared/types";

type PracticeMode = "recognize" | "write" | "configure" | "diagnose";
type CommandChallenge = CommandTopic["challenge"];
export function CommandTrainer({
  locale,
  selectedTrackId,
  trackLabel,
  progress,
  onBack,
  onAttempt,
}: {
  locale: Locale;
  selectedTrackId: CourseTrack;
  trackLabel: string;
  progress: ProgressState;
  onBack: () => void;
  onAttempt: (challengeId: string, answer: string, isCorrect: boolean) => void;
}) {
  const t = appText[locale];
  const [activeDevice, setActiveDevice] = useState<DeviceCategory>("general");
  const visibleTopics = fullCommandTopics.filter((topic) => topic.device === activeDevice);
  const [activeTopicId, setActiveTopicId] = useState(visibleTopics[0].id);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("write");
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState("");
  const [currentChallenge, setCurrentChallenge] = useState<CommandChallenge>(visibleTopics[0].challenge);
  const activeTopic = visibleTopics.find((topic) => topic.id === activeTopicId) ?? visibleTopics[0];
  // Helper to parse prompt and command
  const parseStudentInput = (input: string) => {
    const trimmed = input.trim().replace(/\s+/g, " ");
    const match = trimmed.match(/^([a-zA-Z0-9\-_]+(?:\([^)]+\))?[>#])\s+(.+)$/);
    if (match) {
      return {
        prompt: match[1],
        command: match[2].toLowerCase(),
        rawCommand: match[2]
      };
    }
    return {
      prompt: "",
      command: trimmed.toLowerCase(),
      rawCommand: trimmed
    };
  };

  const getModeSuffix = (prompt: string) => {
    return prompt.replace(/^[a-zA-Z0-9\-_]+/, "").toLowerCase();
  };

  const parsedInput = parseStudentInput(answer);
  const normalizedAnswer = parsedInput.command;
  const expectedAnswer = currentChallenge.answer.trim().replace(/\s+/g, " ").toLowerCase();

  const expectedCommandItem = activeTopic.commands.find(
    (item) => item.command.trim().toLowerCase() === expectedAnswer
  );
  const example = expectedCommandItem?.example ?? "";
  const exampleMatch = example.trim().replace(/\s+/g, " ").match(/^([a-zA-Z0-9\-_]+(?:\([^)]+\))?[>#])\s+(.+)$/);
  const expectedPrompt = exampleMatch ? exampleMatch[1] : "";
  const expectedSuffix = expectedPrompt ? getModeSuffix(expectedPrompt) : "";
  const studentSuffix = getModeSuffix(parsedInput.prompt);

  const isCommandCorrect = normalizedAnswer === expectedAnswer;
  const isPromptCorrect = parsedInput.prompt !== "" && (expectedSuffix === "" || studentSuffix === expectedSuffix);
  const isCorrect = isCommandCorrect && isPromptCorrect;
  const challengeId = `${activeTopic.id}:${practiceMode}`;
  const attemptStats = progress.commandAttempts[challengeId];
  const practiceModes: Array<{ id: PracticeMode; label: string }> = [
    { id: "recognize", label: t.recognizeMode },
    { id: "write", label: t.writeMode },
    { id: "configure", label: t.configureMode },
    { id: "diagnose", label: t.diagnoseMode },
  ];

  useEffect(() => {
    setCurrentChallenge(activeTopic.challenge);
    setAnswer("");
    setSubmitted(false);
    setCommandFeedback("");
  }, [activeTopic.id, practiceMode]);

  const chooseDevice = (device: DeviceCategory) => {
    const firstTopic = fullCommandTopics.find((topic) => topic.device === device);
    if (!firstTopic) return;
    setActiveDevice(device);
    setActiveTopicId(firstTopic.id);
    setAnswer("");
    setSubmitted(false);
    setCommandFeedback("");
    setCurrentChallenge(firstTopic.challenge);
  };

  const chooseTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setAnswer("");
    setSubmitted(false);
    setCommandFeedback("");
    const nextTopic = fullCommandTopics.find((topic) => topic.id === topicId);
    if (nextTopic) setCurrentChallenge(nextTopic.challenge);
  };

  const deterministicFeedback = (correct: boolean) => {
    const expectedCommand = activeTopic.commands.find(
      (item) => item.command.trim().toLowerCase() === expectedAnswer,
    );
    const expectedPurpose = expectedCommand?.purpose[locale] ?? currentChallenge.prompt[locale];

    const parsedInput = parseStudentInput(answer);
    const isCommandCorrect = parsedInput.command === expectedAnswer;
    const studentSuffix = getModeSuffix(parsedInput.prompt);
    const expectedSuffix = expectedPrompt ? getModeSuffix(expectedPrompt) : "";
    const isPromptCorrect = parsedInput.prompt !== "" && (expectedSuffix === "" || studentSuffix === expectedSuffix);

    if (isCommandCorrect && isPromptCorrect) {
      return locale === "es"
        ? `Diagnóstico: ¡Excelente! Comando y modo correctos. Explicación corta: ejecutaste "${parsedInput.rawCommand}" en el modo adecuado (${parsedInput.prompt}) para: ${expectedPurpose}.`
        : `Diagnosis: Excellent! Correct command and mode. Short explanation: you executed "${parsedInput.rawCommand}" in the proper mode (${parsedInput.prompt}) for: ${expectedPurpose}.`;
    }

    if (isCommandCorrect && parsedInput.prompt === "") {
      const promptExample = expectedPrompt || "Router#";
      return locale === "es"
        ? `Diagnóstico: comando correcto, pero falta el prompt. Explicación corta: debes indicar el modo CLI escribiendo el prompt al inicio (por ejemplo: "${promptExample} ${currentChallenge.answer}"). Pista: ${currentChallenge.hint.es}`
        : `Diagnosis: correct command, but prompt is missing. Short explanation: you must indicate the CLI mode by writing the prompt at the start (for example: "${promptExample} ${currentChallenge.answer}"). Hint: ${currentChallenge.hint.en}`;
    }

    if (isCommandCorrect && !isPromptCorrect) {
      const promptExample = expectedPrompt || "Router#";
      return locale === "es"
        ? `Diagnóstico: modo de ejecución incorrecto. Explicación corta: ingresaste el comando en el modo "${parsedInput.prompt}" (${studentSuffix}), pero este comando debe ejecutarse en el modo con el prompt "${promptExample}" (${expectedSuffix}). Pista: ${currentChallenge.hint.es}`
        : `Diagnosis: incorrect execution mode. Short explanation: you entered the command in mode "${parsedInput.prompt}" (${studentSuffix}), but this command must be run in the mode with the prompt "${promptExample}" (${expectedSuffix}). Hint: ${currentChallenge.hint.en}`;
    }

    const studentCommand = activeTopic.commands.find(
      (item) => item.command.trim().toLowerCase() === parsedInput.command,
    );

    if (studentCommand) {
      return locale === "es"
        ? `Diagnóstico: comando válido, pero no para este reto. Explicación corta: "${studentCommand.command}" sirve para ${studentCommand.purpose.es.toLowerCase()} Aquí se pedía: ${expectedPurpose} Pista: ${currentChallenge.hint.es}`
        : `Diagnosis: valid command, but not for this challenge. Short explanation: "${studentCommand.command}" is used to ${studentCommand.purpose.en.toLowerCase()} Here the objective is: ${expectedPurpose} Hint: ${currentChallenge.hint.en}`;
    }

    if (parsedInput.command.startsWith("interface ") && expectedAnswer === "no shutdown") {
      return locale === "es"
        ? `Diagnóstico: cambiaste de contexto, pero no activaste la interfaz. Explicación corta: "interface ..." entra al modo de interfaz; para levantarla se usa el comando esperado dentro de ese modo. Pista: ${currentChallenge.hint.es}`
        : `Diagnosis: you changed context, but did not enable the interface. Short explanation: "interface configuration" enters interface configuration; the expected command enables it from that mode. Hint: ${currentChallenge.hint.en}`;
    }

    return locale === "es"
      ? `Diagnóstico: revisa sintaxis y contexto. Explicación corta: la respuesta no coincide con la tarea actual. Pista: ${currentChallenge.hint.es}`
      : `Diagnosis: review syntax and context. Short explanation: the answer does not match the current task. Hint: ${currentChallenge.hint.en}`;
  };

  const verifyAnswer = () => {
    const correct = normalizedAnswer === expectedAnswer;
    setSubmitted(true);
    setCommandFeedback(deterministicFeedback(correct));
    onAttempt(challengeId, answer, correct);
  };

  return (
    <article className="content-surface">
      <button className="back-button" onClick={onBack}>
        {t.back}
      </button>
      <span className="eyebrow">{t.commands}</span>
      <h2>{t.commandsTitle}</h2>
      <p className="lead">
        {locale === "es"
          ? "Practica comandos y configuraciones esenciales de Packet Tracer por dispositivo, modo, propósito, ejemplo y reto."
          : "Practice essential Packet Tracer commands and configurations by device, mode, purpose, example, and challenge."}
      </p>

      <section className="command-control-bar" aria-label={locale === "es" ? "Controles de práctica" : "Practice controls"}>
        <div className="control-block">
          <span>{t.deviceReview}</span>
          <div className="device-tabs" aria-label={t.deviceReview}>
            {deviceCategories.map((device) => (
              <button
                key={device.id}
                className={device.id === activeDevice ? "device-tab active" : "device-tab"}
                onClick={() => chooseDevice(device.id)}
              >
                {device.title[locale]}
              </button>
            ))}
          </div>
        </div>

        <div className="control-block">
          <span>{t.practiceMode}</span>
          <div className="practice-mode-tabs" aria-label={t.practiceMode}>
            {practiceModes.map((mode) => (
              <button
                key={mode.id}
                className={mode.id === practiceMode ? "practice-mode active" : "practice-mode"}
                onClick={() => {
                  setPracticeMode(mode.id);
                  setAnswer("");
                  setSubmitted(false);
                  setCommandFeedback("");
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="command-layout">
        <nav className="command-topic-list" aria-label={t.commands}>
          {visibleTopics.map((topic) => (
            <button
              key={topic.id}
              className={topic.id === activeTopic.id ? "command-topic active" : "command-topic"}
              onClick={() => chooseTopic(topic.id)}
            >
              <TerminalSquare size={17} />
              <span>{topic.title[locale]}</span>
            </button>
          ))}
        </nav>

        <section className="command-panel">
          <div className="command-heading">
            <div>
              <h3>{activeTopic.title[locale]}</h3>
              <p>{activeTopic.description[locale]}</p>
            </div>
            <div className="command-heading-meta">
              <span>{activeTopic.mode}</span>
              <span>
                {activeTopic.commands.length} {t.allCommands}
              </span>
            </div>
          </div>

          <section className="command-reference-card">
            <div className="section-heading-row">
              <h3>{locale === "es" ? "Referencia rápida" : "Quick reference"}</h3>
              <span>{activeTopic.commands.length}</span>
            </div>

            <div className="command-table">
              {activeTopic.commands.map((item) => (
                <div className="command-row" key={item.command}>
                  <code>{item.command}</code>
                  <p>{item.purpose[locale]}</p>
                  <small>{item.example}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="cli-challenge">
            <div className="section-heading-row">
              <h3>{t.commandChallenge}</h3>
              {attemptStats && (
                <span>
                  {attemptStats.correct}/{attemptStats.attempts}
                </span>
              )}
            </div>
            <p>
              {currentChallenge.prompt[locale]}{" "}
              {practiceMode === "configure" &&
                (locale === "es"
                  ? "Escribe el comando como si estuvieras completando una configuración por pasos."
                  : "Write the command as if you were completing a step-by-step configuration.")}
              {practiceMode === "diagnose" &&
                (locale === "es"
                  ? " Piensa qué síntoma corregiría este comando antes de responder."
                  : " Think what symptom this command would fix before answering.")}
            </p>
            <label className="input-row">
              <span>{t.yourCommand}</span>
              <input
                value={answer}
                placeholder={locale === "es" ? "Escribe el prompt y comando (ej: Router# show ...)" : "Type prompt and command (e.g. Router# show ...)"}
                onChange={(event) => {
                  setAnswer(event.target.value);
                  setSubmitted(false);
                  setCommandFeedback("");
                }}
              />
            </label>
            <p className="hint-line">
              {t.hint}: {currentChallenge.hint[locale]}
            </p>
            {submitted && (
              <p className={isCorrect ? "answer-ok" : "answer-bad"}>
                {isCorrect ? t.correct : `${t.review}: ${currentChallenge.answer}`}
              </p>
            )}
            <div className="lesson-actions">
              <button className="primary-button" onClick={verifyAnswer} disabled={!answer.trim()}>
                <ClipboardCheck size={18} />
                {t.verify}
              </button>
            </div>
          </section>

          {commandFeedback && (
            <section className="feedback-panel">
              <h3>{locale === "es" ? "Retroalimentación" : "Feedback"}</h3>
              {commandFeedback && <p>{commandFeedback}</p>}
            </section>
          )}
        </section>
      </div>
    </article>
  );
}

