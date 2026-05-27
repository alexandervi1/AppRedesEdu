import { CourseTrack } from "../types";
import { ccnpCourseModules } from "./ccnpCourse";
import { courseModules } from "./course";

export const courseTracks = {
  ccna: {
    id: "ccna" as CourseTrack,
    label: { es: "CCNA", en: "CCNA" },
    title: { es: "Redes CCNA", en: "CCNA Networks" },
    routeLabel: { es: "Ruta CCNA", en: "CCNA path" },
    subtitle: {
      es: "Ruta práctica para Redes 1, Redes 2 y fundamentos CCNA.",
      en: "Practical path for Networking 1, Networking 2, and CCNA fundamentals.",
    },
    modules: courseModules,
  },
  ccnp: {
    id: "ccnp" as CourseTrack,
    label: { es: "CCNP Enterprise", en: "CCNP Enterprise" },
    title: { es: "CCNP Enterprise", en: "CCNP Enterprise" },
    routeLabel: { es: "Ruta CCNP Enterprise", en: "CCNP Enterprise path" },
    subtitle: {
      es: "Ruta compacta ENCOR + ENARSI con labs guiados, quizzes y comandos avanzados.",
      en: "Compact ENCOR + ENARSI path with guided labs, quizzes, and advanced commands.",
    },
    modules: ccnpCourseModules,
  },
};

export const trackList = [courseTracks.ccna, courseTracks.ccnp];
