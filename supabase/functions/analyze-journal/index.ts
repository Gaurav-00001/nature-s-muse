import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, ambience } = await req.json();
    if (!text || !ambience) throw new Error("text and ambience are required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const textHash = await sha256(text);

    // Check cache: same text analyzed in last 24h
    const { data: cached } = await supabase
      .from("journal_entries")
      .select("analysis")
      .eq("text_hash", textHash)
      .not("analysis", "is", null)
      .gte("created_at", new Date(Date.now() - 86400000).toISOString())
      .limit(1)
      .single();

    let analysis;

    if (cached?.analysis) {
      console.log("Cache hit for text_hash:", textHash);
      analysis = cached.analysis;
    } else {
      // Call LLM
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are an emotion analysis AI for a nature journal app. Analyze the user's journal entry and identify their emotional state. You MUST use the provided tool to return your analysis.`,
            },
            {
              role: "user",
              content: `Ambience: ${ambience}\n\nJournal Entry:\n${text}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "analyze_emotion",
                description: "Return the emotional analysis of a journal entry",
                parameters: {
                  type: "object",
                  properties: {
                    emotion: {
                      type: "string",
                      description: "The primary emotion detected (e.g., peaceful, anxious, joyful, melancholic, grateful, hopeful)",
                    },
                    keywords: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 key themes or words from the entry",
                    },
                    summary: {
                      type: "string",
                      description: "A brief 1-2 sentence summary of the emotional state",
                    },
                  },
                  required: ["emotion", "keywords", "summary"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "analyze_emotion" } },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI gateway error:", response.status, errText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No tool call in AI response");
      analysis = JSON.parse(toolCall.function.arguments);
    }

    // Insert entry
    const { data: entry, error: insertError } = await supabase
      .from("journal_entries")
      .insert({
        user_id: "anonymous",
        ambience,
        text,
        analysis,
        text_hash: textHash,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ entry }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-journal error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
