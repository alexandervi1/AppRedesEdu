import { useState } from "react";
import { BookOpen, Database, FileText, Search } from "lucide-react";
import knowledgeBase from "@data/knowledgeBase.json";
import { appText } from "@app/i18n";
import { CopyableCode } from "@shared/ui/CopyableCode";
import { Locale } from "@shared/types";

type KnowledgeEntry = (typeof knowledgeBase.entries)[number];
export function KnowledgeBaseView({ locale, onBack }: { locale: Locale; onBack: () => void }) {
  const t = appText[locale];
  const [activeEntryId, setActiveEntryId] = useState(knowledgeBase.entries[0].id);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const entries = knowledgeBase.entries.filter((entry) => {
    if (!normalizedQuery) return true;
    return [entry.title, entry.summary, ...entry.tags, ...entry.facts, ...entry.commands]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });
  const activeEntry: KnowledgeEntry =
    entries.find((entry) => entry.id === activeEntryId) ?? entries[0] ?? knowledgeBase.entries[0];

  const sourceLabel = (sourceId: string) => knowledgeBase.sources.find((source) => source.id === sourceId)?.file ?? sourceId;

  return (
    <article className="content-surface knowledge-surface">
      <button className="back-button" onClick={onBack}>
        {t.back}
      </button>
      <span className="eyebrow">{t.knowledge}</span>
      <h2>{t.knowledgeTitle}</h2>
      <p className="lead">
        {locale === "es"
          ? `Material local estructurado desde ${knowledgeBase.sources.length} PDFs de la carpeta Materia_Redes.`
          : `Local material structured from ${knowledgeBase.sources.length} PDFs in the Materia_Redes folder.`}
      </p>

      <section className="knowledge-summary-container">
        <div className="summary-stats">
          <div className="stat-pill">
            <span className="stat-pill-num">{knowledgeBase.entries.length}</span>
            <span className="stat-pill-label">{t.topics}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-num">{knowledgeBase.sources.length}</span>
            <span className="stat-pill-label">{t.sources}</span>
          </div>
        </div>
        
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            value={query}
            placeholder={locale === "es" ? "Buscar por IPv6, VLAN, OSPF, WLAN..." : "Search by IPv6, VLAN, OSPF, WLAN..."}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              const nextEntry = knowledgeBase.entries.find((entry) =>
                [entry.title, entry.summary, ...entry.tags, ...entry.facts, ...entry.commands]
                  .join(" ")
                  .toLowerCase()
                  .includes(value.trim().toLowerCase()),
              );
              if (nextEntry) setActiveEntryId(nextEntry.id);
            }}
          />
        </div>
      </section>

      <div className="knowledge-layout">
        <nav className="knowledge-topic-list" aria-label={t.knowledge}>
          {entries.map((entry) => (
            <button
              key={entry.id}
              className={entry.id === activeEntry.id ? "knowledge-topic active" : "knowledge-topic"}
              onClick={() => setActiveEntryId(entry.id)}
            >
              <Database size={16} />
              <span>{entry.title}</span>
            </button>
          ))}
          {entries.length === 0 && (
            <p className="empty-state">{locale === "es" ? "Sin resultados." : "No results."}</p>
          )}
        </nav>

        <section className="knowledge-panel">
          {activeEntry ? (
            <>
              <div className="knowledge-heading">
                <h3>{activeEntry.title}</h3>
                <p>{activeEntry.summary}</p>
              </div>

              <div className="tag-list">
                {activeEntry.tags.map((tag) => (
                  <span key={tag} className="tech-badge" data-tag={tag.toLowerCase()}>{tag}</span>
                ))}
              </div>

              <section className="lesson-section">
                <h3>{t.facts}</h3>
                <div className="fact-card-list">
                  {activeEntry.facts.map((fact, index) => (
                    <div className="fact-card" key={`${activeEntry.id}-fact-${index}`}>
                      <div className="fact-marker">
                        <span>{index + 1}</span>
                      </div>
                      <p>{fact}</p>
                    </div>
                  ))}
                </div>
              </section>

              {activeEntry.commands && activeEntry.commands.length > 0 && (
                <section className="lesson-section">
                  <h3>{t.relatedCommands}</h3>
                  <div className="knowledge-command-list-vertical">
                    {activeEntry.commands.map((command) => (
                      <CopyableCode key={command} code={command} />
                    ))}
                  </div>
                </section>
              )}

              <section className="lesson-section">
                <h3>{t.sources}</h3>
                <div className="source-cards-grid">
                  {activeEntry.sourceRefs.map((ref, index) => (
                    <div className="source-card" key={`${ref.sourceId}-${index}`}>
                      <div className="source-card-icon">
                        <FileText size={20} />
                      </div>
                      <div className="source-card-info">
                        <strong>{sourceLabel(ref.sourceId)}</strong>
                        <span>
                          {t.sourcePages} {ref.pages.join(", ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <p className="empty-state">{locale === "es" ? "Selecciona un tema." : "Select a topic."}</p>
          )}
        </section>
      </div>
    </article>
  );
}

