import fs from "node:fs";
import path from "node:path";
import { defaultSubjectId } from "./subjectStore.js";

const defaultStore = {
  version: 1,
  items: [],
};

const isRecord = (value) => value && typeof value === "object" && !Array.isArray(value);

const hasText = (value) => typeof value === "string" && value.trim().length > 0;

const ensureStoreFile = (storePath) => {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify(defaultStore, null, 2), "utf8");
  }
};

const readStore = (storePath) => {
  ensureStoreFile(storePath);
  const parsed = JSON.parse(fs.readFileSync(storePath, "utf8"));
  return {
    version: Number.isFinite(parsed.version) ? parsed.version : 1,
    items: Array.isArray(parsed.items)
      ? parsed.items.map((item) => ({ ...item, subjectId: item.subjectId || defaultSubjectId }))
      : [],
  };
};

const writeStore = (storePath, store) => {
  ensureStoreFile(storePath);
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
};

export const validateTeacherContent = (payload) => {
  const errors = [];
  const allowedTypes = new Set(["module", "lesson", "quiz", "command", "knowledge"]);
  const allowedStatuses = new Set(["draft", "published"]);

  if (!isRecord(payload)) {
    return ["El contenido debe ser un objeto valido."];
  }

  if (!allowedTypes.has(payload.type)) errors.push("Selecciona un tipo de contenido valido.");
  if (!allowedStatuses.has(payload.status)) errors.push("Selecciona un estado valido.");
  if (!hasText(payload.subjectId)) errors.push("Selecciona una asignatura para este contenido.");
  if (!isRecord(payload.title) || !hasText(payload.title.es) || !hasText(payload.title.en)) {
    errors.push("El titulo debe estar completo en espanol e ingles.");
  }
  if (!isRecord(payload.summary) || !hasText(payload.summary.es) || !hasText(payload.summary.en)) {
    errors.push("El resumen debe estar completo en espanol e ingles.");
  }
  if (!isRecord(payload.body) || !hasText(payload.body.es) || !hasText(payload.body.en)) {
    errors.push("El contenido educativo debe estar completo en espanol e ingles.");
  }

  return errors;
};

export const listTeacherContent = (storePath) => readStore(storePath).items;

export const createTeacherContent = (storePath, payload) => {
  const errors = validateTeacherContent(payload);
  if (errors.length) return { errors };

  const store = readStore(storePath);
  const now = new Date().toISOString();
  const item = {
    id: `teacher-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    subjectId: payload.subjectId || defaultSubjectId,
    type: payload.type,
    status: payload.status,
    title: payload.title,
    summary: payload.summary,
    body: payload.body,
    tags: Array.isArray(payload.tags) ? payload.tags.map(String).map((tag) => tag.trim()).filter(Boolean) : [],
    createdAt: now,
    updatedAt: now,
  };

  store.items.unshift(item);
  writeStore(storePath, store);
  return { item };
};

export const updateTeacherContent = (storePath, itemId, payload) => {
  const errors = validateTeacherContent(payload);
  if (errors.length) return { errors };

  const store = readStore(storePath);
  const index = store.items.findIndex((item) => item.id === itemId);
  if (index === -1) return { notFound: true };

  const current = store.items[index];
  const item = {
    ...current,
    subjectId: payload.subjectId || current.subjectId || defaultSubjectId,
    type: payload.type,
    status: payload.status,
    title: payload.title,
    summary: payload.summary,
    body: payload.body,
    tags: Array.isArray(payload.tags) ? payload.tags.map(String).map((tag) => tag.trim()).filter(Boolean) : [],
    updatedAt: new Date().toISOString(),
  };

  store.items[index] = item;
  writeStore(storePath, store);
  return { item };
};

export const deleteTeacherContent = (storePath, itemId) => {
  const store = readStore(storePath);
  const nextItems = store.items.filter((item) => item.id !== itemId);
  if (nextItems.length === store.items.length) return { notFound: true };

  store.items = nextItems;
  writeStore(storePath, store);
  return { ok: true };
};
