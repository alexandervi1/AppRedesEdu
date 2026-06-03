import { useMemo } from "react";
import { BookOpen, CheckCircle2, ChevronRight, ClipboardCheck, Database, TerminalSquare, Trophy } from "lucide-react";
import { commandTopics as fullCommandTopics } from "@data/commands";
import knowledgeBase from "@data/knowledgeBase.json";
import { courseTracks } from "@data/tracks";
import { appText } from "@app/i18n";
import { CourseModule, CourseTrack, Locale, ProgressState } from "@shared/types";
export function Dashboard({
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
  const t = appText[locale];
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

