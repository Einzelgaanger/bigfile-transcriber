import type { TranscriptionJob } from '../../lib/supabase';

const map: Record<TranscriptionJob['status'], string> = {
  completed: 'status-badge--ok',
  pending: 'status-badge--pending',
  processing: 'status-badge--pending',
  failed: 'status-badge--bad',
};

export default function StatusBadge({ status }: { status: TranscriptionJob['status'] }) {
  return <span className={`status-badge ${map[status]}`}>{status}</span>;
}
