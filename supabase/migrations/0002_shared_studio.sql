-- Shared studio: every signed-in account sees the same library.
-- Public signup stays off; only dashboard-created users can sign in.

drop policy if exists "owners read own jobs" on public.transcription_jobs;
drop policy if exists "owners update own jobs" on public.transcription_jobs;
drop policy if exists "owners delete own jobs" on public.transcription_jobs;

create policy "studio reads all jobs" on public.transcription_jobs
  for select to authenticated using (true);

create policy "studio updates all jobs" on public.transcription_jobs
  for update to authenticated using (true);

create policy "studio deletes all jobs" on public.transcription_jobs
  for delete to authenticated using (true);

-- Insert stays owner-scoped so a row is attributed to whoever uploaded.

alter table public.transcription_jobs replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.transcription_jobs;
exception
  when duplicate_object then null;
end $$;
