import type { JournalEntry } from "@/lib/types";
import { Trees, Waves, Mountain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ambienceIcons = { forest: Trees, ocean: Waves, mountain: Mountain };
const ambienceBg = {
  forest: "bg-forest-light border-forest/20",
  ocean: "bg-ocean-light border-ocean/20",
  mountain: "bg-mountain-light border-mountain/20",
};

export default function AnalysisCard({ entry }: { entry: JournalEntry }) {
  const Icon = ambienceIcons[entry.ambience];
  const analysis = entry.analysis;

  return (
    <div className={cn("rounded-xl border-2 p-5 transition-all", ambienceBg[entry.ambience])} style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {entry.ambience}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-foreground/80 line-clamp-3">{entry.text}</p>
      {analysis && (
        <div className="space-y-3 border-t border-border/50 pt-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-display font-semibold capitalize">{analysis.emotion}</span>
          </div>
          <p className="text-xs text-muted-foreground italic">{analysis.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.keywords.map((kw) => (
              <span key={kw} className="rounded-full bg-background/60 px-2.5 py-0.5 text-xs font-medium text-foreground/70">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
