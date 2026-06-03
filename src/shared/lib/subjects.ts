import { SubjectConfig } from "@shared/types";

export type SubjectPayload = {
  code: string;
  status: SubjectConfig["status"];
  title: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
};

const parseApiError = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (Array.isArray(data.errors)) return data.errors.join(" ");
  return data.error ?? "No se pudo completar la operacion.";
};

const readSubjectsResponse = async (response: Response): Promise<SubjectConfig[]> => {
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = await response.json();
  return Array.isArray(data.subjects) ? data.subjects : [];
};

export const listSubjects = async (): Promise<SubjectConfig[]> => {
  const response = await fetch("/api/subjects");
  return readSubjectsResponse(response);
};

export const listTeacherSubjects = async (): Promise<SubjectConfig[]> => {
  const response = await fetch("/api/teacher/subjects");
  return readSubjectsResponse(response);
};

export const createSubject = async (payload: SubjectPayload): Promise<SubjectConfig> => {
  const response = await fetch("/api/teacher/subjects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
};

export const updateSubject = async (subjectId: string, payload: SubjectPayload): Promise<SubjectConfig> => {
  const response = await fetch(`/api/teacher/subjects/${subjectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
};

export const deleteSubject = async (subjectId: string): Promise<void> => {
  const response = await fetch(`/api/teacher/subjects/${subjectId}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await parseApiError(response));
};
