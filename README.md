# BigFile Transcriber

Upload huge audio/video files (tested to ~5 GB), transcribe them with AssemblyAI, download a formatted PDF.

Stack: Vite + React + TypeScript, **Coolify** (app + MinIO), Supabase (Auth + Postgres + Edge Functions), AssemblyAI, jsPDF.

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
2. SQL Editor → paste `supabase/migrations/0001_init.sql` → Run.

Media files live on Coolify MinIO, not Supabase Storage. Keep Auth + Postgres + Edge Functions here.

## 3. Deploy the backend

```bash
npm i -g supabase
supabase link --project-ref <your-ref>
supabase secrets set ASSEMBLYAI_API_KEY=<key> OPENROUTER_API_KEY=<key> OPENROUTER_MODEL=anthropic/claude-sonnet-4
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

## 4. Run the frontend locally

```bash
cp .env.example .env   # fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Local Vite has no MinIO, so uploads fall back to Supabase tus (Free plan still caps at 50 MB).

## 5. Coolify (hosting + storage)

New Resource → **Docker Compose** → this repo, file `docker-compose.yml`.

Give **two public HTTPS domains**:

| Service | Port | Example | Why |
| --- | --- | --- | --- |
| `app` | 3000 | `https://prodg.studio` | Studio UI |
| `minio` | **9000** (API, not 9001) | `https://s3.prodg.studio` | Browser uploads + AssemblyAI fetch |

Environment (Coolify → Shared / service env):

| Variable | Build? | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | **yes** | Baked into the SPA |
| `VITE_SUPABASE_ANON_KEY` | **yes** | Baked into the SPA |
| `MINIO_ROOT_USER` | no | MinIO user |
| `MINIO_ROOT_PASSWORD` | no | 8+ characters; also used as `S3_SECRET_KEY` |
| `S3_PUBLIC_URL` | no | Origin of the MinIO **API** domain, e.g. `https://s3.prodg.studio` |

`S3_ENDPOINT` is already `http://minio:9000` inside the compose network. Do **not** put that internal hostname in `S3_PUBLIC_URL` — AssemblyAI cannot reach it.

After MinIO has a public URL, set the same S3 values as **Supabase function secrets** and redeploy `submit-transcription`:

```bash
npx supabase secrets set \
  S3_PUBLIC_URL=https://s3.your-domain \
  S3_ACCESS_KEY=<MINIO_ROOT_USER> \
  S3_SECRET_KEY=<MINIO_ROOT_PASSWORD> \
  S3_BUCKET=media-uploads \
  S3_REGION=us-east-1 \
  --project-ref fvdwagawkounsofwsyen
npx supabase functions deploy submit-transcription --project-ref fvdwagawkounsofwsyen
```

Auth → URL config: `site_url` / redirect list already include `https://prodg.studio`. Add the Coolify app URL if it is different.

---

## How the big-file path works

On Coolify the browser uploads with **S3 multipart** (8 MB parts, presigned by `server/index.mjs`) straight into MinIO. The Node process never buffers the file.

Without MinIO (local Vite / old Render), it falls back to **tus** against Supabase Storage.

`submit-transcription` gives AssemblyAI a **48h signed GET** to the MinIO object (`audio_url`). The file is never re-uploaded to the transcription API.

## Auth

Sign-in only. Public signup is off in `supabase/config.toml` (`enable_signup = false`).
On the hosted project: Authentication → Providers → Email → turn off **Allow new users to sign up**.
Create users in Authentication → Users → Add user.

`0002_shared_studio.sql` opens the library to every signed-in studio account.
Public signup stays off; create users in Authentication → Users → Add user.
