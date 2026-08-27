import type { LucideIcon } from 'lucide-react';

const wells: Record<string, string> = {
  lime: 'bg-[#D3F36B]/25 text-[#0E1F1A]',
  gold: 'bg-[#FFF8E0] text-[#8A6A00]',
  forest: 'bg-[#0E1F1A]/10 text-[#0E1F1A]',
  red: 'bg-red-50 text-red-700',
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'lime',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'lime' | 'gold' | 'forest' | 'red';
}) {
  return (
    <article className={`stat-card stat-card--${accent}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-[#5A6B7D] m-0">{label}</p>
          <p className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0E1F1A] m-0 mt-0.5">
            {value}
          </p>
        </div>
        <span className={`w-7 h-7 rounded-md grid place-items-center ${wells[accent]}`}>
          <Icon size={14} strokeWidth={1.75} />
        </span>
      </div>
    </article>
  );
}
