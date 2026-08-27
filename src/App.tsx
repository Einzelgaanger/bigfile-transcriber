import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  FileAudio,
  FilePlus,
  Layers,
  RefreshCw,
  Search,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, supabaseReady, type TranscriptionJob } from './lib/supabase';
import { buildStoragePath, MAX_UPLOAD_BYTES, prepareAudioForTranscription, resumableUpload } from './lib/upload';
import { allowedMediaError, MEDIA_ACCEPT } from './lib/media';
import { deliverTranscriptPdf } from './lib/pdf';
import SetupEnv from './SetupEnv';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import PortalLayout, { type PortalView } from './components/layout/PortalLayout';
import PageHeader from './components/layout/PageHeader';
import StatCard from './components/shared/StatCard';
import StatusBadge from './components/shared/StatusBadge';
import EmptyState from './components/shared/EmptyState';
import DataTable from './components/shared/DataTable';

const fmtSize = (b?: number | null) =>
  !b ? '—' : b > 1e9 ? `${(b / 1e9).toFixed(2)} GB` : `${(b / 1e6).toFixed(1)} MB`;

const fmtWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function App() {
  if (!supabaseReady) return <SetupEnv />;
  return <Root />;
}

function Root() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [gate, setGate] = useState<'home' | 'auth'>('home');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUser(u ? { id: u.id, email: u.email ?? '' } : null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const u = s?.user;
      setUser(u ? { id: u.id, email: u.email ?? '' } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return null;
  if (user) return <Studio user={user} />;
  if (gate === 'auth') {
    return <AuthPage onBack={() => setGate('home')} onLaunched={() => setGate('home')} />;
  }
  return <HomePage onSignIn={() => setGate('auth')} onEnter={() => setGate('auth')} />;
}

function Studio({ user }: { user: { id: string; email: string } }) {
  const [jobs, setJobs] = useState<TranscriptionJob[]>([]);
  const [view, setView] = useState<PortalView>('dashboard');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [phase, setPhase] = useState<'upload' | 'prepare' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'session'>('profile');
  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const watchedJobs = useRef(new Set<string>());
  const autoPdfDone = useRef(new Set<string>());

  const loadJobs = useCallback(async () => {
    const { data } = await supabase
      .from('transcription_jobs')
      .select('*')
      .order('created_at', { ascending: false });
    setJobs((data as TranscriptionJob[]) ?? []);
  }, []);

  const poll = useCallback(async () => {
    await supabase.functions.invoke('poll-transcription', { body: {} }).catch(() => null);
    await loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    void poll();
    const id = setInterval(() => void poll(), 30_000);
    const channel = supabase
      .channel('studio-jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transcription_jobs' }, () => {
        void loadJobs();
      })
      .subscribe();
    return () => {
      clearInterval(id);
      void supabase.removeChannel(channel);
    };
  }, [poll, loadJobs]);

  useEffect(() => {
    for (const job of jobs) {
      if (job.status === 'pending' || job.status === 'processing') watchedJobs.current.add(job.id);
    }
    const ready = jobs.find(
      (job) =>
        job.status === 'completed' &&
        !!job.transcript_text &&
        watchedJobs.current.has(job.id) &&
        !autoPdfDone.current.has(job.id),
    );
    if (!ready) return;
    autoPdfDone.current.add(ready.id);
    void (async () => {
      setPdfBusyId(ready.id);
      try {
        await deliverTranscriptPdf(ready, { download: true, store: true });
        toast.success('PDF downloaded and saved to the library');
        await loadJobs();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'PDF failed');
      } finally {
        setPdfBusyId(null);
      }
    })();
  }, [jobs, loadJobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        (j.file_name ?? '').toLowerCase().includes(q) ||
        j.status.includes(q),
    );
  }, [jobs, query]);

  const selected = jobs.find((j) => j.id === selectedId) ?? null;
  const inflightJobs = jobs.filter((j) => j.status === 'pending' || j.status === 'processing');

  const savePdf = async (job: TranscriptionJob) => {
    if (pdfBusyId) return;
    setPdfBusyId(job.id);
    try {
      await deliverTranscriptPdf(job, { download: true, store: true });
      toast.success(job.pdf_path ? 'PDF downloaded' : 'PDF downloaded and saved to the library');
      await loadJobs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'PDF failed');
    } finally {
      setPdfBusyId(null);
    }
  };

  const metrics = useMemo(() => {
    const completed = jobs.filter((j) => j.status === 'completed').length;
    const inflight = inflightJobs.length;
    const failed = jobs.filter((j) => j.status === 'failed').length;
    const minutes = jobs.reduce((n, j) => n + (j.duration_minutes ?? 0), 0);
    return { completed, inflight, failed, minutes };
  }, [jobs, inflightJobs.length]);

  const pickFile = (next: File | null) => {
    if (!next) {
      setFile(null);
      return;
    }
    if (next.size > MAX_UPLOAD_BYTES) {
      const msg = 'This file is larger than 10 GB. Split it or export a smaller copy first.';
      setError(msg);
      toast.error(msg);
      return;
    }
    const blocked = allowedMediaError(next);
    if (blocked) {
      setError(blocked);
      toast.error(blocked);
      return;
    }
    setError(null);
    setFile(next);
  };

  const submit = async () => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      pickFile(file);
      return;
    }
    const blocked = allowedMediaError(file);
    if (blocked) {
      setError(blocked);
      toast.error(blocked);
      return;
    }
    setError(null);
    setProgress(0);
    setPhase('upload');
    try {
      const path = buildStoragePath(user.id, file);
      await resumableUpload(file, path, setProgress);
      setPhase('prepare');
      const audioPath = await prepareAudioForTranscription(path);
      const { data, error: fnErr } = await supabase.functions.invoke('submit-transcription', {
        body: {
          storagePath: path,
          audioStoragePath: audioPath,
          title: 'Transcribing…',
          fileName: file.name,
          sizeBytes: file.size,
          mimeType: file.type,
        },
      });
      if (fnErr) throw new Error(fnErr.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setFile(null);
      await loadJobs();
      toast.success('Job submitted');
      setView('library');
    } catch (e) {
      let message = e instanceof Error ? e.message : 'Upload failed';
      if (/413|Maximum size exceeded/i.test(message)) {
        message = 'This file is larger than the current storage limit. On Coolify the file should go to MinIO; if you still see this, the app fell back to Supabase (50 MB on Free).';
      }
      setError(message);
      toast.error(message);
    } finally {
      setProgress(null);
      setPhase(null);
    }
  };

  const copyTranscript = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied');
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <PortalLayout
      view={view}
      onView={(v) => {
        setView(v);
        if (v !== 'library') setSelectedId(null);
      }}
      email={user.email || 'Studio'}
      unread={metrics.inflight}
      onNotify={() => setView('library')}
      onSignOut={() => void supabase.auth.signOut()}
    >
      {view === 'dashboard' && (
        <div className="portal-page animate-fade-in">
          <PageHeader
            title="Studio"
            subtitle="Jobs in flight, ready transcripts, and the next upload."
            actions={
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-ghost" onClick={() => void poll()}>
                  <RefreshCw size={14} /> Refresh
                </button>
                <button type="button" className="btn-lime" onClick={() => setView('upload')}>
                  New job
                  <span className="btn-node"><ArrowRight size={14} /></span>
                </button>
              </div>
            }
          />
          <div className="portal-callout">
            One library for every studio login. Gold is in flight. Lime is ready.
          </div>
          <div className="portal-metrics">
            <StatCard label="Jobs" value={jobs.length} icon={Layers} accent="forest" />
            <StatCard label="Ready" value={metrics.completed} icon={CheckCircle2} accent="lime" />
            <StatCard label="In flight" value={metrics.inflight} icon={Clock3} accent="gold" />
            <StatCard label="Minutes" value={metrics.minutes || '—'} icon={FileAudio} accent="forest" />
          </div>
          <div className="portal-split--aside portal-split">
            <section className="portal-section">
              <header className="portal-section__head">
                <div>
                  <h2 className="portal-section__title">Recent</h2>
                  <p className="portal-section__desc">Latest jobs in this studio.</p>
                </div>
                <button type="button" className="btn-action-chip" onClick={() => setView('library')}>Open library</button>
              </header>
              {!jobs.length ? (
                <div className="p-4">
                  <EmptyState
                    title="Nothing yet"
                    help="Post a new job to start a transcript."
                    icon={<FilePlus size={16} />}
                    action={
                      <button type="button" className="btn-primary mt-2" onClick={() => setView('upload')}>
                        New job
                      </button>
                    }
                  />
                </div>
              ) : (
                jobs.slice(0, 8).map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    className="w-full text-left flex items-center justify-between gap-3 px-3.5 py-3 border-b border-[#0E1F1A]/[0.06] last:border-0 hover:bg-[#f7faf6]"
                    onClick={() => { setSelectedId(job.id); setView('library'); }}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#0E1F1A] truncate">{job.title}</div>
                      <div className="text-[11px] font-medium text-[#5A6B7D] mt-0.5 font-mono">{job.id.slice(0, 8)}</div>
                    </div>
                    <StatusBadge status={job.status} />
                  </button>
                ))
              )}
            </section>
            <section className="portal-section">
              <header className="portal-section__head">
                <div>
                  <h2 className="portal-section__title">In flight</h2>
                  <p className="portal-section__desc">Pending and processing — gold, not lime.</p>
                </div>
              </header>
              {!inflightJobs.length ? (
                <div className="p-4">
                  <EmptyState title="Queue clear" help="New uploads appear here until they complete." icon={<Clock3 size={16} />} />
                </div>
              ) : (
                inflightJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between gap-3 px-3.5 py-3 border-b border-[#0E1F1A]/[0.06] last:border-0">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{job.title}</div>
                      <div className="text-[11px] text-[#5A6B7D]">{fmtWhen(job.created_at)}</div>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      )}

      {view === 'upload' && (
        <div className="portal-page animate-fade-in">
          <PageHeader title="New job" subtitle="MP3 or MP4, up to 10 GB" />
          <div className="portal-callout">
            Files go to MinIO in 64 MB parts. Over ~5 GB we extract a small audio track so AssemblyAI can transcribe it (their cap is 5 GB / 10 hours).
          </div>
          <section className="portal-section">
            <header className="portal-section__head">
              <div>
                <h2 className="portal-section__title">Upload</h2>
                <p className="portal-section__desc">Drop the file. Title and description come from the recording, not the filename.</p>
              </div>
            </header>
            <div className="portal-section__body--pad">
              <div>
                <label className="field-label">File</label>
                <div
                  className={`dropzone ${over ? 'is-over' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
                  onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                  onDragLeave={() => setOver(false)}
                  onDrop={(e) => { e.preventDefault(); setOver(false); pickFile(e.dataTransfer.files?.[0] ?? null); }}
                >
                  <span className="mx-auto mb-2 w-7 h-7 rounded-md bg-[#D3F36B]/25 text-[#0E1F1A] grid place-items-center">
                    <UploadCloud size={16} />
                  </span>
                  {file ? (
                    <>
                      <div className="text-sm font-bold text-[#0E1F1A] break-anywhere">{file.name}</div>
                      <div className="text-[11px] font-medium mt-1 font-mono">{fmtSize(file.size)}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-[#0E1F1A]">Drop media here, or click to browse</div>
                      <div className="text-[11px] font-medium mt-1">mp3 · mp4 only</div>
                    </>
                  )}
                </div>
                <input ref={inputRef} type="file" accept={MEDIA_ACCEPT} hidden aria-label="Choose an MP3 or MP4 file" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
              </div>
              {(progress !== null || phase === 'prepare') && (
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-semibold text-[#5A6B7D] mb-1">
                    <span>{phase === 'prepare' ? 'Preparing audio for transcription' : 'Uploading'}</span>
                    <span className="font-mono">{phase === 'prepare' ? '…' : `${progress ?? 0}%`}</span>
                  </div>
                  <div className="progress-track" aria-label={phase === 'prepare' ? 'Preparing audio' : `Uploading ${progress}%`}>
                    <i style={{ width: phase === 'prepare' ? '100%' : `${progress ?? 0}%` }} />
                  </div>
                </div>
              )}
              {error && <p className="text-xs text-red-700 mt-2 mb-0">{error}</p>}
              <button type="button" className="btn-primary mt-4" onClick={() => void submit()} disabled={!file || phase !== null}>
                <FilePlus size={16} />
                {phase === 'prepare' ? 'Preparing audio…' : phase === 'upload' ? `Uploading ${progress ?? 0}%` : 'Upload & transcribe'}
                {phase === null ? <span className="btn-node ml-auto"><ArrowRight size={14} /></span> : null}
              </button>
            </div>
          </section>
        </div>
      )}

      {view === 'library' && (
        <Library
          jobs={filtered}
          total={jobs.length}
          query={query}
          onQuery={setQuery}
          selected={selected}
          onSelect={setSelectedId}
          onRefresh={() => void poll()}
          onPdf={(job) => void savePdf(job)}
          pdfBusyId={pdfBusyId}
          copied={copied}
          onCopy={copyTranscript}
          onUpload={() => setView('upload')}
          metrics={metrics}
        />
      )}

      {view === 'settings' && (
        <div className="portal-page animate-fade-in">
          <PageHeader title="Profile" subtitle="Account and session for this studio." />
          <div className="portal-callout">
            Everyone who can sign in shares this library. Sign-out is confirmed before it runs.
          </div>
          <div className="portal-tabs">
            <button type="button" className={settingsTab === 'profile' ? 'is-active' : ''} onClick={() => setSettingsTab('profile')}>Profile</button>
            <button type="button" className={settingsTab === 'session' ? 'is-active' : ''} onClick={() => setSettingsTab('session')}>Session</button>
          </div>
          <div className="portal-grid-2">
            <section className="portal-section">
              <header className="portal-section__head">
                <div>
                  <h2 className="portal-section__title">{settingsTab === 'profile' ? 'Identity' : 'Session'}</h2>
                  <p className="portal-section__desc">
                    {settingsTab === 'profile' ? 'This login. Jobs are studio-wide, not private to this email.' : 'Sign-out is confirmed before it runs.'}
                  </p>
                </div>
              </header>
              <div className="portal-section__body--pad">
                {settingsTab === 'profile' ? (
                  <div className="detail-cell">
                    <span className="detail-cell__label">Email</span>
                    <span className="detail-cell__value font-mono">{user.email}</span>
                  </div>
                ) : (
                  <p className="text-sm m-0 text-[#5A6B7D]">Use Sign out in the sidebar. Confirm in the sheet on mobile, the card on desktop.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

function Library({
  jobs,
  total,
  query,
  onQuery,
  selected,
  onSelect,
  onRefresh,
  onPdf,
  pdfBusyId,
  copied,
  onCopy,
  onUpload,
  metrics,
}: {
  jobs: TranscriptionJob[];
  total: number;
  query: string;
  onQuery: (v: string) => void;
  selected: TranscriptionJob | null;
  onSelect: (id: string | null) => void;
  onRefresh: () => void;
  onPdf: (job: TranscriptionJob) => void;
  pdfBusyId: string | null;
  copied: boolean;
  onCopy: (text: string) => void;
  onUpload: () => void;
  metrics: { completed: number; inflight: number; failed: number; minutes: number };
}) {
  return (
    <div className="portal-page animate-fade-in">
      <PageHeader
        title={selected ? selected.title : 'Library'}
        subtitle={selected ? selected.file_name ?? 'Transcript' : `${total} job${total === 1 ? '' : 's'} in this studio`}
        actions={
          <div className="flex gap-1">
            {selected ? <button type="button" className="btn-ghost" onClick={() => onSelect(null)}>Back</button> : null}
            <button type="button" className="btn-ghost" onClick={onRefresh}><RefreshCw size={14} /> Refresh</button>
          </div>
        }
      />

      {selected ? (
        <JobDetail job={selected} onPdf={onPdf} pdfBusyId={pdfBusyId} copied={copied} onCopy={onCopy} />
      ) : (
        <>
          <div className="portal-metrics">
            <StatCard label="Ready" value={metrics.completed} icon={CheckCircle2} accent="lime" />
            <StatCard label="In flight" value={metrics.inflight} icon={Clock3} accent="gold" />
            <StatCard label="Failed" value={metrics.failed} icon={XCircle} accent="red" />
            <StatCard label="Minutes" value={metrics.minutes || '—'} icon={FileAudio} accent="forest" />
          </div>
          <section className="portal-section">
            <header className="portal-section__head">
              <div>
                <h2 className="portal-section__title">Transcripts</h2>
                <p className="portal-section__desc">Select a row to read, copy, or export PDF.</p>
              </div>
            </header>
            <div className="portal-section__body--pad portal-toolbar">
              <label className="relative flex-1 w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6B7D]" />
                <input className="field-input pl-9" type="search" placeholder="Search title, file, or status" value={query} onChange={(e) => onQuery(e.target.value)} />
              </label>
            </div>
            <DataTable
              headers={['Title', 'When', 'Size', 'Status', '']}
              empty={
                <EmptyState
                  title={total === 0 ? 'Library is empty' : 'No matching jobs'}
                  help={total === 0 ? 'Upload audio or video to start a transcript.' : 'Clear the search or try another title.'}
                  icon={total === 0 ? <UploadCloud size={16} /> : <Search size={16} />}
                  action={
                    total === 0 ? (
                      <button type="button" className="btn-primary mt-2" onClick={onUpload}>
                        New job
                      </button>
                    ) : null
                  }
                />
              }
              rows={jobs.map((job) => ({
                id: job.id,
                onClick: () => onSelect(job.id),
                cells: [
                  <div key="t">
                    <div className="font-semibold">{job.title}</div>
                    <div className="text-[11px] text-[#5A6B7D] font-mono mt-0.5">
                      {job.file_name}{job.pdf_path ? ' · PDF in library' : ''}
                    </div>
                  </div>,
                  <span key="w" className="text-[#5A6B7D] whitespace-nowrap">{fmtWhen(job.created_at)}</span>,
                  <span key="s" className="font-mono text-xs">{fmtSize(job.size_bytes)}</span>,
                  <StatusBadge key="st" status={job.status} />,
                  <button
                    key="p"
                    type="button"
                    className="btn-action-chip"
                    disabled={job.status !== 'completed' || pdfBusyId === job.id}
                    onClick={(e) => { e.stopPropagation(); onPdf(job); }}
                  >
                    {pdfBusyId === job.id ? '…' : job.pdf_path ? 'PDF' : 'PDF'}
                  </button>,
                ],
              }))}
            />
          </section>
        </>
      )}
    </div>
  );
}

function JobDetail({
  job,
  onPdf,
  pdfBusyId,
  copied,
  onCopy,
}: {
  job: TranscriptionJob;
  onPdf: (job: TranscriptionJob) => void;
  pdfBusyId: string | null;
  copied: boolean;
  onCopy: (text: string) => void;
}) {
  const stages: TranscriptionJob['status'][] = ['pending', 'processing', 'completed'];
  const idx = job.status === 'failed' ? -1 : stages.indexOf(job.status);

  return (
    <>
      <section className="portal-section">
        <header className="portal-section__head">
          <div>
            <h2 className="portal-section__title">Lifecycle</h2>
            <p className="portal-section__desc font-mono">{job.id}</p>
          </div>
        </header>
        <div className="portal-section__body--pad flex gap-2 flex-wrap">
          {job.status === 'failed' ? (
            <StatusBadge status="failed" />
          ) : (
            stages.map((s, i) => (
              <span key={s} className={`status-badge ${i < idx ? 'status-badge--ok' : i === idx ? (s === 'completed' ? 'status-badge--ok' : 'status-badge--pending') : 'status-badge--neutral'}`}>
                {s}
              </span>
            ))
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="detail-cell">
          <span className="detail-cell__label">Status</span>
          <StatusBadge status={job.status} />
        </div>
        <div className="detail-cell">
          <span className="detail-cell__label">When</span>
          <span className="detail-cell__value">{fmtWhen(job.created_at)}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-cell__label">Size</span>
          <span className="detail-cell__value font-mono">{fmtSize(job.size_bytes)}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-cell__label">Duration</span>
          <span className="detail-cell__value font-mono">{job.duration_minutes ? `${job.duration_minutes} min` : '—'}</span>
        </div>
      </div>

      {job.error ? <p className="text-xs text-red-700 m-0">{job.error}</p> : null}

      {job.summary ? (
        <section className="portal-section">
          <header className="portal-section__head">
            <div>
              <h2 className="portal-section__title">Description</h2>
              <p className="portal-section__desc">Written from the transcript, not the filename.</p>
            </div>
          </header>
          <div className="portal-section__body--pad text-sm leading-relaxed text-[#0E1F1A] whitespace-pre-wrap">{job.summary}</div>
        </section>
      ) : null}

      <section className="portal-section">
        <header className="portal-section__head">
          <div>
            <h2 className="portal-section__title">Transcript</h2>
            <p className="portal-section__desc">Copy or download the branded PDF.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary min-h-11 px-3 py-1.5 text-xs" disabled={!job.transcript_text} onClick={() => job.transcript_text && onCopy(job.transcript_text)}>
              <Copy size={14} /> {copied ? 'Copied' : 'Copy'}
            </button>
            <button type="button" className="btn-primary min-h-11 px-3 py-1.5 text-xs" disabled={job.status !== 'completed' || pdfBusyId === job.id} onClick={() => onPdf(job)}>
              <Download size={14} /> {pdfBusyId === job.id ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </header>
        <div className="portal-section__body--pad">
          {job.status === 'completed' && job.transcript_text ? (
            <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap text-[#0E1F1A]">{job.transcript_text}</p>
          ) : job.status === 'failed' ? (
            <EmptyState title="Transcription failed" help={job.error || 'Try uploading the file again.'} icon={<XCircle size={16} />} />
          ) : (
            <EmptyState title="Still working" help="This job is queued or processing. Refresh to check again." icon={<Clock3 size={16} />} />
          )}
        </div>
      </section>
    </>
  );
}
