create table if not exists public.source_document_chunks (
	id uuid primary key default gen_random_uuid(),
	source_document_id uuid not null references public.source_documents(id) on delete cascade,
	story_id uuid not null references public.stories(id) on delete cascade,
	owner_clerk_id text not null,
	chunk_index integer not null check (chunk_index >= 0),
	heading text,
	content text not null,
	token_count integer not null default 0 check (token_count >= 0),
	character_count integer not null check (character_count > 0),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table public.source_document_chunks enable row level security;

create index if not exists source_document_chunks_story_idx
	on public.source_document_chunks (owner_clerk_id, story_id, source_document_id, chunk_index);

drop policy if exists "deny direct select on stories" on public.stories;
drop policy if exists "deny direct insert on stories" on public.stories;
drop policy if exists "deny direct update on stories" on public.stories;
drop policy if exists "deny direct delete on stories" on public.stories;
create policy "deny direct select on stories"
	on public.stories for select to anon, authenticated
	using (false);
create policy "deny direct insert on stories"
	on public.stories for insert to anon, authenticated
	with check (false);
create policy "deny direct update on stories"
	on public.stories for update to anon, authenticated
	using (false)
	with check (false);
create policy "deny direct delete on stories"
	on public.stories for delete to anon, authenticated
	using (false);

drop policy if exists "deny direct select on source_documents" on public.source_documents;
drop policy if exists "deny direct insert on source_documents" on public.source_documents;
drop policy if exists "deny direct update on source_documents" on public.source_documents;
drop policy if exists "deny direct delete on source_documents" on public.source_documents;
create policy "deny direct select on source_documents"
	on public.source_documents for select to anon, authenticated
	using (false);
create policy "deny direct insert on source_documents"
	on public.source_documents for insert to anon, authenticated
	with check (false);
create policy "deny direct update on source_documents"
	on public.source_documents for update to anon, authenticated
	using (false)
	with check (false);
create policy "deny direct delete on source_documents"
	on public.source_documents for delete to anon, authenticated
	using (false);

drop policy if exists "deny direct select on source_document_chunks" on public.source_document_chunks;
drop policy if exists "deny direct insert on source_document_chunks" on public.source_document_chunks;
drop policy if exists "deny direct update on source_document_chunks" on public.source_document_chunks;
drop policy if exists "deny direct delete on source_document_chunks" on public.source_document_chunks;
create policy "deny direct select on source_document_chunks"
	on public.source_document_chunks for select to anon, authenticated
	using (false);
create policy "deny direct insert on source_document_chunks"
	on public.source_document_chunks for insert to anon, authenticated
	with check (false);
create policy "deny direct update on source_document_chunks"
	on public.source_document_chunks for update to anon, authenticated
	using (false)
	with check (false);
create policy "deny direct delete on source_document_chunks"
	on public.source_document_chunks for delete to anon, authenticated
	using (false);
