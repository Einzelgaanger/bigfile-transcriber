import { FileAudio } from 'lucide-react';
import type { ReactNode } from 'react';

export default function EmptyState({
  title,
  help,
  icon,
  action,
}: {
  title: string;
  help: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="portal-empty">
      <span className="portal-empty__icon" aria-hidden>
        {icon ?? <FileAudio size={16} />}
      </span>
      <p className="text-[13px] font-bold text-[#0E1F1A] m-0">{title}</p>
      <p className="text-[11px] font-medium m-0 max-w-[36ch]">{help}</p>
      {action}
    </div>
  );
}
