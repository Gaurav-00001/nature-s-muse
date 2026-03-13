# ArvyaX — Architecture Document

## System Overview

ArvyaX is an AI-assisted nature journal where users log entries tagged with a nature ambience (Forest, Ocean, Mountain). An LLM analyzes each entry's emotional content, returning structured insights (emotion, keywords, summary). The system uses React + Tailwind on the frontend, Supabase (PostgreSQL + Edge Functions) on the backend, and the Lovable AI Gateway for LLM access.

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React SPA  │─────▶│  Edge Functions   │─────▶│  Lovable AI     │
│  (Vite)     │      │  (Deno/Supabase)  │      │  Gateway (LLM)  │
└─────────────┘      └────────┬─────────┘      └─────────────────┘
                              │
                     ┌────────▼─────────┐
                     │   PostgreSQL      │
                     │   (Supabase)      │
                     └──────────────────┘
```

## Database Schema

```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  ambience TEXT NOT NULL CHECK (ambience IN ('forest', 'ocean', 'mountain')),
  text TEXT NOT NULL,
  analysis JSONB,            -- { emotion, keywords[], summary }
  text_hash TEXT,            -- SHA-256 of text for cache dedup
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_journal_user ON journal_entries(user_id);
CREATE INDEX idx_journal_created ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_hash ON journal_entries(text_hash);
CREATE INDEX idx_journal_analysis ON journal_entries USING GIN (analysis);
```

## API Endpoints (Edge Functions)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/functions/v1/analyze-journal` | Submit entry, analyze with LLM, store |
| GET | `/rest/v1/journal_entries` | Fetch entries (via Supabase client) |

## LLM Integration

- **Provider**: Lovable AI Gateway (Google Gemini)
- **System Prompt**: Strict JSON output with emotion, keywords, summary
- **Caching**: SHA-256 hash of input text; if a recent entry (< 24h) has the same hash, reuse analysis
- **Cost Control**: Tool calling for structured output instead of free-form JSON parsing

---

## Scaling to 100k Users

### Load Balancing
- Supabase Edge Functions auto-scale horizontally via Deno Deploy
- Frontend served via CDN (Lovable's built-in hosting)
- Connection pooling via Supabase's PgBouncer (built-in)

### Database Indexing
- B-tree indexes on `user_id`, `created_at`, `text_hash`
- GIN index on `analysis` JSONB for full-text insight queries
- Partition `journal_entries` by `created_at` (monthly) at >10M rows
- Read replicas for dashboard/insight queries

### Caching Strategy
- Application-level LLM cache via `text_hash` (avoids duplicate API calls)
- Redis/Upstash for hot query caching (top emotions, ambience counts)
- CDN caching for static assets (already handled)

---

## Reducing LLM Costs

### 1. Response Caching
SHA-256 hash deduplication prevents re-analyzing identical text. At scale, this can reduce LLM calls by 15-30%.

### 2. Prompt Compression
- System prompt is minimal and static (not repeated per request)
- Use tool calling / structured output mode instead of asking for JSON in prose
- Strip unnecessary whitespace from user input before sending

### 3. Batching
- For bulk imports: queue entries and batch-analyze in groups of 5-10
- Use smaller/faster models (Gemini Flash) for simple entries, reserve Pro for complex analysis

### 4. Model Tiering
| Entry Length | Model | Est. Cost/1K |
|-------------|-------|-------------|
| < 200 chars | gemini-2.5-flash-lite | ~$0.002 |
| 200-1000 chars | gemini-2.5-flash | ~$0.008 |
| > 1000 chars | gemini-2.5-pro | ~$0.025 |

---

## Protecting Sensitive Data

### Encryption at Rest
- Supabase PostgreSQL encrypts data at rest (AES-256) by default
- File storage uses server-side encryption

### PII Scrubbing
- Before sending text to the LLM, scrub potential PII:
  - Email addresses (regex)
  - Phone numbers (regex)
  - Names (optional NER pass)
- Store scrubbed version in `analysis` metadata
- Original text stays encrypted in the database

### Access Control
- Row Level Security (RLS) ensures users only see their own entries
- Edge Functions validate auth tokens before processing
- API keys stored as Supabase secrets (never in client code)

### Data Retention
- Allow users to delete entries (hard delete with cascade)
- Implement 90-day auto-archive for inactive accounts
- GDPR-compliant data export endpoint

---

## Future Enhancements
- **Auth**: Add Supabase Auth for real user accounts
- **Real-time**: Supabase Realtime for live entry updates
- **Mood Trends**: Time-series charts of emotional patterns
- **Nature Sounds**: Ambient audio matched to selected ambience
- **Mobile**: PWA support with offline journaling
