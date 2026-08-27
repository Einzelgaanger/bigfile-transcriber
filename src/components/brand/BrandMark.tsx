/** Voice mark: forest tile, lime bars, lime node top-right. */
export default function BrandMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#0E1F1A" />
      <rect x="6" y="10" width="3" height="12" rx="1.5" fill="#D3F36B" />
      <rect x="11.5" y="6" width="3" height="20" rx="1.5" fill="#D3F36B" />
      <rect x="17.5" y="12" width="3" height="14" rx="1.5" fill="#D3F36B" />
      <rect x="23" y="8" width="3" height="16" rx="1.5" fill="#D3F36B" />
      <circle cx="26.8" cy="6.2" r="3.2" fill="#D3F36B" />
    </svg>
  );
}

/** Glyph only — marketing nav already provides the forest tile. */
export function NavBrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="6" y="10" width="3" height="12" rx="1.5" fill="#D3F36B" />
      <rect x="11.5" y="6" width="3" height="20" rx="1.5" fill="#D3F36B" />
      <rect x="17.5" y="12" width="3" height="14" rx="1.5" fill="#D3F36B" />
      <rect x="23" y="8" width="3" height="16" rx="1.5" fill="#D3F36B" />
      <circle cx="26.8" cy="6.2" r="3.2" fill="#D3F36B" />
    </svg>
  );
}
