import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import AmbienceSelector from "./AmbienceSelector";
import type { Ambience, JournalEntry } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  onEntryCreated: (entry: JournalEntry) => void;
}

export default function JournalForm({ onEntryCreated }: Props) {
  const [text, setText] = useState("");
  const [ambience, setAmbience] = useState<Ambience | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !ambience) {
      toast.error("Please write something and select an ambience.");
      return;
    }
    setLoading(true);
    try {
      // Call analyze edge function
      const { data, error } = await supabase.functions.invoke("analyze-journal", {
        body: { text: text.trim(), ambience },
      });
      if (error) throw error;
      onEntryCreated(data.entry as JournalEntry);
      setText("");
      setAmbience(null);
      toast.success("Journal entry saved & analyzed!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Choose your ambience
        </label>
        <AmbienceSelector value={ambience} onChange={setAmbience} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Your journal entry
        </label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How are you feeling today? Describe the nature around you..."
          className="min-h-[160px] resize-none rounded-xl border-2 border-border bg-background p-4 text-base leading-relaxed placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-primary/20"
          maxLength={2000}
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">{text.length}/2000</p>
      </div>
      <Button
        type="submit"
        disabled={loading || !text.trim() || !ambience}
        className="w-full rounded-xl bg-primary py-3 text-base font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
        ) : (
          <><Send className="mr-2 h-4 w-4" /> Submit & Analyze</>
        )}
      </Button>
    </form>
  );
}
