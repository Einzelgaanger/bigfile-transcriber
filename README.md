# BigFile Transcriber

Upload huge audio/video files (tested to ~5 GB), transcribe them with AssemblyAI, download a formatted PDF.

Stack: Vite + React + TypeScript, Supabase (Storage + Postgres + Edge Functions), AssemblyAI, jsPDF.

**Cursor agents:** visual system is [`IOUX_TRANSFER_GUIDE.md`](./IOUX_TRANSFER_GUIDE.md). After that, identity & taste (logo, photos, copy — do not rebadge IOUX) is [`IOUX_TRANSFER_IDENTITY_TASTE.md`](./IOUX_TRANSFER_IDENTITY_TASTE.md).

---

## 1. Create the GitHub repo

```bash
cd bigfile-transcriber
git init
git add .
git commit -m "feat: big-file transcriber"
gh repo create bigfile-transcriber --private --source=. --push
# or: create the repo on github.com and
# git remote add origin git@github.com:<you>/bigfile-transcriber.git && git push -u origin main
```

## 2. Create a fresh Supabase project

1. supabase.com → New project (pick a region near your users).
2. Storage → **Create bucket** named `media-uploads`, **private**.
3. Storage → Settings → set **Upload file size limit** to `5368709120` (5 GB).
   Free tier caps at 50 MB — you need Pro for multi-GB files.
4. SQL Editor → paste `supabase/migrations/0001_init.sql` → Run.

## 3. Deploy the backend

```bash
npm i -g supabase
supabase link --project-ref <your-ref>
supabase secrets set ASSEMBLYAI_API_KEY=<key>
supabase functions deploy submit-transcription
supabase functions deploy poll-transcription
```

Optional cron (SQL Editor) so jobs finish without the tab open:

```sql
select cron.schedule('poll-transcripts','*/2 * * * *', $$
  select net.http_post(
    url := 'https://<ref>.supabase.co/functions/v1/poll-transcription',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer <service_role_key>"}'::jsonb,
    body := '{}'::jsonb
  );
$$);
```

## 4. Run the frontend

```bash
cp .env.example .env   # fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Deploy anywhere static (Vercel / Netlify / Cloudflare Pages) — set the same two env vars.

---

## How the big-file path works

Normal `supabase.storage.upload()` dies on multi-GB files. This repo uses the
**tus resumable protocol** (`tus-js-client`) against
`/storage/v1/upload/resumable`, in 6 MB chunks, with retry + resume. The browser
never holds the whole file in memory, and a dropped connection resumes instead
of restarting.

AssemblyAI is then given a **48h signed URL** to the storage object, so the file
is never re-uploaded to the transcription API.

## Auth

Sign-in only. Public signup is off in `supabase/config.toml` (`enable_signup = false`).
On the hosted project: Authentication → Providers → Email → turn off **Allow new users to sign up**.
Create users in Authentication → Users → Add user.

`0001_init.sql` ships with RLS: users see only their own jobs. Enable
Email auth in the Supabase dashboard. If you want a fully public tool, swap
the policies for `to anon` variants — the file tells you where.
