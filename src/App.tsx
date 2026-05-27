import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  Info,
  Languages,
  LayoutDashboard,
  Network,
  RefreshCcw,
  Router,
  TerminalSquare,
  Trophy,
} from "lucide-react";
import { deviceCategories, commandTopics as fullCommandTopics, DeviceCategory } from "./data/commands";
import { courseTracks, trackList } from "./data/tracks";
import knowledgeBase from "./data/knowledgeBase.json";
import { AiStatus, getAiStatus, PracticeMode, requestNextChallenge, requestTutorFeedback, TutorChallenge } from "./lib/aiTutor";
import { isValidIp, getSubnetExercise, normalizeIp, solveSubnet } from "./lib/subnetting";
import { loadProgress, markLessonComplete, recordCommandAttempt, saveProgress, saveQuizScore } from "./lib/progress";
import { CourseModule, CourseTrack, Lesson, Locale, ProgressState, QuizQuestion } from "./types";

type View = "dashboard" | "lesson" | "quiz" | "subnetting" | "knowledge" | "commands" | "about";
type KnowledgeEntry = (typeof knowledgeBase.entries)[number];

const text = {
  es: {
    appTitle: "Redes CCNA",
    subtitle: "Ruta práctica para Redes 1, Redes 2 y fundamentos CCNA.",
    progress: "Progreso",
    completed: "lecciones completadas",
    bestScore: "mejor quiz",
    minutes: "min",
    start: "Estudiar",
    quiz: "Quiz",
    practice: "Subnetting",
    commands: "Comandos Cisco",
    knowledge: "Base de conocimiento",
    knowledgeTitle: "Base de conocimiento de Redes",
    sources: "Fuentes",
    topics: "temas",
    facts: "Puntos clave",
    relatedCommands: "Comandos relacionados",
    sourcePages: "págs.",
    keyTerms: "Conceptos clave",
    objective: "Objetivo",
    example: "Ejemplo",
    practiceSuggestion: "Práctica sugerida",
    completeLesson: "Completar lección",
    back: "Volver",
    question: "Pregunta",
    check: "Calificar",
    timeRemaining: "Tiempo restante",
    answered: "respondidas",
    simulatorSettings: "Configurar simulador",
    examMode: "Examen",
    guidedPractice: "Práctica",
    questionCount: "Cantidad de preguntas",
    secondsPerQuestion: "Segundos por pregunta",
    shuffleQuestions: "Mezclar preguntas",
    shuffleOptions: "Mezclar opciones",
    startAttempt: "Iniciar intento",
    previous: "Anterior",
    finishAttempt: "Finalizar intento",
    pending: "pendientes",
    noTimeLimit: "Sin límite de tiempo",
    allQuestions: "Todas",
    next: "Siguiente",
    score: "Puntaje",
    subnetPrompt: "Calcula la subred solicitada",
    subnetNumber: "Subred objetivo",
    subnetAddress: "Dirección de subred",
    broadcastAddress: "Broadcast",
    firstUsable: "Primer host",
    lastUsable: "Último host",
    usableHosts: "Hosts usables",
    totalSubnets: "Subredes posibles",
    newExercise: "Nuevo ejercicio",
    verify: "Verificar",
    correct: "Correcto",
    review: "Revisar",
    route: "Ruta CCNA",
    practiceTitle: "Laboratorio de subnetting",
    commandsTitle: "Entrenador de comandos Cisco",
    commandChallenge: "Reto de CLI",
    yourCommand: "Tu comando",
    hint: "Pista",
    deviceReview: "Repaso por dispositivo",
    allCommands: "comandos y configuraciones",
    aiTutor: "Tutor IA local",
    aiOnline: "IA disponible",
    aiOffline: "IA no disponible",
    practiceMode: "Modo de práctica",
    recognizeMode: "Reconocer",
    writeMode: "Escribir",
    configureMode: "Configurar",
    diagnoseMode: "Diagnosticar",
    tutorFeedback: "Feedback del tutor",
    nextChallenge: "Generar reto",
    attempts: "intentos",
    selectTrack: "Ruta",
    guidedLab: "Lab guiado",
    topology: "Topología",
    tasks: "Tareas",
    verification: "Verificación",
    commonFailures: "Fallas comunes",
    about: "Acerca de",
  },
  en: {
    appTitle: "CCNA Networks",
    subtitle: "Practical path for Networking 1, Networking 2, and CCNA fundamentals.",
    progress: "Progress",
    completed: "lessons completed",
    bestScore: "best quiz",
    minutes: "min",
    start: "Study",
    quiz: "Quiz",
    practice: "Subnetting",
    commands: "Cisco commands",
    knowledge: "Knowledge base",
    knowledgeTitle: "Networking knowledge base",
    sources: "Sources",
    topics: "topics",
    facts: "Key points",
    relatedCommands: "Related commands",
    sourcePages: "pages",
    keyTerms: "Key terms",
    objective: "Objective",
    example: "Example",
    practiceSuggestion: "Suggested practice",
    completeLesson: "Complete lesson",
    back: "Back",
    question: "Question",
    check: "Grade",
    timeRemaining: "Time remaining",
    answered: "answered",
    simulatorSettings: "Simulator settings",
    examMode: "Exam",
    guidedPractice: "Practice",
    questionCount: "Question count",
    secondsPerQuestion: "Seconds per question",
    shuffleQuestions: "Shuffle questions",
    shuffleOptions: "Shuffle options",
    startAttempt: "Start attempt",
    previous: "Previous",
    finishAttempt: "Finish attempt",
    pending: "pending",
    noTimeLimit: "No time limit",
    allQuestions: "All",
    next: "Next",
    score: "Score",
    subnetPrompt: "Calculate the requested subnet",
    subnetNumber: "Target subnet",
    subnetAddress: "Subnet address",
    broadcastAddress: "Broadcast",
    firstUsable: "First host",
    lastUsable: "Last host",
    usableHosts: "Usable hosts",
    totalSubnets: "Possible subnets",
    newExercise: "New exercise",
    verify: "Verify",
    correct: "Correct",
    review: "Review",
    route: "CCNA path",
    practiceTitle: "Subnetting lab",
    commandsTitle: "Cisco command trainer",
    commandChallenge: "CLI challenge",
    yourCommand: "Your command",
    hint: "Hint",
    deviceReview: "Device review",
    allCommands: "commands and configurations",
    aiTutor: "Local AI tutor",
    aiOnline: "AI available",
    aiOffline: "AI unavailable",
    practiceMode: "Practice mode",
    recognizeMode: "Recognize",
    writeMode: "Write",
    configureMode: "Configure",
    diagnoseMode: "Diagnose",
    tutorFeedback: "Tutor feedback",
    nextChallenge: "Generate challenge",
    attempts: "attempts",
    selectTrack: "Path",
    guidedLab: "Guided lab",
    topology: "Topology",
    tasks: "Tasks",
    verification: "Verification",
    commonFailures: "Common failures",
    about: "About",
  },
};

export function App() {
  const [locale, setLocale] = useState<Locale>("es");
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [view, setView] = useState<View>("dashboard");
  const [activeTrackId, setActiveTrackId] = useState<CourseTrack>("ccna");
  const selectedTrack = courseTracks[activeTrackId];
  const activeModules = selectedTrack.modules;
  const [activeModuleId, setActiveModuleId] = useState(activeModules[0].id);
  const [activeLessonId, setActiveLessonId] = useState(activeModules[0].lessons[0].id);
  const t = text[locale];

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const totalLessons = activeModules.reduce((count, module) => count + module.lessons.length, 0);
  const courseLessonIds = new Set(activeModules.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
  const completedCount = progress.completedLessons.filter((lessonId) => courseLessonIds.has(lessonId)).length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  const activeModule = activeModules.find((module) => module.id === activeModuleId) ?? activeModules[0];
  const activeLesson = activeModule.lessons.find((lesson) => lesson.id === activeLessonId) ?? activeModule.lessons[0];

  const selectTrack = (trackId: CourseTrack) => {
    const nextTrack = courseTracks[trackId];
    const nextModule = nextTrack.modules[0];
    setActiveTrackId(trackId);
    setActiveModuleId(nextModule.id);
    setActiveLessonId(nextModule.lessons[0].id);
    setView("dashboard");
  };

  const openLesson = (module: CourseModule, lesson: Lesson = module.lessons[0]) => {
    setActiveModuleId(module.id);
    setActiveLessonId(lesson.id);
    setView("lesson");
  };

  const openQuiz = (module: CourseModule) => {
    setActiveModuleId(module.id);
    setView("quiz");
  };

  const completeLesson = () => {
    setProgress((current) => markLessonComplete(current, activeLesson.id));
  };

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Resumen del curso">
        <div className="brand">
          <div className="brand-mark">
            <Router size={25} />
          </div>
          <div>
            <h1>{selectedTrack.title[locale]}</h1>
            <p>{selectedTrack.subtitle[locale]}</p>
          </div>
        </div>

        <section className="track-selector" aria-label={t.selectTrack}>
          <span>{t.selectTrack}</span>
          <div>
            {trackList.map((track) => (
              <button
                key={track.id}
                className={track.id === activeTrackId ? "track-option active" : "track-option"}
                onClick={() => selectTrack(track.id)}
              >
                {track.label[locale]}
              </button>
            ))}
          </div>
        </section>

        <div className="progress-panel">
          <div className="progress-heading">
            <span>{t.progress}</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="progress-bar">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <p>
            {completedCount}/{totalLessons} {t.completed}
          </p>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <div className="nav-section">
            <span className="nav-section-title">{locale === "es" ? "Navegación" : "Navigation"}</span>
            <button
              className={view === "dashboard" ? "nav-item active" : "nav-item"}
              onClick={() => setView("dashboard")}
            >
              <span className="nav-state"><LayoutDashboard size={17} /></span>
              <span>{locale === "es" ? "Panel de Control" : "Dashboard"}</span>
            </button>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">{locale === "es" ? "Laboratorios y Práctica" : "Labs & Practice"}</span>
            <button
              className={view === "subnetting" ? "nav-item active" : "nav-item"}
              onClick={() => setView("subnetting")}
            >
              <span className="nav-state"><Network size={17} /></span>
              <span>{t.practice}</span>
            </button>
            <button
              className={view === "commands" ? "nav-item active" : "nav-item"}
              onClick={() => setView("commands")}
            >
              <span className="nav-state"><TerminalSquare size={17} /></span>
              <span>{t.commands}</span>
            </button>
            <button
              className={view === "knowledge" ? "nav-item active" : "nav-item"}
              onClick={() => setView("knowledge")}
            >
              <span className="nav-state"><Database size={17} /></span>
              <span>{t.knowledge}</span>
            </button>
            <button
              className={view === "about" ? "nav-item active" : "nav-item"}
              onClick={() => setView("about")}
            >
              <span className="nav-state"><Info size={17} /></span>
              <span>{t.about}</span>
            </button>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">{selectedTrack.routeLabel[locale]}</span>
            <div className="module-nav-list">
              {activeModules.map((module) => {
                const done = module.lessons.every((lesson) => progress.completedLessons.includes(lesson.id));
                const isActive = (view === "lesson" || view === "quiz") && activeModuleId === module.id;
                return (
                  <button
                    key={module.id}
                    className={isActive ? "nav-item active" : "nav-item"}
                    onClick={() => openLesson(module)}
                  >
                    <span className="nav-state">{done ? <CheckCircle2 size={17} /> : <Network size={17} />}</span>
                    <span>{module.title[locale]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="lang-switcher" onClick={() => setLocale(locale === "es" ? "en" : "es")}>
            <Languages size={16} />
            <span>{locale === "es" ? "English" : "Español"}</span>
          </button>
        </div>
      </aside>

      <section className="workspace">
        {view === "dashboard" && (
          <Dashboard
            locale={locale}
            selectedTrackId={activeTrackId}
            modules={activeModules}
            progress={progress}
            onOpenLesson={openLesson}
            onOpenQuiz={openQuiz}
          />
        )}
        {view === "lesson" && (
          <LessonView
            locale={locale}
            module={activeModule}
            lesson={activeLesson}
            completed={progress.completedLessons.includes(activeLesson.id)}
            onBack={() => setView("dashboard")}
            onComplete={completeLesson}
            onQuiz={() => openQuiz(activeModule)}
          />
        )}
        {view === "quiz" && (
          <QuizView
            locale={locale}
            module={activeModule}
            previousScore={progress.quizScores[activeModule.id] ?? 0}
            onBack={() => setView("dashboard")}
            onFinish={(score) => setProgress((current) => saveQuizScore(current, activeModule.id, score))}
          />
        )}
        {view === "subnetting" && <SubnettingLab locale={locale} onBack={() => setView("dashboard")} />}
        {view === "knowledge" && <KnowledgeBaseView locale={locale} onBack={() => setView("dashboard")} />}
        {view === "commands" && (
          <CommandTrainer
            locale={locale}
            selectedTrackId={activeTrackId}
            trackLabel={selectedTrack.label[locale]}
            progress={progress}
            onBack={() => setView("dashboard")}
            onAttempt={(challengeId, answer, isCorrect) =>
              setProgress((current) => recordCommandAttempt(current, challengeId, answer, isCorrect))
            }
          />
        )}
        {view === "about" && (
          <AboutView locale={locale} onBack={() => setView("dashboard")} />
        )}
      </section>
    </main>
  );
}

function Dashboard({
  locale,
  selectedTrackId,
  modules,
  progress,
  onOpenLesson,
  onOpenQuiz,
}: {
  locale: Locale;
  selectedTrackId: CourseTrack;
  modules: CourseModule[];
  progress: ProgressState;
  onOpenLesson: (module: CourseModule) => void;
  onOpenQuiz: (module: CourseModule) => void;
}) {
  const t = text[locale];
  const selectedTrack = courseTracks[selectedTrackId];
  const totalLessons = modules.reduce((count, module) => count + module.lessons.length, 0);
  const courseLessonIds = new Set(modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
  const completedCount = progress.completedLessons.filter((lessonId) => courseLessonIds.has(lessonId)).length;
  const trackScores = modules.map((module) => progress.quizScores[module.id] ?? 0);

  const groupedModules = useMemo(() => {
    const groups: Record<"Inicial" | "Intermedio" | "Avanzado", CourseModule[]> = {
      Inicial: [],
      Intermedio: [],
      Avanzado: [],
    };
    modules.forEach((module) => {
      if (groups[module.difficulty]) {
        groups[module.difficulty].push(module);
      } else {
        groups.Avanzado.push(module);
      }
    });
    return groups;
  }, [modules]);

  const difficultyGroups = [
    {
      key: "Inicial" as const,
      title: {
        es: "De Cero a Principiante",
        en: "From Zero to Beginner",
      },
      description: {
        es: "Conceptos fundamentales, modelos de red OSI/TCP-IP, direccionamiento básico y configuraciones iniciales.",
        en: "Fundamental concepts, OSI/TCP-IP networking models, basic addressing, and initial device setups.",
      },
    },
    {
      key: "Intermedio" as const,
      title: {
        es: "De Principiante a Profesional",
        en: "From Beginner to Professional",
      },
      description: {
        es: "Enrutamiento dinámico (OSPF), VLANs, STP, redundancia y servicios de red como NAT y DHCP.",
        en: "Dynamic routing (OSPF), VLANs, STP, gateway redundancy, and network services like NAT and DHCP.",
      },
    },
    {
      key: "Avanzado" as const,
      title: {
        es: "De Profesional a Experto",
        en: "From Professional to Expert",
      },
      description: {
        es: "Seguridad de red, túneles VPN, direccionamiento IPv6 avanzado, automatización y diagnóstico complejo.",
        en: "Network security, VPN tunnels, advanced IPv6 addressing, automation, and complex troubleshooting.",
      },
    },
  ];

  return (
    <>
      <header className="workspace-header">
        <div>
          <span className="eyebrow">{selectedTrack.routeLabel[locale]}</span>
          <h2>{selectedTrack.title[locale]}</h2>
          <p>{selectedTrack.subtitle[locale]}</p>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <BookOpen size={22} />
          <strong>
            {completedCount}/{totalLessons}
          </strong>
          <span>{t.completed}</span>
        </div>
        <div className="stat-card">
          <Trophy size={22} />
          <strong>{Math.max(0, ...trackScores)}%</strong>
          <span>{t.bestScore}</span>
        </div>
        <div className="stat-card">
          <ClipboardCheck size={22} />
          <strong>{modules.length}</strong>
          <span>{locale === "es" ? "módulos activos" : "active modules"}</span>
        </div>
        <div className="stat-card">
          <Database size={22} />
          <strong>{knowledgeBase.entries.length}</strong>
          <span>{t.topics}</span>
        </div>
        <div className="stat-card">
          <TerminalSquare size={22} />
          <strong>{fullCommandTopics.reduce((total, topic) => total + topic.commands.length, 0)}</strong>
          <span>{t.commands}</span>
        </div>
      </section>

      {difficultyGroups.map((group) => {
        const groupModules = groupedModules[group.key];
        if (groupModules.length === 0) return null;

        return (
          <section key={group.key} className="difficulty-group-section">
            <header className="group-header">
              <span className={`difficulty-badge-large ${group.key.toLowerCase()}`}>{group.key}</span>
              <h3>{group.title[locale]}</h3>
              <p>{group.description[locale]}</p>
            </header>
            
            <div className="module-grid">
              {groupModules.map((module) => {
                const lessonsDone = module.lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length;
                const modulePercent = Math.round((lessonsDone / module.lessons.length) * 100);
                const score = progress.quizScores[module.id] ?? 0;

                return (
                  <article className="module-card" key={module.id}>
                    <div className="module-card-head">
                      <span className={`difficulty ${module.difficulty.toLowerCase()}`}>{module.difficulty}</span>
                      <span>
                        {module.estimatedMinutes} {t.minutes}
                      </span>
                    </div>
                    <h3>{module.title[locale]}</h3>
                    <p>{module.description[locale]}</p>
                    <div className="mini-progress">
                      <span style={{ width: `${modulePercent}%` }} />
                    </div>
                    <div className="module-meta">
                      <span>{modulePercent}%</span>
                      <span>
                        {t.bestScore}: {score}%
                      </span>
                    </div>
                    <div className="card-actions">
                      <button className="primary-button small" onClick={() => onOpenLesson(module)}>
                        {t.start}
                        <ChevronRight size={16} />
                      </button>
                      <button className="ghost-button small" onClick={() => onOpenQuiz(module)}>
                        {t.quiz}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}

function KnowledgeBaseView({ locale, onBack }: { locale: Locale; onBack: () => void }) {
  const t = text[locale];
  const [activeEntryId, setActiveEntryId] = useState(knowledgeBase.entries[0].id);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const entries = knowledgeBase.entries.filter((entry) => {
    if (!normalizedQuery) return true;
    return [entry.title, entry.summary, ...entry.tags, ...entry.facts, ...entry.commands]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });
  const activeEntry: KnowledgeEntry =
    entries.find((entry) => entry.id === activeEntryId) ?? entries[0] ?? knowledgeBase.entries[0];

  const sourceLabel = (sourceId: string) => knowledgeBase.sources.find((source) => source.id === sourceId)?.file ?? sourceId;

  return (
    <article className="content-surface knowledge-surface">
      <button className="back-button" onClick={onBack}>
        {t.back}
      </button>
      <span className="eyebrow">{t.sources}</span>
      <h2>{t.knowledgeTitle}</h2>
      <p className="lead">
        {locale === "es"
          ? `Material local estructurado desde ${knowledgeBase.sources.length} PDFs de la carpeta Materia_Redes.`
          : `Local material structured from ${knowledgeBase.sources.length} PDFs in the Materia_Redes folder.`}
      </p>

      <section className="knowledge-summary">
        <div>
          <strong>{knowledgeBase.entries.length}</strong>
          <span>{t.topics}</span>
        </div>
        <div>
          <strong>{knowledgeBase.sources.length}</strong>
          <span>{t.sources}</span>
        </div>
        <label className="knowledge-search">
          <span>{locale === "es" ? "Buscar" : "Search"}</span>
          <input
            value={query}
            placeholder={locale === "es" ? "IPv6, VLAN, OSPF, WLAN..." : "IPv6, VLAN, OSPF, WLAN..."}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              const nextEntry = knowledgeBase.entries.find((entry) =>
                [entry.title, entry.summary, ...entry.tags, ...entry.facts, ...entry.commands]
                  .join(" ")
                  .toLowerCase()
                  .includes(value.trim().toLowerCase()),
              );
              if (nextEntry) setActiveEntryId(nextEntry.id);
            }}
          />
        </label>
      </section>

      <div className="knowledge-layout">
        <nav className="knowledge-topic-list" aria-label={t.knowledge}>
          {entries.map((entry) => (
            <button
              key={entry.id}
              className={entry.id === activeEntry.id ? "knowledge-topic active" : "knowledge-topic"}
              onClick={() => setActiveEntryId(entry.id)}
            >
              <Database size={17} />
              <span>{entry.title}</span>
            </button>
          ))}
          {entries.length === 0 && (
            <p className="empty-state">{locale === "es" ? "Sin resultados." : "No results."}</p>
          )}
        </nav>

        <section className="knowledge-panel">
          <div className="knowledge-heading">
            <h3>{activeEntry.title}</h3>
            <p>{activeEntry.summary}</p>
          </div>

          <div className="tag-list">
            {activeEntry.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <section className="lesson-section">
            <h3>{t.facts}</h3>
            <ul className="fact-list">
              {activeEntry.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </section>

          <section className="lesson-section">
            <h3>{t.relatedCommands}</h3>
            <div className="knowledge-command-list">
              {activeEntry.commands.map((command) => (
                <code key={command}>{command}</code>
              ))}
            </div>
          </section>

          <section className="lesson-section">
            <h3>{t.sources}</h3>
            <div className="source-list">
              {activeEntry.sourceRefs.map((ref) => (
                <div className="source-item" key={`${ref.sourceId}-${ref.pages.join("-")}`}>
                  <strong>{sourceLabel(ref.sourceId)}</strong>
                  <span>
                    {t.sourcePages} {ref.pages.join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </article>
  );
}

function LessonView({
  locale,
  module,
  lesson,
  completed,
  onBack,
  onComplete,
  onQuiz,
}: {
  locale: Locale;
  module: CourseModule;
  lesson: Lesson;
  completed: boolean;
  onBack: () => void;
  onComplete: () => void;
  onQuiz: () => void;
}) {
  const t = text[locale];
  const sourceLabel = (sourceId: string) => knowledgeBase.sources.find((source) => source.id === sourceId)?.file ?? sourceId;
  const knowledgeEntry = knowledgeBase.entries.find((entry) => entry.id === lesson.knowledgeEntryId);

  return (
    <article className="content-surface">
      <button className="back-button" onClick={onBack}>
        {t.back}
      </button>
      <span className="eyebrow">{module.title[locale]}</span>
      <h2>{lesson.title[locale]}</h2>
      <section className="lesson-section objective-panel">
        <h3>{t.objective}</h3>
        <p>{lesson.objective[locale]}</p>
      </section>
      <p className="lead">{lesson.summary[locale]}</p>

      <section className="lesson-section">
        <h3>{t.keyTerms}</h3>
        <div className="term-grid">
          {lesson.keyTerms.map((term) => (
            <div className="term-chip" key={`${term.es}-${term.en}`}>
              <strong>{term.es}</strong>
              <span>{term.en}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lesson-section callout">
        <h3>{t.example}</h3>
        <p>{lesson.example[locale]}</p>
      </section>

      <section className="lesson-section practice-panel">
        <h3>{t.practiceSuggestion}</h3>
        <p>{lesson.practice[locale]}</p>
      </section>

      {lesson.lab && (
        <section className="lesson-section lab-panel">
          <h3>{t.guidedLab}</h3>
          <div className="lab-grid">
            <div>
              <strong>{t.topology}</strong>
              <p>{lesson.lab.topology[locale]}</p>
            </div>
            <div>
              <strong>{t.tasks}</strong>
              <ul>
                {lesson.lab.tasks.map((task) => (
                  <li key={task.es}>{task[locale]}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>{t.commands}</strong>
              <div className="knowledge-command-list">
                {lesson.lab.commands.map((command) => (
                  <code key={command}>{command}</code>
                ))}
              </div>
            </div>
            <div>
              <strong>{t.verification}</strong>
              <div className="knowledge-command-list">
                {lesson.lab.verification.map((command) => (
                  <code key={command}>{command}</code>
                ))}
              </div>
            </div>
            <div>
              <strong>{t.commonFailures}</strong>
              <ul>
                {lesson.lab.commonFailures.map((failure) => (
                  <li key={failure.es}>{failure[locale]}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="lesson-section">
        <h3>{t.sources}</h3>
        {knowledgeEntry && (
          <div className="knowledge-heading compact">
            <h3>{knowledgeEntry.title}</h3>
            <p>{knowledgeEntry.summary}</p>
          </div>
        )}
        <div className="source-list">
          {lesson.sourceRefs.map((ref) => (
            <div className="source-item" key={`${lesson.id}-${ref.sourceId}-${ref.pages.join("-")}`}>
              <strong>{sourceLabel(ref.sourceId)}</strong>
              <span>
                {t.sourcePages} {ref.pages.join(", ")}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="lesson-actions">
        <button className="primary-button" onClick={onComplete} disabled={completed}>
          <CheckCircle2 size={18} />
          {completed ? t.correct : t.completeLesson}
        </button>
        <button className="ghost-button" onClick={onQuiz}>
          {t.quiz}
        </button>
      </div>
    </article>
  );
}

function QuizView({
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
  const t = text[locale];
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

function SubnettingLab({ locale, onBack }: { locale: Locale; onBack: () => void }) {
  const t = text[locale];
  const [seed, setSeed] = useState(0);
  const [answers, setAnswers] = useState({
    subnetAddress: "",
    broadcastAddress: "",
    firstUsable: "",
    lastUsable: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const exercise = useMemo(() => getSubnetExercise(seed), [seed]);
  const result = useMemo(() => solveSubnet(exercise), [exercise]);

  const fields = [
    ["subnetAddress", t.subnetAddress],
    ["broadcastAddress", t.broadcastAddress],
    ["firstUsable", t.firstUsable],
    ["lastUsable", t.lastUsable],
  ] as const;

  const resetExercise = () => {
    setSeed((current) => current + 1);
    setAnswers({ subnetAddress: "", broadcastAddress: "", firstUsable: "", lastUsable: "" });
    setSubmitted(false);
  };

  return (
    <article className="content-surface">
      <button className="back-button" onClick={onBack}>
        {t.back}
      </button>
      <span className="eyebrow">{t.practice}</span>
      <h2>{t.practiceTitle}</h2>
      <p className="lead">
        {t.subnetPrompt}: {exercise.baseNetwork}/{exercise.prefix} → /{exercise.newPrefix}
      </p>

      <section className="subnet-layout">
        <div className="subnet-card">
          <h3>{t.subnetNumber}</h3>
          <strong>#{exercise.targetSubnet}</strong>
          <p>
            {t.totalSubnets}: {result.totalSubnets} · {t.usableHosts}: {result.usableHosts}
          </p>
        </div>

        <div className="subnet-form">
          {fields.map(([key, label]) => {
            const value = answers[key];
            const correct = normalizeIp(value) === result[key];
            const invalid = value.length > 0 && !isValidIp(value);
            return (
              <label key={key} className="input-row">
                <span>{label}</span>
                <input
                  value={value}
                  placeholder="192.168.10.0"
                  onChange={(event) => setAnswers((current) => ({ ...current, [key]: event.target.value }))}
                />
                {submitted && (
                  <small className={correct ? "answer-ok" : "answer-bad"}>
                    {correct ? t.correct : `${t.review}: ${result[key]}`}
                  </small>
                )}
                {!submitted && invalid && <small className="answer-bad">IP inválida</small>}
              </label>
            );
          })}
        </div>
      </section>

      <section className="lesson-section callout">
        <h3>{locale === "es" ? "Cómo pensarlo" : "How to reason it"}</h3>
        <p>
          {locale === "es"
            ? `El prefijo /${exercise.newPrefix} crea bloques de ${2 ** (32 - exercise.newPrefix)} direcciones. La subred #${exercise.targetSubnet} empieza al sumar ese bloque ${exercise.targetSubnet} veces desde la red base.`
            : `The /${exercise.newPrefix} prefix creates blocks of ${2 ** (32 - exercise.newPrefix)} addresses. Subnet #${exercise.targetSubnet} starts by adding that block ${exercise.targetSubnet} times from the base network.`}
        </p>
      </section>

      <div className="lesson-actions">
        <button className="primary-button" onClick={() => setSubmitted(true)}>
          <ClipboardCheck size={18} />
          {t.verify}
        </button>
        <button className="ghost-button" onClick={resetExercise}>
          <RefreshCcw size={18} />
          {t.newExercise}
        </button>
      </div>
    </article>
  );
}

function CommandTrainer({
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
  const t = text[locale];
  const [activeDevice, setActiveDevice] = useState<DeviceCategory>("general");
  const visibleTopics = fullCommandTopics.filter((topic) => topic.device === activeDevice);
  const [activeTopicId, setActiveTopicId] = useState(visibleTopics[0].id);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("write");
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [tutorFeedback, setTutorFeedback] = useState("");
  const [generatedChallenge, setGeneratedChallenge] = useState("");
  const [currentChallenge, setCurrentChallenge] = useState<TutorChallenge>(visibleTopics[0].challenge);
  const [aiLoading, setAiLoading] = useState(false);
  const activeTopic = visibleTopics.find((topic) => topic.id === activeTopicId) ?? visibleTopics[0];
  const normalizedAnswer = answer.trim().replace(/\s+/g, " ").toLowerCase();
  const expectedAnswer = currentChallenge.answer.trim().replace(/\s+/g, " ").toLowerCase();
  const isCorrect = normalizedAnswer === expectedAnswer;
  const challengeId = `${activeTopic.id}:${practiceMode}`;
  const attemptStats = progress.commandAttempts[challengeId];
  const aiReady = Boolean(aiStatus?.available && aiStatus.modelInstalled);
  const practiceModes: Array<{ id: PracticeMode; label: string }> = [
    { id: "recognize", label: t.recognizeMode },
    { id: "write", label: t.writeMode },
    { id: "configure", label: t.configureMode },
    { id: "diagnose", label: t.diagnoseMode },
  ];

  useEffect(() => {
    getAiStatus()
      .then((status) => setAiStatus(status))
      .catch(() =>
        setAiStatus({
          available: false,
          model: "llama3.2:3b",
          modelInstalled: false,
          models: [],
          message: "Backend IA no disponible.",
        }),
      );
  }, []);

  useEffect(() => {
    setCurrentChallenge(activeTopic.challenge);
    setAnswer("");
    setSubmitted(false);
    setTutorFeedback("");
    setGeneratedChallenge("");
  }, [activeTopic.id, practiceMode]);

  const chooseDevice = (device: DeviceCategory) => {
    const firstTopic = fullCommandTopics.find((topic) => topic.device === device);
    if (!firstTopic) return;
    setActiveDevice(device);
    setActiveTopicId(firstTopic.id);
    setAnswer("");
    setSubmitted(false);
    setTutorFeedback("");
    setGeneratedChallenge("");
    setCurrentChallenge(firstTopic.challenge);
  };

  const chooseTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setAnswer("");
    setSubmitted(false);
    setTutorFeedback("");
    setGeneratedChallenge("");
    const nextTopic = fullCommandTopics.find((topic) => topic.id === topicId);
    if (nextTopic) setCurrentChallenge(nextTopic.challenge);
  };

  const deterministicFeedback = (correct: boolean) => {
    const expectedCommand = activeTopic.commands.find(
      (item) => item.command.trim().toLowerCase() === expectedAnswer,
    );
    const studentCommand = activeTopic.commands.find(
      (item) => item.command.trim().toLowerCase() === normalizedAnswer,
    );
    const expectedPurpose = expectedCommand?.purpose[locale] ?? currentChallenge.prompt[locale];

    if (correct) {
      return locale === "es"
        ? `Diagnóstico: correcto. Explicación corta: el comando cumple el objetivo: ${expectedPurpose} Siguiente pregunta: ¿en qué modo CLI lo ejecutarías y qué comando show usarías para verificarlo?`
        : `Diagnosis: correct. Short explanation: the command matches the objective: ${expectedPurpose} Next question: which CLI mode would you run it from and which show command would verify it?`;
    }

    if (studentCommand) {
      return locale === "es"
        ? `Diagnóstico: comando válido, pero no para este reto. Explicación corta: "${studentCommand.command}" sirve para ${studentCommand.purpose.es.toLowerCase()} Aquí se pedía: ${expectedPurpose} Pista: ${currentChallenge.hint.es}`
        : `Diagnosis: valid command, but not for this challenge. Short explanation: "${studentCommand.command}" is used to ${studentCommand.purpose.en.toLowerCase()} Here the objective is: ${expectedPurpose} Hint: ${currentChallenge.hint.en}`;
    }

    if (normalizedAnswer.startsWith("interface ") && expectedAnswer === "no shutdown") {
      return locale === "es"
        ? `Diagnóstico: cambiaste de contexto, pero no activaste la interfaz. Explicación corta: "interface ..." entra al modo de interfaz; para levantarla se usa el comando esperado dentro de ese modo. Pista: ${currentChallenge.hint.es}`
        : `Diagnosis: you changed context, but did not enable the interface. Short explanation: "interface ..." enters interface configuration; the expected command enables it from that mode. Hint: ${currentChallenge.hint.en}`;
    }

    return locale === "es"
      ? `Diagnóstico: revisa sintaxis y contexto. Explicación corta: la respuesta no coincide con la tarea actual. Pista: ${currentChallenge.hint.es}`
      : `Diagnosis: review syntax and context. Short explanation: the answer does not match the current task. Hint: ${currentChallenge.hint.en}`;
  };

  const verifyAnswer = async () => {
    const correct = normalizedAnswer === expectedAnswer;
    setSubmitted(true);
    setTutorFeedback(deterministicFeedback(correct));
    onAttempt(challengeId, answer, correct);

    if (!aiReady) return;

    setAiLoading(true);
    try {
      const feedback = await requestTutorFeedback({
        locale,
        courseTrack: selectedTrackId,
        trackLabel,
        topic: activeTopic,
        challenge: currentChallenge,
        studentAnswer: answer,
        isCorrect: correct,
        mode: practiceMode,
      });
      setTutorFeedback(feedback || deterministicFeedback(correct));
    } catch (error) {
      setTutorFeedback(`${deterministicFeedback(correct)}\n\nIA local: ${error instanceof Error ? error.message : "sin respuesta"}`);
    } finally {
      setAiLoading(false);
    }
  };

  const generateChallenge = async () => {
    setGeneratedChallenge("");
    setAiLoading(true);
    try {
      const result = await requestNextChallenge({
        locale,
        courseTrack: selectedTrackId,
        trackLabel,
        topic: activeTopic,
        recentAttempts: Object.entries(progress.commandAttempts).slice(-5),
        mode: practiceMode,
      });
      setCurrentChallenge(result.challenge);
      setAnswer("");
      setSubmitted(false);
      setTutorFeedback("");
      setGeneratedChallenge(
        `${result.content}\n\n${
          result.source === "ai"
            ? locale === "es"
              ? "Origen: IA local con base de conocimiento."
              : "Source: local AI with knowledge base."
            : locale === "es"
              ? "Origen: generador local validado."
              : "Source: validated local generator."
        }`,
      );
    } catch (error) {
      setGeneratedChallenge(error instanceof Error ? error.message : "No se pudo generar el reto.");
    } finally {
      setAiLoading(false);
    }
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

      <section className={aiReady ? "ai-status online" : "ai-status offline"}>
        <BrainCircuit size={19} />
        <div>
          <strong>{t.aiTutor}</strong>
          <span>
            {aiReady ? t.aiOnline : t.aiOffline} · {aiStatus?.model ?? "llama3.2:3b"}
          </span>
          {!aiReady && (
            <small>
              {locale === "es"
                ? "Funciona con feedback local. Inicia el backend y descarga el modelo configurado para activar IA."
                : "The local fallback works. Start the backend and pull the configured model to enable AI."}
            </small>
          )}
        </div>
      </section>

      <section className="device-tabs" aria-label={t.deviceReview}>
        {deviceCategories.map((device) => (
          <button
            key={device.id}
            className={device.id === activeDevice ? "device-tab active" : "device-tab"}
            onClick={() => chooseDevice(device.id)}
          >
            {device.title[locale]}
          </button>
        ))}
      </section>

      <section className="practice-mode-tabs" aria-label={t.practiceMode}>
        <span>{t.practiceMode}</span>
        {practiceModes.map((mode) => (
          <button
            key={mode.id}
            className={mode.id === practiceMode ? "practice-mode active" : "practice-mode"}
            onClick={() => {
              setPracticeMode(mode.id);
              setAnswer("");
              setSubmitted(false);
              setTutorFeedback("");
              setGeneratedChallenge("");
            }}
          >
            {mode.label}
          </button>
        ))}
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
            <span>
              {activeTopic.commands.length} {t.allCommands}
            </span>
          </div>

          <div className="mode-chip">{activeTopic.mode}</div>

          <div className="command-table">
            {activeTopic.commands.map((item) => (
              <div className="command-row" key={item.command}>
                <code>{item.command}</code>
                <p>{item.purpose[locale]}</p>
                <small>{item.example}</small>
              </div>
            ))}
          </div>

          <section className="cli-challenge">
            <h3>{t.commandChallenge}</h3>
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
            {attemptStats && (
              <p className="attempt-line">
                {attemptStats.correct}/{attemptStats.attempts} {t.attempts}
              </p>
            )}
            <label className="input-row">
              <span>{t.yourCommand}</span>
              <input
                value={answer}
                placeholder={locale === "es" ? "Escribe tu respuesta exacta" : "Type your exact answer"}
                onChange={(event) => {
                  setAnswer(event.target.value);
                  setSubmitted(false);
                  setTutorFeedback("");
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
              <button className="primary-button" onClick={verifyAnswer} disabled={!answer.trim() || aiLoading}>
                <ClipboardCheck size={18} />
                {aiLoading ? "..." : t.verify}
              </button>
              <button className="ghost-button" onClick={generateChallenge} disabled={aiLoading}>
                <BrainCircuit size={18} />
                {t.nextChallenge}
              </button>
            </div>
          </section>

          {(tutorFeedback || generatedChallenge) && (
            <section className="tutor-panel">
              <h3>{t.tutorFeedback}</h3>
              {tutorFeedback && <p>{tutorFeedback}</p>}
              {generatedChallenge && <pre>{generatedChallenge}</pre>}
            </section>
          )}
        </section>
      </div>
    </article>
  );
}

function AboutView({ locale, onBack }: { locale: Locale; onBack: () => void }) {
  const isEs = locale === "es";
  return (
    <article className="content-surface about-surface">
      <button className="back-button" onClick={onBack}>
        {isEs ? "Volver" : "Back"}
      </button>
      
      <span className="eyebrow">{isEs ? "Información del Proyecto" : "Project Information"}</span>
      <h2>{isEs ? "Acerca de App Redes" : "About App Redes"}</h2>
      
      <p className="lead">
        {isEs 
          ? "Una plataforma interactiva bilingüe diseñada para el dominio y preparación de las certificaciones Cisco CCNA y CCNP Enterprise."
          : "An interactive bilingual platform designed for mastering and preparing for the Cisco CCNA and CCNP Enterprise certifications."}
      </p>

      <section className="about-layout-grid">
        <div className="about-main-card">
          <h3>⚡ {isEs ? "Características del Sistema" : "System Features"}</h3>
          <ul className="about-feature-list" style={{ display: "grid", gap: "12px", paddingLeft: "20px", margin: "0" }}>
            <li>
              <strong>{isEs ? "Rutas Separadas:" : "Separate Tracks:"}</strong>{" "}
              {isEs 
                ? "Contenido modular especializado para CCNA (Fundamentos y Redes locales) y CCNP Enterprise (ENCOR + ENARSI)."
                : "Specialized modular content for CCNA (Foundations & Local networks) and CCNP Enterprise (ENCOR + ENARSI)."}
            </li>
            <li>
              <strong>{isEs ? "Laboratorios Prácticos:" : "Practical Labs:"}</strong>{" "}
              {isEs 
                ? "Simulación de comandos, topologías lógicas, verificación mediante comandos show y guía de resolución de fallas comunes."
                : "Command simulations, logical topologies, verification through show commands, and troubleshooting guides."}
            </li>
            <li>
              <strong>{isEs ? "Entrenador de CLI:" : "CLI Trainer:"}</strong>{" "}
              {isEs 
                ? "Práctica interactiva en terminal simulada para afianzar la sintaxis de comandos Cisco en 4 modos de estudio."
                : "Interactive terminal simulation to solidify Cisco command syntax in 4 distinct learning modes."}
            </li>
            <li>
              <strong>{isEs ? "Tutor de IA Local:" : "Local AI Tutor:"}</strong>{" "}
              {isEs 
                ? "Soporte interactivo de tutoría mediante modelos de IA ejecutados localmente con Ollama (como Llama 3.2)."
                : "Interactive tutoring support using AI models run locally with Ollama (such as Llama 3.2)."}
            </li>
          </ul>
        </div>

        <div className="about-tech-card" style={{ display: "grid", gap: "10px" }}>
          <h3>🛠️ {isEs ? "Stack Tecnológico" : "Tech Stack"}</h3>
          <div className="tech-badge-container" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <span className="tech-badge">React 19</span>
            <span className="tech-badge">TypeScript</span>
            <span className="tech-badge">Vite</span>
            <span className="tech-badge">Vanilla CSS HSL</span>
            <span className="tech-badge">Express API</span>
            <span className="tech-badge">Ollama IA</span>
            <span className="tech-badge">Lucide Icons</span>
          </div>
          <p style={{ marginTop: "16px", fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: "1.5", margin: "0" }}>
            {isEs 
              ? "Desarrollado con una arquitectura moderna Single Page Application (SPA), optimizada para una carga ultrarrápida, responsividad total y cero dependencias pesadas de frameworks."
              : "Developed with a modern Single Page Application (SPA) architecture, optimized for ultra-fast loading, full responsiveness, and zero bloated framework dependencies."}
          </p>
        </div>
      </section>

      <section className="about-creator-section" style={{ marginTop: "12px" }}>
        <div className="creator-card">
          <div className="creator-avatar">
            <Router size={32} />
          </div>
          <div className="creator-info">
            <h4 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: "700" }}>Alexander Villalva</h4>
            <p className="creator-title" style={{ margin: "0 0 8px", fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>{isEs ? "Desarrollador y Creador del Proyecto" : "Developer & Project Creator"}</p>
            <p className="creator-desc" style={{ margin: "0", fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
              {isEs 
                ? "Estudiante y apasionado de las redes de telecomunicaciones, la programación y la inteligencia artificial local. Creado con el fin de facilitar el aprendizaje práctico de CCNA/CCNP."
                : "Student and enthusiast of telecommunication networks, programming, and local artificial intelligence. Built with the purpose of simplifying hands-on CCNA/CCNP learning."}
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}

