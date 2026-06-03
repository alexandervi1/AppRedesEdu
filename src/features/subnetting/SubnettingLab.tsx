import { useMemo, useState } from "react";
import { ClipboardCheck, Network, RefreshCcw } from "lucide-react";
import { appText } from "@app/i18n";
import { getSubnetExercise, isValidIp, normalizeIp, solveSubnet } from "@shared/lib/subnetting";
import { Locale } from "@shared/types";
export function SubnettingLab({ locale, onBack }: { locale: Locale; onBack: () => void }) {
  const t = appText[locale];
  const [seed, setSeed] = useState(0);
  const [answers, setAnswers] = useState({
    subnetAddress: "",
    broadcastAddress: "",
    firstUsable: "",
    lastUsable: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const exercise = useMemo(() => getSubnetExercise(seed), [seed]);
  const result = useMemo(() => solveSubnet(exercise), [exercise]);

  const fields = [
    ["subnetAddress", t.subnetAddress],
    ["broadcastAddress", t.broadcastAddress],
    ["firstUsable", t.firstUsable],
    ["lastUsable", t.lastUsable],
  ] as const;

  const resetExercise = () => {
    setSeed((current) => current + 1);
    setAnswers({ subnetAddress: "", broadcastAddress: "", firstUsable: "", lastUsable: "" });
    setSubmitted(false);
  };

  return (
    <article className="content-surface">
      <button className="back-button" onClick={onBack}>
        {t.back}
      </button>
      <span className="eyebrow">{t.practice}</span>
      <h2>{t.practiceTitle}</h2>
      <p className="lead">
        {t.subnetPrompt}: {exercise.baseNetwork}/{exercise.prefix} → /{exercise.newPrefix}
      </p>

      <section className="subnet-layout">
        <div className="subnet-card">
          <h3>{t.subnetNumber}</h3>
          <strong>#{exercise.targetSubnet}</strong>
          <p>
            {t.totalSubnets}: {result.totalSubnets} · {t.usableHosts}: {result.usableHosts}
          </p>
        </div>

        <div className="subnet-form">
          {fields.map(([key, label]) => {
            const value = answers[key];
            const correct = normalizeIp(value) === result[key];
            const invalid = value.length > 0 && !isValidIp(value);
            return (
              <label key={key} className="input-row">
                <span>{label}</span>
                <input
                  value={value}
                  placeholder="192.168.10.0"
                  onChange={(event) => setAnswers((current) => ({ ...current, [key]: event.target.value }))}
                />
                {submitted && (
                  <small className={correct ? "answer-ok" : "answer-bad"}>
                    {correct ? t.correct : `${t.review}: ${result[key]}`}
                  </small>
                )}
                {!submitted && invalid && <small className="answer-bad">IP inválida</small>}
              </label>
            );
          })}
        </div>
      </section>

      <section className="lesson-section callout">
        <h3>{locale === "es" ? "Cómo pensarlo" : "How to reason it"}</h3>
        <p>
          {locale === "es"
            ? `El prefijo /${exercise.newPrefix} crea bloques de ${2 ** (32 - exercise.newPrefix)} direcciones. La subred #${exercise.targetSubnet} empieza al sumar ese bloque ${exercise.targetSubnet} veces desde la red base.`
            : `The /${exercise.newPrefix} prefix creates blocks of ${2 ** (32 - exercise.newPrefix)} addresses. Subnet #${exercise.targetSubnet} starts by adding that block ${exercise.targetSubnet} times from the base network.`}
        </p>
      </section>

      <div className="lesson-actions">
        <button className="primary-button" onClick={() => setSubmitted(true)}>
          <ClipboardCheck size={18} />
          {t.verify}
        </button>
        <button className="ghost-button" onClick={resetExercise}>
          <RefreshCcw size={18} />
          {t.newExercise}
        </button>
      </div>
    </article>
  );
}

