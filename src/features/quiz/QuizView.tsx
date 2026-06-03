import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, ClipboardCheck, RefreshCcw } from "lucide-react";
import { appText } from "@app/i18n";
import { CourseModule, Locale, QuizQuestion } from "@shared/types";
export function QuizView({
  locale,
  module,
  previousScore,
  onBack,
  onFinish,
}: {
  locale: Locale;
  module: CourseModule;
  previousScore: number;
  onBack: () => void;
  onFinish: (score: number) => void;
}) {
  const t = appText[locale];
  type QuizMode = "exam" | "practice";
  type QuestionLimit = 25 | 50 | "all";

  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<QuizMode>("exam");
  const [questionLimit, setQuestionLimit] = useState<QuestionLimit>(50);
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [attemptQuestions, setAttemptQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const questions = attemptQuestions.length > 0 ? attemptQuestions : module.quiz.slice(0, 50);
  const activeQuestion = questions[activeQuestionIndex] ?? questions[0];
  const correctAnswers = questions.filter((question) => answers[question.id] === question.correctIndex).length;
  const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
  const answeredCount = Object.keys(answers).length;
  const pendingCount = Math.max(0, questions.length - answeredCount);
  const canFinish = mode === "exam" ? answeredCount === questions.length : answeredCount > 0;
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${remainder.toString().padStart(2, "0")}`;
  };
  const hashSeed = (value: string) =>
    Array.from(value).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
  const seededShuffle = <T,>(items: T[], seed: string) => {
    const shuffled = [...items];
    let state = hashSeed(seed) || 1;
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      state = (state * 1664525 + 1013904223) >>> 0;
      const swapIndex = state % (index + 1);
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  };
  const shuffleQuestionOptions = (question: QuizQuestion, seed: string): QuizQuestion => {
    const indexedOptions = question.options.map((option, index) => ({ option, originalIndex: index }));
    const shuffledOptions = seededShuffle(indexedOptions, seed);
    return {
      ...question,
      options: shuffledOptions.map((item) => item.option),
      correctIndex: shuffledOptions.findIndex((item) => item.originalIndex === question.correctIndex),
    };
  };
  const selectedQuestionCount = () => {
    if (questionLimit === "all") return module.quiz.length;
    return Math.min(questionLimit, module.quiz.length);
  };

  useEffect(() => {
    setStarted(false);
    setAttemptQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setActiveQuestionIndex(0);
    setTimeLeft(50 * secondsPerQuestion);
  }, [module.id, module.quiz.length]);

  const submit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    onFinish(score);
  }, [onFinish, score, submitted]);

  useEffect(() => {
    if (!started || mode !== "exam" || submitted) return;
    if (timeLeft <= 0) {
      submit();
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [mode, started, submitted, submit, timeLeft]);

  const startAttempt = () => {
    const seed = `${module.id}-${Date.now()}`;
    const pickedQuestions = (shuffleQuestions ? seededShuffle(module.quiz, `${seed}-questions`) : [...module.quiz]).slice(
      0,
      selectedQuestionCount(),
    );
    const preparedQuestions = shuffleOptions
      ? pickedQuestions.map((question, index) => shuffleQuestionOptions(question, `${seed}-options-${index}`))
      : pickedQuestions;

    setAttemptQuestions(preparedQuestions);
    setAnswers({});
    setSubmitted(false);
    setActiveQuestionIndex(0);
    setTimeLeft(preparedQuestions.length * secondsPerQuestion);
    setStarted(true);
  };

  const chooseAnswer = (question: QuizQuestion, optionIndex: number) => {
    if (submitted) return;
    setAnswers((current) => ({ ...current, [question.id]: optionIndex }));
  };

  const activeSelected = activeQuestion ? answers[activeQuestion.id] : undefined;
  const activeAnswered = typeof activeSelected === "number";
  const showActiveFeedback = submitted || (mode === "practice" && activeAnswered);

  return (
    <article className="content-surface quiz-surface">
      <button className="back-button" onClick={onBack}>
        {t.back}
      </button>
      <span className="eyebrow">{module.title[locale]}</span>
      <h2>{t.quiz}</h2>
      {!started ? (
        <section className="simulator-setup">
          <div>
            <h3>{t.simulatorSettings}</h3>
            <p className="lead">
              {locale === "es"
                ? `${module.quiz.length} preguntas disponibles en este módulo.`
                : `${module.quiz.length} questions available in this module.`}
            </p>
          </div>

          <section className="simulator-control-group" aria-label={t.practiceMode}>
            <span>{t.practiceMode}</span>
            <div className="segmented-control">
              <button className={mode === "exam" ? "active" : ""} onClick={() => setMode("exam")}>
                {t.examMode}
              </button>
              <button className={mode === "practice" ? "active" : ""} onClick={() => setMode("practice")}>
                {t.guidedPractice}
              </button>
            </div>
          </section>

          <section className="simulator-control-grid">
            <label className="input-row">
              <span>{t.questionCount}</span>
              <select
                value={questionLimit}
                onChange={(event) => setQuestionLimit(event.target.value === "all" ? "all" : (Number(event.target.value) as 25 | 50))}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value="all">{t.allQuestions}</option>
              </select>
            </label>
            <label className="input-row">
              <span>{t.secondsPerQuestion}</span>
              <input
                min={15}
                max={180}
                type="number"
                value={secondsPerQuestion}
                onChange={(event) => setSecondsPerQuestion(Math.max(15, Math.min(180, Number(event.target.value) || 60)))}
              />
            </label>
          </section>

          <section className="simulator-toggle-list">
            <label>
              <input type="checkbox" checked={shuffleQuestions} onChange={(event) => setShuffleQuestions(event.target.checked)} />
              <span>{t.shuffleQuestions}</span>
            </label>
            <label>
              <input type="checkbox" checked={shuffleOptions} onChange={(event) => setShuffleOptions(event.target.checked)} />
              <span>{t.shuffleOptions}</span>
            </label>
          </section>

          <button className="primary-button" onClick={startAttempt}>
            <ClipboardCheck size={18} />
            {t.startAttempt}
          </button>
        </section>
      ) : (
        <>
          <p className="lead">
            {t.bestScore}: {previousScore}% · {t.score}: {submitted ? `${score}%` : "--"} · {answeredCount}/{questions.length}{" "}
            {t.answered} · {pendingCount} {t.pending}
          </p>

          <section className={timeLeft <= 300 && mode === "exam" && !submitted ? "quiz-timer warning" : "quiz-timer"}>
            <strong>{mode === "exam" ? t.timeRemaining : t.guidedPractice}</strong>
            <span>{mode === "exam" ? formatTime(timeLeft) : t.noTimeLimit}</span>
            <small>
              {mode === "exam"
                ? locale === "es"
                  ? `${secondsPerQuestion} segundos por pregunta`
                  : `${secondsPerQuestion} seconds per question`
                : locale === "es"
                  ? "Feedback inmediato al responder"
                  : "Immediate feedback after answering"}
            </small>
          </section>

          <div className="simulator-layout">
            <aside className="question-map" aria-label={locale === "es" ? "Mapa de preguntas" : "Question map"}>
              {questions.map((question, index) => {
                const selected = answers[question.id];
                const isAnswered = typeof selected === "number";
                const isCorrect = isAnswered && selected === question.correctIndex;
                const resultClass = submitted ? (isCorrect ? "correct" : isAnswered ? "wrong" : "pending") : isAnswered ? "answered" : "";
                return (
                  <button
                    key={question.id}
                    className={`question-map-item ${index === activeQuestionIndex ? "active" : ""} ${resultClass}`}
                    onClick={() => setActiveQuestionIndex(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </aside>

            {activeQuestion && (
              <section className="quiz-question single-question" key={activeQuestion.id}>
                <div className="question-heading-row">
                  <h3>
                    {t.question} {activeQuestionIndex + 1}/{questions.length}
                  </h3>
                  {activeAnswered && !submitted && <span className="answered-badge">{t.answered}</span>}
                </div>
                <p>{activeQuestion.prompt[locale]}</p>
                <div className="option-list">
                  {activeQuestion.options.map((option, optionIndex) => {
                    const isSelected = activeSelected === optionIndex;
                    const isCorrect = activeQuestion.correctIndex === optionIndex;
                    const resultClass = showActiveFeedback && isCorrect ? "correct" : showActiveFeedback && isSelected ? "wrong" : "";
                    return (
                      <button
                        key={`${activeQuestion.id}-${optionIndex}`}
                        className={`option-button ${isSelected ? "selected" : ""} ${resultClass}`}
                        disabled={submitted}
                        onClick={() => chooseAnswer(activeQuestion, optionIndex)}
                      >
                        {option[locale]}
                      </button>
                    );
                  })}
                </div>
                {showActiveFeedback && <p className="explanation">{activeQuestion.explanation[locale]}</p>}
              </section>
            )}
          </div>

          <div className="simulator-actions">
            <button
              className="ghost-button"
              onClick={() => setActiveQuestionIndex((current) => Math.max(0, current - 1))}
              disabled={activeQuestionIndex === 0}
            >
              {t.previous}
            </button>
            <button
              className="ghost-button"
              onClick={() => setActiveQuestionIndex((current) => Math.min(questions.length - 1, current + 1))}
              disabled={activeQuestionIndex >= questions.length - 1}
            >
              {t.next}
              <ChevronRight size={16} />
            </button>
            <button className="primary-button" onClick={submit} disabled={submitted || !canFinish}>
              <ClipboardCheck size={18} />
              {mode === "practice" ? t.finishAttempt : t.check}
            </button>
          </div>
        </>
      )}
    </article>
  );
}

