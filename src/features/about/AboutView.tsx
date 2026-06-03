import { BrainCircuit, Database, Info, Network, Router, TerminalSquare } from "lucide-react";
import { Locale } from "@shared/types";
export function AboutView({ locale, onBack }: { locale: Locale; onBack: () => void }) {
  const isEs = locale === "es";
  return (
    <article className="content-surface about-surface">
      <button className="back-button" onClick={onBack}>
        {isEs ? "Volver" : "Back"}
      </button>
      
      <span className="eyebrow">{isEs ? "Información del Proyecto" : "Project Information"}</span>
      <h2>{isEs ? "Acerca de App Redes" : "About App Redes"}</h2>
      
      <p className="lead">
        {isEs 
          ? "Una plataforma interactiva bilingüe diseñada para el dominio y preparación de las certificaciones Cisco CCNA y CCNP Enterprise."
          : "An interactive bilingual platform designed for mastering and preparing for the Cisco CCNA and CCNP Enterprise certifications."}
      </p>

      <section className="about-layout-grid">
        <div className="about-main-card">
          <h3>⚡ {isEs ? "Características del Sistema" : "System Features"}</h3>
          <ul className="about-feature-list" style={{ display: "grid", gap: "12px", paddingLeft: "20px", margin: "0" }}>
            <li>
              <strong>{isEs ? "Rutas Separadas:" : "Separate Tracks:"}</strong>{" "}
              {isEs 
                ? "Contenido modular especializado para CCNA (Fundamentos y Redes locales) y CCNP Enterprise (ENCOR + ENARSI)."
                : "Specialized modular content for CCNA (Foundations & Local networks) and CCNP Enterprise (ENCOR + ENARSI)."}
            </li>
            <li>
              <strong>{isEs ? "Laboratorios Prácticos:" : "Practical Labs:"}</strong>{" "}
              {isEs 
                ? "Simulación de comandos, topologías lógicas, verificación mediante comandos show y guía de resolución de fallas comunes."
                : "Command simulations, logical topologies, verification through show commands, and troubleshooting guides."}
            </li>
            <li>
              <strong>{isEs ? "Entrenador de CLI:" : "CLI Trainer:"}</strong>{" "}
              {isEs 
                ? "Práctica interactiva en terminal simulada para afianzar la sintaxis de comandos Cisco en 4 modos de estudio."
                : "Interactive terminal simulation to solidify Cisco command syntax in 4 distinct learning modes."}
            </li>
            <li>
              <strong>{isEs ? "Tutor de IA Local:" : "Local AI Tutor:"}</strong>{" "}
              {isEs 
                ? "Soporte interactivo de tutoría mediante modelos de IA ejecutados localmente con Ollama (como Llama 3.2)."
                : "Interactive tutoring support using AI models run locally with Ollama (such as Llama 3.2)."}
            </li>
          </ul>
        </div>

        <div className="about-tech-card" style={{ display: "grid", gap: "10px" }}>
          <h3>🛠️ {isEs ? "Stack Tecnológico" : "Tech Stack"}</h3>
          <div className="tech-badge-container" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <span className="tech-badge" data-tag="react">React 19</span>
            <span className="tech-badge" data-tag="typescript">TypeScript</span>
            <span className="tech-badge" data-tag="vite">Vite</span>
            <span className="tech-badge" data-tag="css">Vanilla CSS HSL</span>
            <span className="tech-badge" data-tag="express">Express API</span>
            <span className="tech-badge" data-tag="ollama">Ollama IA</span>
            <span className="tech-badge" data-tag="lucide">Lucide Icons</span>
          </div>
          <p style={{ marginTop: "16px", fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: "1.5", margin: "0" }}>
            {isEs 
              ? "Desarrollado con una arquitectura moderna Single Page Application (SPA), optimizada para una carga ultrarrápida, responsividad total y cero dependencias pesadas de frameworks."
              : "Developed with a modern Single Page Application (SPA) architecture, optimized for ultra-fast loading, full responsiveness, and zero bloated framework dependencies."}
          </p>
        </div>
      </section>

      <section className="about-creator-section" style={{ marginTop: "12px" }}>
        <div className="creator-card">
          <div className="creator-avatar">
            <Router size={32} />
          </div>
          <div className="creator-info">
            <h4 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: "700" }}>Alexander Villalva</h4>
            <p className="creator-title" style={{ margin: "0 0 8px", fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>{isEs ? "Desarrollador y Creador del Proyecto" : "Developer & Project Creator"}</p>
            <p className="creator-desc" style={{ margin: "0", fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
              {isEs 
                ? "Estudiante y apasionado de las redes de telecomunicaciones, la programación y la inteligencia artificial local. Creado con el fin de facilitar el aprendizaje práctico de CCNA/CCNP."
                : "Student and enthusiast of telecommunication networks, programming, and local artificial intelligence. Built with the purpose of simplifying hands-on CCNA/CCNP learning."}
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}

