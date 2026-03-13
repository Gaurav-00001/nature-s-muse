import { useState, useEffect } from "react";
import JournalForm from "@/components/JournalForm";
import AnalysisCard from "@/components/AnalysisCard";
import InsightsDashboard from "@/components/InsightsDashboard";
import type { JournalEntry } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { Leaf } from "lucide-react";

export default function Index() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setEntries(data as unknown as JournalEntry[]);
  };

  const handleNewEntry = (entry: JournalEntry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-foreground">ArvyaX</h1>
            <p className="text-xs text-muted-foreground">AI-Assisted Nature Journal</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <h2 className="mb-4 font-display text-lg font-semibold text-foreground">New Entry</h2>
              <div className="rounded-2xl border-2 border-border bg-card p-6" style={{ boxShadow: "var(--shadow-elevated)" }}>
                <JournalForm onEntryCreated={handleNewEntry} />
              </div>
            </div>
          </div>

          {/* Right: Dashboard + Entries */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Insights</h2>
              <InsightsDashboard entries={entries} />
            </div>
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Recent Entries</h2>
              <div className="space-y-4">
                {entries.map((e) => (
                  <AnalysisCard key={e.id} entry={e} />
                ))}
                {entries.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Your journal entries will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
