import { BookOpen, CheckCircle2, ClipboardCheck, FileText } from "lucide-react";
import knowledgeBase from "@data/knowledgeBase.json";
import { appText } from "@app/i18n";
import { CopyableCode } from "@shared/ui/CopyableCode";
import { CourseModule, Lesson, Locale } from "@shared/types";
export function LessonView({
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
  const t = appText[locale];
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

