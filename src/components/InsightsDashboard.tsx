import type { JournalEntry, Ambience } from "@/lib/types";
import { TrendingUp, Heart, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";

function computeInsights(entries: JournalEntry[]) {
  const emotions: Record<string, number> = {};
  const ambiences: Record<string, number> = {};

  entries.forEach((e) => {
    if (e.analysis?.emotion) {
      const em = e.analysis.emotion.toLowerCase();
      emotions[em] = (emotions[em] || 0) + 1;
    }
    ambiences[e.ambience] = (ambiences[e.ambience] || 0) + 1;
  });

  const topEmotion = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0];
  const topAmbience = Object.entries(ambiences).sort((a, b) => b[1] - a[1])[0];

  return {
    topEmotion: topEmotion?.[0] || "—",
    topEmotionCount: topEmotion?.[1] || 0,
    topAmbience: (topAmbience?.[0] as Ambience) || "forest",
    topAmbienceCount: topAmbience?.[1] || 0,
    total: entries.length,
  };
}

const statCard = "rounded-xl border-2 border-border bg-card p-5 text-center";

export default function InsightsDashboard({ entries }: { entries: JournalEntry[] }) {
  const ins = computeInsights(entries);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
        <TrendingUp className="mx-auto mb-3 h-8 w-8 opacity-40" />
        <p className="font-display text-lg">No insights yet</p>
        <p className="text-sm">Submit your first journal entry to see insights here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className={cn(statCard)} style={{ boxShadow: "var(--shadow-soft)" }}>
        <Heart className="mx-auto mb-2 h-6 w-6 text-accent" />
        <p className="text-2xl font-display font-bold capitalize">{ins.topEmotion}</p>
        <p className="text-xs text-muted-foreground mt-1">Top Emotion ({ins.topEmotionCount}×)</p>
      </div>
      <div className={cn(statCard)} style={{ boxShadow: "var(--shadow-soft)" }}>
        <TreePine className="mx-auto mb-2 h-6 w-6 text-forest" />
        <p className="text-2xl font-display font-bold capitalize">{ins.topAmbience}</p>
        <p className="text-xs text-muted-foreground mt-1">Top Ambience ({ins.topAmbienceCount}×)</p>
      </div>
      <div className={cn(statCard)} style={{ boxShadow: "var(--shadow-soft)" }}>
        <TrendingUp className="mx-auto mb-2 h-6 w-6 text-ocean" />
        <p className="text-2xl font-display font-bold">{ins.total}</p>
        <p className="text-xs text-muted-foreground mt-1">Total Entries</p>
      </div>
    </div>
  );
}
