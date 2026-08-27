-- Structured transcript for branded PDFs, plus a library copy of the generated file.

alter table public.transcription_jobs
  add column if not exists payload jsonb,
  add column if not exists pdf_path text;

insert into storage.buckets (id, name, public, file_size_limit)
values ('transcript-pdfs', 'transcript-pdfs', false, 52428800)
on conflict (id) do update
  set public = excluded.public;

drop policy if exists "studio read pdfs" on storage.objects;
drop policy if exists "studio write pdfs" on storage.objects;
drop policy if exists "studio update pdfs" on storage.objects;

create policy "studio read pdfs" on storage.objects
  for select to authenticated using (bucket_id = 'transcript-pdfs');
create policy "studio write pdfs" on storage.objects
  for insert to authenticated with check (bucket_id = 'transcript-pdfs');
create policy "studio update pdfs" on storage.objects
  for update to authenticated using (bucket_id = 'transcript-pdfs');
