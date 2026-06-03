# App Redes CCNA / CCNP Enterprise

Aplicación web local y moderna para estudiar redes con rutas independientes de **CCNA** y **CCNP Enterprise**. Incorpora lecciones bilingües, laboratorios guiados paso a paso, simuladores de exámenes, retos interactivos de subnetting, un entrenador de comandos Cisco por CLI y generación de preguntas con IA desde la base de conocimiento.

Esta versión cuenta con un **diseño visual premium unificado**, libre de duplicidades en menús y con el contenido del curso estructurado pedagógicamente en etapas progresivas de aprendizaje.

---

## 🚀 Características Principales

### 💻 Interfaz de Usuario Premium & Moderna
* **Diseño Visual de Alta Gama:** Interfaz renovada bajo un sistema de diseño con paleta de colores HSL cohesiva, tipografías elegantes (Inter), tarjetas interactivas que responden físicamente a los gestos del usuario (`translateY(-4px)` y sombras dinámicas 3D).
* **Navegación Unificada y Limpia:** Barra lateral de control integrada dividida por secciones funcionales (Dashboard, Práctica, Temas del Curso e Idioma). Se eliminaron todos los menús y botones redundantes de la cabecera.
* **Generación de Quizzes con IA:** Crea nuevas preguntas desde la base de conocimiento del módulo usando Ollama, con fallback local validado si la IA no está disponible.

### 📚 Agrupación Progresiva por Etapas de Aprendizaje
Los módulos del curso en el Panel de Control se clasifican y estructuran de forma secuencial para guiar al estudiante:
* **De Cero a Principiante:** Conceptos fundamentales, modelos de red OSI/TCP-IP, direccionamiento básico y configuraciones iniciales (Dificultad `Inicial`).
* **De Principiante a Profesional:** Enrutamiento dinámico (OSPF), VLANs, STP, redundancia y servicios fundamentales como NAT y DHCP (Dificultad `Intermedio`).
* **De Profesional a Experto:** Seguridad, túneles VPN avanzados, direccionamiento IPv6 complejo, automatización y diagnóstico de fallas (Dificultad `Avanzado`).

### 🛠️ Laboratorios, Quizzes y Herramientas Especiales
* **Laboratorios Tipo Packet Tracer:** Topología textual, tareas por pasos, guía de comandos, verificación y diagnóstico de fallas comunes.
* **Práctica de Subnetting:** Retos matemáticos dinámicos con generación aleatoria de subredes para verificar direcciones de red, primer/último host usable, broadcast y subredes posibles.
* **Entrenador de CLI Cisco:** Retos prácticos por dispositivo (Switch, Router, Firewall) con 4 modos de aprendizaje: *Reconocer*, *Escribir*, *Configurar* y *Diagnosticar*.
* **Simulador de Quizzes:** Configura exámenes o modo práctica con temporizador ajustable, mezcla de preguntas/respuestas y retroalimentación inmediata.

---

## 🛠️ Requisitos del Sistema

* **Node.js:** Versión 20.x o superior recomendada.
* **npm:** Gestor de paquetes incluido con Node.js.
* **Ollama (Opcional):** Si deseas habilitar generación de preguntas con IA de manera local.

---

## 🚀 Instalación y Configuración

1. **Clonar el repositorio o descargar el proyecto:**
   ```bash
   git clone https://github.com/alexandervi1/AppRedesEdu.git
   cd AppRedesEdu
   ```

2. **Instalar dependencias del proyecto:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno (Opcional):**
   Crea un archivo `.env` en la raíz del proyecto basado en `.env.example` si deseas cambiar el modelo o puerto del backend de Ollama:
   ```env
   PORT=5174
   OLLAMA_HOST=http://127.0.0.1:11434
   OLLAMA_MODEL=llama3.2:3b
   ```

---

## 💻 Ejecución en Desarrollo

La aplicación está dividida en un frontend SPA rápido (Vite) y un servidor backend ligero para las llamadas de IA local y contenido editable (Express).

* **Iniciar Frontend (Vite):**
  ```bash
  npm run dev
  ```
  Acceso en el navegador: 👉 `http://127.0.0.1:5173/`

* **Iniciar Servidor de IA Local (Express):**
  ```bash
  npm run dev:server
  ```
  Acceso a la API local: 👉 `http://127.0.0.1:5174/`

---

## 📦 Scripts Disponibles

* `npm run dev` - Inicia el entorno de desarrollo del frontend con Vite.
* `npm run dev:server` - Inicia el backend de Express con recarga en caliente para desarrollo.
* `npm run build` - Compila TypeScript y empaqueta los archivos listos para producción en `/dist`.
* `npm run preview` - Inicia un servidor de previsualización local para probar la compilación de producción.
* `npm run start:server` - Ejecuta el backend de Express en modo de producción.

---

## 🧠 Generación de Quizzes con Ollama

Por defecto, el backend local utiliza el modelo **llama3.2:3b** para generar preguntas desde la base de conocimiento. Puedes descargarlo en tu equipo ejecutando:
```bash
ollama pull llama3.2:3b
```
*Nota: Si no dispones de Ollama o la IA local está apagada, la aplicación continuará funcionando normalmente utilizando un generador determinístico local.*

---

## 📂 Estructura del Código

```text
├── server/
│   ├── index.js              # Servidor backend Express para IA / Ollama
│   ├── subjectStore.js       # Store JSON de asignaturas configurables
│   └── teacherContentStore.js # Store JSON del panel docente
├── data/
│   ├── subjects.json         # Configuración editable de asignaturas
│   └── teacherContent.json   # Contenido editable creado desde el panel docente
├── src/
│   ├── app/
│   │   ├── App.tsx           # Contenedor principal SPA, navegación y vistas
│   │   └── i18n.ts           # Textos bilingües de la interfaz
│   ├── data/
│   │   ├── course.ts         # Contenido del plan de estudios CCNA
│   │   ├── ccnpCourse.ts     # Contenido del plan de estudios CCNP Enterprise
│   │   ├── commands.ts       # Datos del Entrenador de Comandos
│   │   ├── knowledgeBase.json # Biblioteca de conocimiento compartido
│   │   └── tracks.ts         # Registro y definición de las rutas (tracks)
│   ├── features/
│   │   ├── about/            # Vista informativa
│   │   ├── commands/         # Entrenador de comandos Cisco
│   │   ├── dashboard/        # Panel de control
│   │   ├── knowledge/        # Base de conocimiento
│   │   ├── lessons/          # Vista de lecciones
│   │   ├── quiz/             # Simulador de quizzes
│   │   ├── student/          # Vista alumno de contenido docente publicado
│   │   ├── subnetting/       # Laboratorio de subnetting
│   │   └── teacher/          # Panel docente para cargar/corregir contenido
│   ├── shared/
│   │   ├── types.ts          # Declaración de tipos TypeScript compartidos
│   │   ├── lib/
│   │   │   ├── aiQuiz.ts     # Generador API de preguntas con IA
│   │   │   ├── progress.ts   # Gestor de progreso en LocalStorage
│   │   │   ├── subjects.ts   # Cliente API de asignaturas
│   │   │   └── subnetting.ts # Lógica matemática de subnetting
│   │   └── ui/
│   │       └── CopyableCode.tsx # Componente UI reutilizable
│   ├── main.tsx              # Punto de entrada de React
│   └── styles/
│       └── global.css        # Hoja de estilos globales y sistema HSL
├── package.json              # Configuración y dependencias
└── tsconfig.json             # Configuración del compilador TypeScript
```

---

## 📝 Contribuciones y Buenas Prácticas

* **Control de Versiones:** El proyecto está versionado con Git. No se deben subir las carpetas `node_modules/`, `dist/`, logs de fallas (`*.log`) ni archivos con contraseñas locales (`.env`).
* **Verificación de Tipado:** Antes de subir cualquier cambio al repositorio, ejecuta siempre la verificación y empaquetado del proyecto para asegurar cero errores de compilación:
  ```bash
  npm run build
  ```
