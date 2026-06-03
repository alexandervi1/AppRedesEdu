import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Save, Trash2 } from "lucide-react";
import {
  createTeacherContent,
  deleteTeacherContent,
  listTeacherContent,
  TeacherContentPayload,
  updateTeacherContent,
} from "@shared/lib/teacherContent";
import {
  createSubject,
  deleteSubject,
  listTeacherSubjects,
  SubjectPayload,
  updateSubject,
} from "@shared/lib/subjects";
import { Locale, SubjectConfig, TeacherContentItem, TeacherContentStatus, TeacherContentType } from "@shared/types";

const defaultSubjectId = "redes-ccna-ccnp";

const emptyPayload: TeacherContentPayload = {
  subjectId: defaultSubjectId,
  type: "lesson",
  status: "draft",
  title: { es: "", en: "" },
  summary: { es: "", en: "" },
  body: { es: "", en: "" },
  tags: [],
};

const emptySubjectPayload: SubjectPayload = {
  code: "",
  status: "active",
  title: { es: "", en: "" },
  description: { es: "", en: "" },
};

const contentTypes: TeacherContentType[] = ["module", "lesson", "quiz", "command", "knowledge"];
const statuses: TeacherContentStatus[] = ["draft", "published"];

const typeLabel = (type: TeacherContentType, locale: Locale) => {
  const labels: Record<TeacherContentType, { es: string; en: string }> = {
    module: { es: "Modulo", en: "Module" },
    lesson: { es: "Leccion", en: "Lesson" },
    quiz: { es: "Quiz", en: "Quiz" },
    command: { es: "Comando", en: "Command" },
    knowledge: { es: "Conocimiento", en: "Knowledge" },
  };
  return labels[type][locale];
};

const statusLabel = (status: TeacherContentStatus, locale: Locale) => {
  if (status === "published") return locale === "es" ? "Publicado" : "Published";
  return locale === "es" ? "Borrador" : "Draft";
};

const payloadFromItem = (item: TeacherContentItem): TeacherContentPayload => ({
  subjectId: item.subjectId || defaultSubjectId,
  type: item.type,
  status: item.status,
  title: item.title,
  summary: item.summary,
  body: item.body,
  tags: item.tags,
});

export function TeacherDashboard({ locale, onBack }: { locale: Locale; onBack: () => void }) {
  const [items, setItems] = useState<TeacherContentItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);
  const [form, setForm] = useState<TeacherContentPayload>(emptyPayload);
  const [subjectForm, setSubjectForm] = useState<SubjectPayload>(emptySubjectPayload);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isEs = locale === "es";
  const publishedCount = useMemo(() => items.filter((item) => item.status === "published").length, [items]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const [nextItems, nextSubjects] = await Promise.all([listTeacherContent(), listTeacherSubjects()]);
      setItems(nextItems);
      setSubjects(nextSubjects);
      setForm((current) => ({
        ...current,
        subjectId: current.subjectId || nextSubjects[0]?.id || defaultSubjectId,
      }));
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar contenido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const updateTextField = (
    section: "title" | "summary" | "body",
    language: Locale,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [language]: value,
      },
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyPayload, subjectId: subjects[0]?.id || defaultSubjectId });
    setEditingId(null);
  };

  const resetSubjectForm = () => {
    setSubjectForm(emptySubjectPayload);
    setEditingSubjectId(null);
  };

  const saveContent = async () => {
    setLoading(true);
    try {
      const saved = editingId
        ? await updateTeacherContent(editingId, form)
        : await createTeacherContent(form);
      setItems((current) => {
        if (!editingId) return [saved, ...current];
        return current.map((item) => (item.id === saved.id ? saved : item));
      });
      setMessage(isEs ? "Contenido guardado." : "Content saved.");
      resetForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  };

  const removeContent = async (itemId: string) => {
    setLoading(true);
    try {
      await deleteTeacherContent(itemId);
      setItems((current) => current.filter((item) => item.id !== itemId));
      if (editingId === itemId) resetForm();
      setMessage(isEs ? "Contenido eliminado." : "Content deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  };

  const saveSubject = async () => {
    setLoading(true);
    try {
      const saved = editingSubjectId
        ? await updateSubject(editingSubjectId, subjectForm)
        : await createSubject(subjectForm);
      setSubjects((current) => {
        if (!editingSubjectId) return [saved, ...current];
        return current.map((subject) => (subject.id === saved.id ? saved : subject));
      });
      setForm((current) => ({ ...current, subjectId: saved.id }));
      setMessage(isEs ? "Asignatura guardada." : "Subject saved.");
      resetSubjectForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la asignatura.");
    } finally {
      setLoading(false);
    }
  };

  const removeSubject = async (subjectId: string) => {
    setLoading(true);
    try {
      await deleteSubject(subjectId);
      setSubjects((current) => current.filter((subject) => subject.id !== subjectId));
      setItems((current) => current.filter((item) => item.subjectId !== subjectId));
      if (form.subjectId === subjectId) setForm((current) => ({ ...current, subjectId: defaultSubjectId }));
      setMessage(isEs ? "Asignatura eliminada." : "Subject deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar la asignatura.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="content-surface teacher-surface">
      <button className="back-button" onClick={onBack}>
        {isEs ? "Volver" : "Back"}
      </button>
      <span className="eyebrow">{isEs ? "Panel docente" : "Teacher panel"}</span>
      <h2>{isEs ? "Gestionar contenido educativo" : "Manage educational content"}</h2>
      <p className="lead">
        {isEs
          ? "Crea, corrige, publica o elimina contenido antes de integrarlo en las rutas del alumno."
          : "Create, correct, publish, or delete content before integrating it into student paths."}
      </p>

      <section className="teacher-stats">
        <div>
          <strong>{items.length}</strong>
          <span>{isEs ? "contenidos" : "items"}</span>
        </div>
        <div>
          <strong>{publishedCount}</strong>
          <span>{isEs ? "publicados" : "published"}</span>
        </div>
        <div>
          <strong>{items.length - publishedCount}</strong>
          <span>{isEs ? "borradores" : "drafts"}</span>
        </div>
      </section>

      <section className="subject-manager">
        <div className="section-heading-row">
          <h3>{isEs ? "Configuracion de asignaturas" : "Subject configuration"}</h3>
          {editingSubjectId && (
            <button className="ghost-button small" onClick={resetSubjectForm}>
              <Plus size={16} />
              {isEs ? "Nueva asignatura" : "New subject"}
            </button>
          )}
        </div>

        <div className="subject-manager-grid">
          <div className="subject-form">
            <div className="teacher-form-grid">
              <label className="input-row">
                <span>{isEs ? "Codigo" : "Code"}</span>
                <input value={subjectForm.code} onChange={(event) => setSubjectForm((current) => ({ ...current, code: event.target.value }))} />
              </label>
              <label className="input-row">
                <span>{isEs ? "Estado" : "Status"}</span>
                <select value={subjectForm.status} onChange={(event) => setSubjectForm((current) => ({ ...current, status: event.target.value as SubjectConfig["status"] }))}>
                  <option value="active">{isEs ? "Activa" : "Active"}</option>
                  <option value="archived">{isEs ? "Archivada" : "Archived"}</option>
                </select>
              </label>
            </div>
            <label className="input-row">
              <span>{isEs ? "Nombre ES" : "Name ES"}</span>
              <input value={subjectForm.title.es} onChange={(event) => setSubjectForm((current) => ({ ...current, title: { ...current.title, es: event.target.value } }))} />
            </label>
            <label className="input-row">
              <span>{isEs ? "Nombre EN" : "Name EN"}</span>
              <input value={subjectForm.title.en} onChange={(event) => setSubjectForm((current) => ({ ...current, title: { ...current.title, en: event.target.value } }))} />
            </label>
            <label className="input-row">
              <span>{isEs ? "Descripcion ES" : "Description ES"}</span>
              <textarea value={subjectForm.description.es} onChange={(event) => setSubjectForm((current) => ({ ...current, description: { ...current.description, es: event.target.value } }))} />
            </label>
            <label className="input-row">
              <span>{isEs ? "Descripcion EN" : "Description EN"}</span>
              <textarea value={subjectForm.description.en} onChange={(event) => setSubjectForm((current) => ({ ...current, description: { ...current.description, en: event.target.value } }))} />
            </label>
            <button className="primary-button" onClick={saveSubject} disabled={loading}>
              <Save size={18} />
              {isEs ? "Guardar asignatura" : "Save subject"}
            </button>
          </div>

          <div className="subject-list">
            {subjects.map((subject) => (
              <article className="subject-item" key={subject.id}>
                <div>
                  <span className={`teacher-status ${subject.status === "active" ? "published" : "draft"}`}>{subject.code}</span>
                  <h4>{subject.title[locale]}</h4>
                  <p>{subject.description[locale]}</p>
                </div>
                <div className="teacher-item-actions">
                  <button className="ghost-button small" onClick={() => {
                    setEditingSubjectId(subject.id);
                    setSubjectForm({
                      code: subject.code,
                      status: subject.status,
                      title: subject.title,
                      description: subject.description,
                    });
                  }}>
                    <Edit3 size={16} />
                    {isEs ? "Editar" : "Edit"}
                  </button>
                  <button className="ghost-button small danger" onClick={() => void removeSubject(subject.id)}>
                    <Trash2 size={16} />
                    {isEs ? "Borrar" : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="teacher-layout">
        <section className="teacher-form">
          <div className="section-heading-row">
            <h3>{editingId ? (isEs ? "Editar contenido" : "Edit content") : (isEs ? "Nuevo contenido" : "New content")}</h3>
            {editingId && (
              <button className="ghost-button small" onClick={resetForm}>
                <Plus size={16} />
                {isEs ? "Nuevo" : "New"}
              </button>
            )}
          </div>

          <div className="teacher-form-grid">
            <label className="input-row">
              <span>{isEs ? "Asignatura" : "Subject"}</span>
              <select value={form.subjectId} onChange={(event) => setForm((current) => ({ ...current, subjectId: event.target.value }))}>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.title[locale]}</option>
                ))}
              </select>
            </label>
            <label className="input-row">
              <span>{isEs ? "Tipo" : "Type"}</span>
              <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as TeacherContentType }))}>
                {contentTypes.map((type) => (
                  <option key={type} value={type}>{typeLabel(type, locale)}</option>
                ))}
              </select>
            </label>
            <label className="input-row">
              <span>{isEs ? "Estado" : "Status"}</span>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TeacherContentStatus }))}>
                {statuses.map((status) => (
                  <option key={status} value={status}>{statusLabel(status, locale)}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="input-row">
            <span>{isEs ? "Titulo ES" : "Title ES"}</span>
            <input value={form.title.es} onChange={(event) => updateTextField("title", "es", event.target.value)} />
          </label>
          <label className="input-row">
            <span>{isEs ? "Titulo EN" : "Title EN"}</span>
            <input value={form.title.en} onChange={(event) => updateTextField("title", "en", event.target.value)} />
          </label>
          <label className="input-row">
            <span>{isEs ? "Resumen ES" : "Summary ES"}</span>
            <textarea value={form.summary.es} onChange={(event) => updateTextField("summary", "es", event.target.value)} />
          </label>
          <label className="input-row">
            <span>{isEs ? "Resumen EN" : "Summary EN"}</span>
            <textarea value={form.summary.en} onChange={(event) => updateTextField("summary", "en", event.target.value)} />
          </label>
          <label className="input-row">
            <span>{isEs ? "Contenido educativo ES" : "Educational content ES"}</span>
            <textarea className="large-textarea" value={form.body.es} onChange={(event) => updateTextField("body", "es", event.target.value)} />
          </label>
          <label className="input-row">
            <span>{isEs ? "Contenido educativo EN" : "Educational content EN"}</span>
            <textarea className="large-textarea" value={form.body.en} onChange={(event) => updateTextField("body", "en", event.target.value)} />
          </label>
          <label className="input-row">
            <span>{isEs ? "Etiquetas separadas por coma" : "Comma-separated tags"}</span>
            <input
              value={form.tags.join(", ")}
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) }))}
            />
          </label>

          <button className="primary-button" onClick={saveContent} disabled={loading}>
            <Save size={18} />
            {isEs ? "Guardar contenido" : "Save content"}
          </button>
          {message && <p className="teacher-message">{message}</p>}
        </section>

        <section className="teacher-list">
          <div className="section-heading-row">
            <h3>{isEs ? "Contenido cargado" : "Loaded content"}</h3>
            <span>{loading ? "..." : items.length}</span>
          </div>

          {items.length === 0 && <p className="empty-state">{isEs ? "Aun no hay contenido docente." : "No teacher content yet."}</p>}
          {items.map((item) => (
            <article className="teacher-item" key={item.id}>
              <div>
                <span className={`teacher-status ${item.status}`}>{statusLabel(item.status, locale)}</span>
                <h4>{item.title[locale]}</h4>
                <p>{item.summary[locale]}</p>
              </div>
              <div className="teacher-item-actions">
                <button className="ghost-button small" onClick={() => {
                  setEditingId(item.id);
                  setForm(payloadFromItem(item));
                }}>
                  <Edit3 size={16} />
                  {isEs ? "Editar" : "Edit"}
                </button>
                <button className="ghost-button small danger" onClick={() => void removeContent(item.id)}>
                  <Trash2 size={16} />
                  {isEs ? "Borrar" : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </article>
  );
}
