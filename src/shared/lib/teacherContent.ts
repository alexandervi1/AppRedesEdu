import { TeacherContentItem, TeacherContentStatus, TeacherContentType } from "@shared/types";

export type TeacherContentPayload = {
  subjectId: string;
  type: TeacherContentType;
  status: TeacherContentStatus;
  title: {
    es: string;
    en: string;
  };
  summary: {
    es: string;
    en: string;
  };
  body: {
    es: string;
    en: string;
  };
  tags: string[];
};

const parseApiError = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (Array.isArray(data.errors)) return data.errors.join(" ");
  return data.error ?? "No se pudo completar la operacion.";
};

export const listTeacherContent = async (): Promise<TeacherContentItem[]> => {
  const response = await fetch("/api/teacher/content");
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
};

export const listPublishedTeacherContent = async (): Promise<TeacherContentItem[]> => {
  const response = await fetch("/api/student/teacher-content");
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
};

export const createTeacherContent = async (payload: TeacherContentPayload): Promise<TeacherContentItem> => {
  const response = await fetch("/api/teacher/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
};

export const updateTeacherContent = async (
  itemId: string,
  payload: TeacherContentPayload,
): Promise<TeacherContentItem> => {
  const response = await fetch(`/api/teacher/content/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
};

export const deleteTeacherContent = async (itemId: string): Promise<void> => {
  const response = await fetch(`/api/teacher/content/${itemId}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await parseApiError(response));
};
