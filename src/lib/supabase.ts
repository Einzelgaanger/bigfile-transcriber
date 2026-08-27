import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

export const supabaseReady =
  url.startsWith('https://') && anon.length > 20 && !url.includes('your-ref');

export const supabase = createClient(
  supabaseReady ? url : 'https://placeholder.supabase.co',
  supabaseReady ? anon : 'public-anon-placeholder-key',
  { auth: { persistSession: true, autoRefreshToken: true } },
);

export interface TranscriptionJob {
  id: string;
  title: string;
  file_name: string | null;
  size_bytes: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string | null;
  transcript_text: string | null;
  summary: string | null;
  duration_minutes: number | null;
  created_at: string;
}
