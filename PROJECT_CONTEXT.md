# AppRedes Project Context

Documento de contexto para futuras sesiones de trabajo en este repositorio.

## Resumen

AppRedes es una aplicacion web local para estudiar redes con rutas CCNA y CCNP Enterprise. Incluye lecciones bilingues, quizzes, laboratorio de subnetting, base de conocimiento, entrenador de comandos Cisco y generacion de preguntas con IA apoyada por Ollama.

La aplicacion esta dividida en:

- Frontend SPA: React + TypeScript + Vite.
- Backend local: Express para endpoints de IA local, contenido editable y acceso a Ollama.
- Datos academicos: archivos TypeScript/JSON en `src/data`.
- Persistencia local: `localStorage` para progreso del usuario.

## Stack

- Node.js recomendado: 20.x o superior.
- Package manager: npm.
- Frontend: React 19, ReactDOM, TypeScript, Vite.
- Iconos: `lucide-react`.
- Backend: Express 5, CORS, dotenv.
- IA local opcional: Ollama, por defecto `llama3.2:3b`.

## Comandos

```bash
npm install
npm run dev
npm run dev:server
npm run build
npm run preview
npm run start:server
```

URLs en desarrollo:

- Frontend Vite: `http://127.0.0.1:5173/`
- Backend Express: `http://127.0.0.1:5174/`
- Proxy Vite: `/api` -> `http://127.0.0.1:5174`

Verificacion conocida:

- `npm run build` pasa correctamente al momento de crear este documento.

## Estructura Principal

```text
server/
  index.js
  subjectStore.js
  teacherContentStore.js
data/
  subjects.json
  teacherContent.json
src/
  main.tsx
  app/
    App.tsx
    i18n.ts
  data/
    course.ts
    ccnpCourse.ts
    commands.ts
    knowledgeBase.json
    quizExpansion.ts
    tracks.ts
  features/
    about/
    commands/
    dashboard/
    knowledge/
    lessons/
    quiz/
    student/
    subnetting/
    teacher/
  shared/
    types.ts
    lib/
      aiQuiz.ts
      progress.ts
      subjects.ts
      subnetting.ts
    ui/
      CopyableCode.tsx
  styles/
    global.css
```

## Frontend

`src/main.tsx` monta React en `#root` y carga `src/styles/global.css`.

`src/app/App.tsx` concentra la mayoria de la UI y el estado principal. Vistas internas:

- `dashboard`
- `lesson`
- `quiz`
- `subnetting`
- `knowledge`
- `commands`
- `teacher-content`
- `teacher`
- `about`

Estado principal en `App`:

- `locale`: idioma `es` o `en`.
- `progress`: progreso cargado desde `localStorage`.
- `view`: vista activa.
- `activeTrackId`: ruta activa, `ccna` o `ccnp`.
- `activeModuleId`: modulo activo.
- `activeLessonId`: leccion activa.

Componentes principales definidos en `src/app/App.tsx`:

- `src/features/dashboard/Dashboard.tsx`
- `src/features/knowledge/KnowledgeBaseView.tsx`
- `src/features/lessons/LessonView.tsx`
- `src/features/quiz/QuizView.tsx`
- `src/features/student/TeacherContentView.tsx`
- `src/features/subnetting/SubnettingLab.tsx`
- `src/features/commands/CommandTrainer.tsx`
- `src/features/about/AboutView.tsx`
- `src/features/teacher/TeacherDashboard.tsx`

Componentes UI reutilizables viven en `src/shared/ui`.

Las cadenas UI bilingues estan en `src/app/i18n.ts` como `appText`.

## Datos Del Curso

`src/data/tracks.ts` registra las rutas disponibles y conecta cada ruta con sus modulos:

- `ccna`
- `ccnp`

`src/data/course.ts` contiene los modulos CCNA. Exporta `courseModules` y usa `ensureMinimumQuizSize(module, 50)` para expandir quizzes.

`src/data/ccnpCourse.ts` contiene los modulos CCNP Enterprise, generados desde semillas (`seeds`) con helper de texto bilingue y quizzes.

`src/data/commands.ts` contiene categorias de dispositivo, temas y retos del entrenador CLI Cisco.

`src/data/knowledgeBase.json` contiene fuentes, entradas de conocimiento, tags, resumenes, comandos relacionados y referencias.

`src/data/quizExpansion.ts` se usa para ampliar bancos de preguntas hasta un minimo configurado.

## Tipos

`src/shared/types.ts` define los contratos principales:

- `Locale`
- `BilingualText`
- `Difficulty`
- `CourseTrack`
- `LessonLab`
- `Lesson`
- `QuizQuestion`
- `CourseModule`
- `ProgressState`
- `SubnetExercise`
- `SubnetResult`

Cuando se agreguen datos nuevos, mantener estos contratos para evitar errores con `strict: true`.

## Librerias Locales

`src/shared/lib/progress.ts`

- Clave de storage: `app-redes-progress`.
- Funciones: `defaultProgress`, `loadProgress`, `saveProgress`, `markLessonComplete`, `saveQuizScore`, `recordCommandAttempt`.
- Los scores de quiz se guardan por modulo y conservan el mejor puntaje.

`src/shared/lib/subnetting.ts`

- Contiene ejercicios predefinidos.
- Convierte IPv4 a numero y viceversa.
- Calcula direccion de subred, broadcast, primer/ultimo host, hosts usables y cantidad de subredes.
- Valida IPs con `isValidIp`.

`src/shared/lib/aiQuiz.ts`

- Cliente frontend para `/api/ai/quiz-questions`.
- Permite generar preguntas adicionales desde la base de conocimiento del modulo.

## Backend IA

`server/index.js` levanta Express en `127.0.0.1` y puerto `PORT` o `5174`.

Variables opcionales:

```env
PORT=5174
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
```

Endpoints:

- `GET /api/ai/status`: revisa disponibilidad de Ollama y modelos instalados.
- `GET /api/knowledge`: devuelve version, fuentes y resumenes de entradas de conocimiento.
- `GET /api/subjects`: lista asignaturas activas para el alumno.
- `GET /api/teacher/subjects`: lista asignaturas para administracion docente.
- `POST /api/teacher/subjects`: crea una asignatura.
- `PUT /api/teacher/subjects/:id`: actualiza una asignatura.
- `DELETE /api/teacher/subjects/:id`: elimina una asignatura no base.
- `GET /api/teacher/content`: lista contenido cargado desde el panel docente.
- `GET /api/student/teacher-content`: lista solo contenido docente publicado para el alumno.
- `POST /api/teacher/content`: crea contenido docente con validacion educativa minima.
- `PUT /api/teacher/content/:id`: actualiza contenido docente.
- `DELETE /api/teacher/content/:id`: elimina contenido docente.
- `POST /api/ai/quiz-questions`: genera preguntas de quiz desde la base de conocimiento con Ollama o fallback local.

El backend carga `src/data/knowledgeBase.json` directamente desde disco.

Hay validaciones para evitar que la IA revele el comando esperado en retos generados.

## Estilos

`src/styles/global.css` contiene el sistema visual completo.

Caracteristicas:

- Variables CSS en `:root`.
- Paleta base clara con sidebar oscuro.
- Color primario HSL basado en teal.
- Layout principal con sidebar y workspace.
- Estilos para dashboard, tarjetas, quizzes, subnetting, command trainer y responsive.

Si se modifica UI, revisar estilos existentes antes de crear clases nuevas.

## Patrones De Cambio Frecuentes

Agregar una leccion:

1. Editar `src/data/course.ts` o `src/data/ccnpCourse.ts`.
2. Mantener `Lesson` con textos `es/en`.
3. Asociar `knowledgeEntryId`.
4. Incluir `sourceRefs`.
5. Verificar que el modulo tenga quiz.

Agregar preguntas:

1. Editar el `quiz` del modulo o `quizExpansion.ts`.
2. Mantener `correctIndex`.
3. Cada opcion debe ser `BilingualText`.
4. Incluir explicacion bilingue.

Agregar comandos CLI:

1. Editar `src/data/commands.ts`.
2. Mantener tema, dispositivo, modo CLI, comandos y reto.
3. Validar que el comando esperado no sea ambiguo.
4. Revisar feedback deterministico en `CommandTrainer` si cambia la logica de evaluacion.

Cambiar generacion de preguntas con IA:

1. Frontend: `src/shared/lib/aiQuiz.ts` y `src/features/quiz/QuizView.tsx`.
2. Backend: `server/index.js`.
3. Mantener fallback local para que la app funcione sin Ollama.

Cambiar progreso:

1. Editar `src/shared/types.ts` si cambia `ProgressState`.
2. Editar `src/shared/lib/progress.ts` para migracion/carga tolerante.
3. Evitar romper progreso existente en `localStorage`.

## Verificacion Recomendada

Antes de cerrar cambios:

```bash
npm run build
```

Para probar manualmente:

```bash
npm run dev
npm run dev:server
```

Luego abrir:

```text
http://127.0.0.1:5173/
```

Flujos a revisar cuando se toque UI o datos:

- Cambiar entre CCNA y CCNP.
- Abrir una leccion y marcarla completa.
- Iniciar y finalizar un quiz.
- Resolver subnetting.
- Buscar en base de conocimiento.
- Probar entrenador de comandos en modos reconocer/escribir/configurar/diagnosticar.
- Probar generacion de preguntas con Ollama apagado y encendido si aplica.

## Estado Del Repositorio Al Crear Este Documento

- Git estaba limpio.
- `npm run build` paso correctamente.
- La estructura actual usa aliases de imports: `@app`, `@data`, `@features`, `@shared` y `@styles`.

Nota operativa: en esta maquina el sandbox de Windows puede fallar al iniciar comandos con `windows sandbox: spawn setup refresh`. Si ocurre, solicitar ejecucion fuera del sandbox con justificacion puntual.
