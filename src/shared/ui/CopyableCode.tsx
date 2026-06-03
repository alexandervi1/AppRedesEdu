import { useState } from "react";
export function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="copyable-code-block">
      <code>{code}</code>
      <button
        className={`copy-code-btn ${copied ? "copied" : ""}`}
        onClick={handleCopy}
        title={copied ? "¡Copiado!" : "Copiar comando"}
      >
        {copied ? "✓" : "❐"}
      </button>
    </div>
  );
}

