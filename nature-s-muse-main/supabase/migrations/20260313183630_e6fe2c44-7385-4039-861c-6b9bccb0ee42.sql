-- Create journal_entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  ambience TEXT NOT NULL CHECK (ambience IN ('forest', 'ocean', 'mountain')),
  text TEXT NOT NULL,
  analysis JSONB,
  text_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_journal_user ON public.journal_entries(user_id);
CREATE INDEX idx_journal_created ON public.journal_entries(created_at DESC);
CREATE INDEX idx_journal_hash ON public.journal_entries(text_hash);

-- Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- For MVP: allow all operations (no auth yet)
CREATE POLICY "Allow all reads" ON public.journal_entries FOR SELECT USING (true);
CREATE POLICY "Allow all inserts" ON public.journal_entries FOR INSERT WITH CHECK (true);