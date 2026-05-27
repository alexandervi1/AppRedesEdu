# App Redes CCNA / CCNP Enterprise

Aplicacion local para estudiar redes con rutas separadas de **CCNA** y **CCNP Enterprise**. Incluye lecciones bilingues, labs guiados, quizzes, simulador de subnetting, entrenador de comandos Cisco y tutor IA local opcional.

## Caracteristicas

- Selector de ruta: CCNA o CCNP Enterprise.
- Ruta CCNA para fundamentos, switching, routing, wireless, seguridad LAN, VoIP, IPv6, subnetting y troubleshooting.
- Ruta CCNP Enterprise compacta basada en ENCOR + ENARSI:
  - ENCOR: arquitectura enterprise, switching avanzado, routing enterprise, wireless, virtualizacion, assurance, seguridad y automation/API.
  - ENARSI: EIGRP avanzado, OSPF avanzado, BGP, redistribucion, route-maps, PBR, IP SLA, VRF, GRE/VPN concepts, servicios y troubleshooting avanzado.
- Quizzes locales con minimo de 50 preguntas por modulo.
- Simulador de quiz con 25, 50 o todas las preguntas, temporizador y mezcla de preguntas/opciones.
- Labs guiados tipo Packet Tracer/EVE-NG/CML con topologia textual, tareas, comandos, verificacion y fallas comunes.
- Base de conocimiento local compartida entre CCNA y CCNP.
- Entrenador de comandos por dispositivo y modo de practica:
  - Reconocer
  - Escribir
  - Configurar
  - Diagnosticar
- Tutor IA local con Ollama, con fallback deterministico si la IA no esta disponible.

## Requisitos

- Node.js 20 o superior recomendado.
- npm.
- Ollama opcional, solo si quieres activar el tutor IA inteligente.

## Instalacion

```bash
npm install
```

## Ejecutar en desarrollo

Frontend:

```bash
npm run dev
```

Backend del tutor IA:

```bash
npm run dev:server
```

Abre la app en:

```text
http://127.0.0.1:5173/
```

API del backend local:

```text
http://127.0.0.1:5174/
```

## Scripts

```bash
npm run dev
```

Inicia Vite en modo desarrollo.

```bash
npm run dev:server
```

Inicia el backend Express del tutor IA con recarga.

```bash
npm run build
```

Compila TypeScript y genera el build de produccion en `dist/`.

```bash
npm run preview
```

Sirve el build de produccion localmente.

```bash
npm run start:server
```

Inicia el backend Express sin modo watch.

## IA local con Ollama

El backend usa por defecto:

```text
OLLAMA_MODEL=llama3.2:3b
```

Descarga el modelo:

```bash
ollama pull llama3.2:3b
```

Para cambiar puerto, host o modelo, crea un archivo `.env` basado en `.env.example`:

```text
PORT=5174
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=gemma3:12b
```

La app funciona sin Ollama usando feedback local. Para respuestas IA, debes tener Ollama activo y ejecutar el backend.

## Base de conocimiento

La base local esta en:

```text
src/data/knowledgeBase.json
```

Incluye entradas de CCNA y contenido local CCNP Enterprise para ENCOR + ENARSI. El backend la carga al iniciar y la usa para contextualizar el tutor IA en:

```text
POST /api/ai/tutor
```

Tambien expone un resumen en:

```text
GET /api/knowledge
```

## Estructura principal

```text
src/App.tsx                  UI principal y selector de rutas
src/data/course.ts           Modulos CCNA
src/data/ccnpCourse.ts       Modulos CCNP Enterprise
src/data/tracks.ts           Registro de rutas CCNA/CCNP
src/data/commands.ts         Entrenador de comandos
src/data/knowledgeBase.json  Base de conocimiento local
src/lib/aiTutor.ts           Cliente del tutor IA
src/lib/progress.ts          Persistencia local de progreso
server/index.js              Backend Express para IA/Ollama
```

## Notas para GitHub

No subas `node_modules/`, `dist/`, logs ni archivos `.env` con configuracion local. El archivo `.env.example` si debe subirse como plantilla.

Antes de publicar o hacer pull request:

```bash
npm run build
```
