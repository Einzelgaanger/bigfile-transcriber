import type { ReactNode } from 'react';

export default function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-hero">
      <div className="flex items-start gap-2.5 min-w-0">
        <span className="mt-1.5 h-4 w-1 shrink-0 rounded-full bg-[#D3F36B]" aria-hidden />
        <div className="min-w-0">
          <h1 className="font-display text-base sm:text-lg font-bold text-white tracking-tight leading-tight m-0">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-xs font-medium text-white/65 max-w-3xl leading-snug m-0 mt-0.5">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 min-w-0 max-sm:pl-3.5">{actions}</div> : null}
    </header>
  );
}
