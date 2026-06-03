import fs from "node:fs";
import path from "node:path";

export const defaultSubjectId = "redes-ccna-ccnp";

const defaultStore = {
  version: 1,
  subjects: [
    {
      id: defaultSubjectId,
      code: "REDES",
      status: "active",
      title: { es: "Redes CCNA / CCNP", en: "CCNA / CCNP Networks" },
      description: {
        es: "Asignatura base para estudiar fundamentos, switching, routing, comandos Cisco y laboratorios.",
        en: "Base subject for studying fundamentals, switching, routing, Cisco commands, and labs.",
      },
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    },
  ],
};

const isRecord = (value) => value && typeof value === "object" && !Array.isArray(value);
const hasText = (value) => typeof value === "string" && value.trim().length > 0;

const slugify = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const ensureStoreFile = (storePath) => {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify(defaultStore, null, 2), "utf8");
  }
};

const readStore = (storePath) => {
  ensureStoreFile(storePath);
  const parsed = JSON.parse(fs.readFileSync(storePath, "utf8"));
  const subjects = Array.isArray(parsed.subjects) && parsed.subjects.length > 0 ? parsed.subjects : defaultStore.subjects;
  return {
    version: Number.isFinite(parsed.version) ? parsed.version : 1,
    subjects,
  };
};

const writeStore = (storePath, store) => {
  ensureStoreFile(storePath);
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
};

export const validateSubject = (payload) => {
  const errors = [];
  if (!isRecord(payload)) return ["La asignatura debe ser un objeto valido."];
  if (!hasText(payload.code)) errors.push("El codigo de asignatura es obligatorio.");
  if (!["active", "archived"].includes(payload.status)) errors.push("El estado de asignatura no es valido.");
  if (!isRecord(payload.title) || !hasText(payload.title.es) || !hasText(payload.title.en)) {
    errors.push("El nombre de la asignatura debe estar completo en espanol e ingles.");
  }
  if (!isRecord(payload.description) || !hasText(payload.description.es) || !hasText(payload.description.en)) {
    errors.push("La descripcion de la asignatura debe estar completa en espanol e ingles.");
  }
  return errors;
};

export const listSubjects = (storePath) => readStore(storePath).subjects;

export const createSubject = (storePath, payload) => {
  const errors = validateSubject(payload);
  if (errors.length) return { errors };

  const store = readStore(storePath);
  const now = new Date().toISOString();
  const baseId = slugify(payload.code || payload.title.es) || `subject-${Date.now().toString(36)}`;
  const id = store.subjects.some((subject) => subject.id === baseId)
    ? `${baseId}-${Date.now().toString(36)}`
    : baseId;
  const subject = {
    id,
    code: String(payload.code).trim().toUpperCase(),
    status: payload.status,
    title: payload.title,
    description: payload.description,
    createdAt: now,
    updatedAt: now,
  };

  store.subjects.unshift(subject);
  writeStore(storePath, store);
  return { subject };
};

export const updateSubject = (storePath, subjectId, payload) => {
  const errors = validateSubject(payload);
  if (errors.length) return { errors };

  const store = readStore(storePath);
  const index = store.subjects.findIndex((subject) => subject.id === subjectId);
  if (index === -1) return { notFound: true };

  const current = store.subjects[index];
  const subject = {
    ...current,
    code: String(payload.code).trim().toUpperCase(),
    status: payload.status,
    title: payload.title,
    description: payload.description,
    updatedAt: new Date().toISOString(),
  };
  store.subjects[index] = subject;
  writeStore(storePath, store);
  return { subject };
};

export const deleteSubject = (storePath, subjectId) => {
  if (subjectId === defaultSubjectId) {
    return { errors: ["No se puede eliminar la asignatura base. Puedes archivarla si no deseas mostrarla."] };
  }

  const store = readStore(storePath);
  const nextSubjects = store.subjects.filter((subject) => subject.id !== subjectId);
  if (nextSubjects.length === store.subjects.length) return { notFound: true };

  store.subjects = nextSubjects;
  writeStore(storePath, store);
  return { ok: true };
};
