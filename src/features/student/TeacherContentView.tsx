import { useEffect, useMemo, useState } from "react";
import { BookOpen, Filter, GraduationCap } from "lucide-react";
import { listSubjects } from "@shared/lib/subjects";
import { listPublishedTeacherContent } from "@shared/lib/teacherContent";
import { Locale, SubjectConfig, TeacherContentItem, TeacherContentType } from "@shared/types";

const typeLabels: Record<TeacherContentType, { es: string; en: string }> = {
  module: { es: "Modulo", en: "Module" },
  lesson: { es: "Leccion", en: "Lesson" },
  quiz: { es: "Quiz", en: "Quiz" },
  command: { es: "Comando", en: "Command" },
  knowledge: { es: "Conocimiento", en: "Knowledge" },
};

const typeOrder: TeacherContentType[] = ["module", "lesson", "quiz", "command", "knowledge"];

export function TeacherContentView({ locale, onBack }: { locale: Locale; onBack: () => void }) {
  const [items, setItems] = useState<TeacherContentItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string>("all");
  const [activeType, setActiveType] = useState<TeacherContentType | "all">("all");
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isEs = locale === "es";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [nextItems, nextSubjects] = await Promise.all([listPublishedTeacherContent(), listSubjects()]);
        setSubjects(nextSubjects);
        setItems(nextItems);
        setActiveItemId(nextItems[0]?.id ?? null);
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar contenido.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const visibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (activeSubjectId === "all" || item.subjectId === activeSubjectId) &&
          (activeType === "all" || item.type === activeType),
      ),
    [activeSubjectId, activeType, items],
  );
  const activeItem = visibleItems.find((item) => item.id === activeItemId) ?? visibleItems[0];

  useEffect(() => {
    if (visibleItems.length === 0) {
      setActiveItemId(null);
      return;
    }
    if (!visibleItems.some((item) => item.id === activeItemId)) {
      setActiveItemId(visibleItems[0].id);
    }
  }, [activeItemId, visibleItems]);

  return (
    <article className="content-surface student-content-surface">
      <button className="back-button" onClick={onBack}>
        {isEs ? "Volver" : "Back"}
      </button>
      <span className="eyebrow">{isEs ? "Contenido docente" : "Teacher content"}</span>
      <h2>{isEs ? "Material publicado por el docente" : "Teacher-published material"}</h2>
      <p className="lead">
        {isEs
          ? "Consulta recursos corregidos y publicados desde el panel docente para reforzar tu aprendizaje."
          : "Review corrected resources published from the teacher panel to reinforce your learning."}
      </p>

      <section className="student-content-filters" aria-label={isEs ? "Filtros de contenido" : "Content filters"}>
        <Filter size={18} />
        <select value={activeSubjectId} onChange={(event) => setActiveSubjectId(event.target.value)}>
          <option value="all">{isEs ? "Todas las asignaturas" : "All subjects"}</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>{subject.title[locale]}</option>
          ))}
        </select>
        <button className={activeType === "all" ? "filter-chip active" : "filter-chip"} onClick={() => setActiveType("all")}>
          {isEs ? "Todo" : "All"}
        </button>
        {typeOrder.map((type) => (
          <button
            key={type}
            className={activeType === type ? "filter-chip active" : "filter-chip"}
            onClick={() => setActiveType(type)}
          >
            {typeLabels[type][locale]}
          </button>
        ))}
      </section>

      {loading && <p className="empty-state">{isEs ? "Cargando contenido..." : "Loading content..."}</p>}
      {error && <p className="answer-bad">{error}</p>}

      {!loading && !error && visibleItems.length === 0 && (
        <p className="empty-state">
          {isEs
            ? "Aun no hay contenido docente publicado para este filtro."
            : "There is no teacher-published content for this filter yet."}
        </p>
      )}

      {!loading && !error && visibleItems.length > 0 && (
        <div className="student-content-layout">
          <nav className="student-content-list" aria-label={isEs ? "Contenido publicado" : "Published content"}>
            {visibleItems.map((item) => (
              <button
                key={item.id}
                className={item.id === activeItem?.id ? "student-content-topic active" : "student-content-topic"}
                onClick={() => setActiveItemId(item.id)}
              >
                <GraduationCap size={17} />
                <span>{item.title[locale]}</span>
                <small>
                  {subjects.find((subject) => subject.id === item.subjectId)?.code ?? typeLabels[item.type][locale]} · {typeLabels[item.type][locale]}
                </small>
              </button>
            ))}
          </nav>

          {activeItem && (
            <section className="student-content-panel">
              <div className="knowledge-heading">
                <div>
                  <span className="teacher-status published">{typeLabels[activeItem.type][locale]}</span>
                  <span className="subject-label">
                    {subjects.find((subject) => subject.id === activeItem.subjectId)?.title[locale] ?? (isEs ? "Asignatura" : "Subject")}
                  </span>
                  <h3>{activeItem.title[locale]}</h3>
                  <p>{activeItem.summary[locale]}</p>
                </div>
                <BookOpen size={24} />
              </div>

              {activeItem.tags.length > 0 && (
                <div className="tag-list">
                  {activeItem.tags.map((tag) => (
                    <span key={tag} className="tech-badge" data-tag={tag.toLowerCase()}>{tag}</span>
                  ))}
                </div>
              )}

              <div className="student-content-body">
                {activeItem.body[locale].split(/\n{2,}/).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </article>
  );
}
