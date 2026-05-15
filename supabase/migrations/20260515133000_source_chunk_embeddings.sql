alter table public.source_document_chunks
  add column if not exists embedding jsonb,
  add column if not exists embedding_model text,
  add column if not exists embedded_at timestamptz;