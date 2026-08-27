-- BigFile Transcriber — initial schema

create table if not exists public.transcription_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  file_name text,
  storage_path text not null,
  size_bytes bigint,
  mime_type text,
  provider_job_id text,
  status text not null default 'pending'
    check (status in ('pending','processing','completed','failed')),
  error text,
  transcript_text text,
  summary text,
  duration_minutes int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Data API grants (required — RLS alone is not enough)
grant select, insert, update, delete on public.transcription_jobs to authenticated;
grant all on public.transcription_jobs to service_role;

alter table public.transcription_jobs enable row level security;

create policy "owners read own jobs" on public.transcription_jobs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "owners insert own jobs" on public.transcription_jobs
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "owners update own jobs" on public.transcription_jobs
  for update to authenticated using ((select auth.uid()) = user_id);
create policy "owners delete own jobs" on public.transcription_jobs
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Shared studio (all signed-in accounts see the same library) is in
-- 0002_shared_studio.sql.

create index if not exists transcription_jobs_user_idx
  on public.transcription_jobs (user_id, created_at desc);
create index if not exists transcription_jobs_status_idx
  on public.transcription_jobs (status) where status = 'processing';

-- Storage: private bucket for resumable media uploads.
-- Free plan file-size cap is 50 MB until the project is upgraded.
insert into storage.buckets (id, name, public, file_size_limit)
values ('media-uploads', 'media-uploads', false, 5368709120)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

-- Storage policies: each user writes and reads only their own <uid>/ prefix.
create policy "users upload own media" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'media-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "users read own media" on storage.objects
  for select to authenticated using (
    bucket_id = 'media-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "users update own media" on storage.objects
  for update to authenticated using (
    bucket_id = 'media-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
