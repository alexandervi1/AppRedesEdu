import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Database,
  GraduationCap,
  Info,
  Languages,
  LayoutDashboard,
  Menu,
  Network,
  Router,
  TerminalSquare,
  X,
} from "lucide-react";
import { courseTracks, trackList } from "@data/tracks";
import { loadProgress, markLessonComplete, recordCommandAttempt, saveProgress, saveQuizScore } from "@shared/lib/progress";
import { AboutView } from "@features/about/AboutView";
import { CommandTrainer } from "@features/commands/CommandTrainer";
import { Dashboard } from "@features/dashboard/Dashboard";
import { KnowledgeBaseView } from "@features/knowledge/KnowledgeBaseView";
import { LessonView } from "@features/lessons/LessonView";
import { QuizView } from "@features/quiz/QuizView";
import { SubnettingLab } from "@features/subnetting/SubnettingLab";
import { TeacherContentView } from "@features/student/TeacherContentView";
import { TeacherDashboard } from "@features/teacher/TeacherDashboard";
import { CourseModule, CourseTrack, Lesson, Locale, ProgressState } from "@shared/types";
import { appText } from "./i18n";

type View = "dashboard" | "lesson" | "quiz" | "subnetting" | "knowledge" | "commands" | "teacher-content" | "teacher" | "about";

export function App() {
  const [locale, setLocale] = useState<Locale>("es");
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState<CourseTrack>("ccna");
  const selectedTrack = courseTracks[activeTrackId];
  const activeModules = selectedTrack.modules;
  const [activeModuleId, setActiveModuleId] = useState(activeModules[0].id);
  const [activeLessonId, setActiveLessonId] = useState(activeModules[0].lessons[0].id);
  const t = appText[locale];

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const navigateTo = (nextView: View) => {
    setView(nextView);
    setSidebarOpen(false);
  };

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
    navigateTo("dashboard");
  };

  const openLesson = (module: CourseModule, lesson: Lesson = module.lessons[0]) => {
    setActiveModuleId(module.id);
    setActiveLessonId(lesson.id);
    navigateTo("lesson");
  };

  const openQuiz = (module: CourseModule) => {
    setActiveModuleId(module.id);
    navigateTo("quiz");
  };

  const completeLesson = () => {
    setProgress((current) => markLessonComplete(current, activeLesson.id));
  };

  return (
    <main className={sidebarOpen ? "app-shell sidebar-open" : "app-shell"}>
      <button
        className="mobile-nav-toggle"
        type="button"
        aria-controls="app-sidebar"
        aria-expanded={sidebarOpen}
        aria-label={
          sidebarOpen
            ? locale === "es" ? "Cerrar navegación" : "Close navigation"
            : locale === "es" ? "Abrir navegación" : "Open navigation"
        }
        onClick={() => setSidebarOpen((current) => !current)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <button
        className="sidebar-overlay"
        type="button"
        aria-label={locale === "es" ? "Cerrar navegación" : "Close navigation"}
        onClick={() => setSidebarOpen(false)}
      />

      <aside id="app-sidebar" className="sidebar" aria-label="Resumen del curso">
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
              onClick={() => navigateTo("dashboard")}
            >
              <span className="nav-state"><LayoutDashboard size={17} /></span>
              <span>{locale === "es" ? "Panel de Control" : "Dashboard"}</span>
            </button>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">{locale === "es" ? "Laboratorios y Práctica" : "Labs & Practice"}</span>
            <button
              className={view === "subnetting" ? "nav-item active" : "nav-item"}
              onClick={() => navigateTo("subnetting")}
            >
              <span className="nav-state"><Network size={17} /></span>
              <span>{t.practice}</span>
            </button>
            <button
              className={view === "commands" ? "nav-item active" : "nav-item"}
              onClick={() => navigateTo("commands")}
            >
              <span className="nav-state"><TerminalSquare size={17} /></span>
              <span>{t.commands}</span>
            </button>
            <button
              className={view === "knowledge" ? "nav-item active" : "nav-item"}
              onClick={() => navigateTo("knowledge")}
            >
              <span className="nav-state"><Database size={17} /></span>
              <span>{t.knowledge}</span>
            </button>
            <button
              className={view === "teacher-content" ? "nav-item active" : "nav-item"}
              onClick={() => navigateTo("teacher-content")}
            >
              <span className="nav-state"><GraduationCap size={17} /></span>
              <span>{locale === "es" ? "Contenido docente" : "Teacher content"}</span>
            </button>
            <button
              className={view === "teacher" ? "nav-item active" : "nav-item"}
              onClick={() => navigateTo("teacher")}
            >
              <span className="nav-state"><GraduationCap size={17} /></span>
              <span>{locale === "es" ? "Panel docente" : "Teacher panel"}</span>
            </button>
            <button
              className={view === "about" ? "nav-item active" : "nav-item"}
              onClick={() => navigateTo("about")}
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
            onBack={() => navigateTo("dashboard")}
            onComplete={completeLesson}
            onQuiz={() => openQuiz(activeModule)}
          />
        )}
        {view === "quiz" && (
          <QuizView
            locale={locale}
            module={activeModule}
            previousScore={progress.quizScores[activeModule.id] ?? 0}
            onBack={() => navigateTo("dashboard")}
            onFinish={(score) => setProgress((current) => saveQuizScore(current, activeModule.id, score))}
          />
        )}
        {view === "subnetting" && <SubnettingLab locale={locale} onBack={() => navigateTo("dashboard")} />}
        {view === "knowledge" && <KnowledgeBaseView locale={locale} onBack={() => navigateTo("dashboard")} />}
        {view === "teacher-content" && <TeacherContentView locale={locale} onBack={() => navigateTo("dashboard")} />}
        {view === "commands" && (
          <CommandTrainer
            locale={locale}
            selectedTrackId={activeTrackId}
            trackLabel={selectedTrack.label[locale]}
            progress={progress}
            onBack={() => navigateTo("dashboard")}
            onAttempt={(challengeId, answer, isCorrect) =>
              setProgress((current) => recordCommandAttempt(current, challengeId, answer, isCorrect))
            }
          />
        )}
        {view === "about" && (
          <AboutView locale={locale} onBack={() => navigateTo("dashboard")} />
        )}
        {view === "teacher" && (
          <TeacherDashboard locale={locale} onBack={() => navigateTo("dashboard")} />
        )}
      </section>
    </main>
  );
}

