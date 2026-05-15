create index if not exists source_document_chunks_source_document_idx
  on public.source_document_chunks (source_document_id);

create index if not exists source_document_chunks_story_fk_idx
  on public.source_document_chunks (story_id);