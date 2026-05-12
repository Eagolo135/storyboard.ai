create extension if not exists pgcrypto;

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  owner_clerk_id text not null,
  title text not null,
  summary text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stories enable row level security;

create index if not exists stories_owner_updated_idx
  on public.stories (owner_clerk_id, updated_at desc);

create table if not exists public.source_documents (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  owner_clerk_id text not null,
  source_type text not null check (source_type in ('pdf', 'docx', 'pasted-text')),
  file_name text,
  storage_path text,
  raw_text text,
  processing_status text not null default 'uploaded'
    check (processing_status in ('uploaded', 'extracting', 'chunked', 'embedded', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.source_documents enable row level security;

create index if not exists source_documents_story_idx
  on public.source_documents (story_id, created_at desc);
