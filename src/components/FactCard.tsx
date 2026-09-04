import { COPY } from "@/lib/copy";

/**
 * "Did you know?" card. Facts may contain newlines; paragraphs that start with
 * "Important:" render as a highlighted inset block. A leading "Did you know? "
 * is stripped because the eyebrow already says it.
 */
export default function FactCard({
  fact,
  rare = false,
  compact = false,
}: {
  fact: string;
  rare?: boolean;
  compact?: boolean;
}) {
  // The default eyebrow already says "Did you know?"; rare-fact cards keep the lead-in.
  const cleaned = rare ? fact : fact.replace(/^did you know\?\s*/i, "");
  const paragraphs = cleaned.split("\n").filter((p) => p.trim().length > 0);

  return (
    <div
      className={[
        "rounded-card border-2 p-3.5",
        rare ? "border-violet-edge bg-lavender text-ink" : "border-sky bg-sky text-ink-sky",
        compact ? "p-3" : "",
      ].join(" ")}
    >
      <p className={`eyebrow mb-1.5 ${rare ? "text-ink" : "text-ink-sky"}`}>
        {rare ? COPY.feedback.rareFactEyebrow : COPY.feedback.factEyebrow}
      </p>
      <div className="space-y-2 text-body-lg font-semibold">
        {paragraphs.map((p, i) => {
          const important = /^important:/i.test(p);
          if (important) {
            return (
              <div
                key={i}
                className="rounded-chip border-2 border-ink/20 bg-lemon px-3 py-2 text-ink-lemon"
              >
                <span className="eyebrow mr-1 text-ink-lemon">{COPY.feedback.importantLabel}</span>
                <span>{p.replace(/^important:\s*/i, "")}</span>
              </div>
            );
          }
          return (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          );
        })}
      </div>
    </div>
  );
}
