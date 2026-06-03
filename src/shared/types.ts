export type Locale = "es" | "en";

export type BilingualText = {
  es: string;
  en: string;
};

export type Difficulty = "Inicial" | "Intermedio" | "Avanzado";

export type CourseTrack = "ccna" | "ccnp";

export type SubjectConfig = {
  id: string;
  code: string;
  status: "active" | "archived";
  title: BilingualText;
  description: BilingualText;
  createdAt: string;
  updatedAt: string;
};

export type TeacherContentStatus = "draft" | "published";

export type TeacherContentType = "module" | "lesson" | "quiz" | "command" | "knowledge";

export type TeacherContentItem = {
  id: string;
  subjectId: string;
  type: TeacherContentType;
  status: TeacherContentStatus;
  title: BilingualText;
  summary: BilingualText;
  body: BilingualText;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type LessonLab = {
  topology: BilingualText;
  tasks: BilingualText[];
  commands: string[];
  verification: string[];
  commonFailures: BilingualText[];
};

export type Lesson = {
  id: string;
  title: BilingualText;
  objective: BilingualText;
  summary: BilingualText;
  keyTerms: BilingualText[];
  example: BilingualText;
  practice: BilingualText;
  lab?: LessonLab;
  knowledgeEntryId: string;
  sourceRefs: Array<{ sourceId: string; pages: number[] }>;
};

export type QuizQuestion = {
  id: string;
  prompt: BilingualText;
  options: BilingualText[];
  correctIndex: number;
  explanation: BilingualText;
};

export type CourseModule = {
  id: string;
  title: BilingualText;
  description: BilingualText;
  difficulty: Difficulty;
  estimatedMinutes: number;
  lessons: Lesson[];
  quiz: QuizQuestion[];
};

export type ProgressState = {
  completedLessons: string[];
  quizScores: Record<string, number>;
  commandAttempts: Record<
    string,
    {
      attempts: number;
      correct: number;
      lastAnswer: string;
      lastAccess: string;
    }
  >;
  studyStreak: number;
  lastAccess: string;
};

export type SubnetExercise = {
  baseNetwork: string;
  prefix: number;
  newPrefix: number;
  targetSubnet: number;
};

export type SubnetResult = {
  subnetAddress: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  usableHosts: number;
  totalSubnets: number;
};
