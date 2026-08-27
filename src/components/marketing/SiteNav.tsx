import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BRAND } from '../../lib/brand';
import { NavBrandMark } from '../brand/BrandMark';
import { useDialogChrome } from '../../hooks/useDialogChrome';

export default function SiteNav({
  overlay,
  onSignIn,
  onEnter,
}: {
  overlay?: boolean;
  onSignIn: () => void;
  onEnter: () => void;
}) {
  const [progress, setProgress] = useState(overlay ? 0 : 1);
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);
  const [active, setActive] = useState<'problem' | 'flow' | 'portals' | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useDialogChrome(open, sheetRef, () => setOpen(false));

  useEffect(() => {
    if (!drop) return;
    const onDoc = (e: MouseEvent) => {
      if (dropRef.current && e.target instanceof Node && !dropRef.current.contains(e.target)) {
        setDrop(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrop(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [drop]);

  useEffect(() => {
    if (!overlay) {
      setProgress(1);
      return;
    }
    let frame = 0;
    const ids = ['problem', 'flow', 'portals'] as const;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setProgress(Math.min(Math.max(y / 180, 0), 1));
        if (y < 96) {
          setActive(null);
          return;
        }
        const probe = y + 140;
        let current: (typeof ids)[number] | null = null;
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.offsetTop <= probe) current = id;
        }
        setActive(current);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [overlay]);

  const scrolled = progress > 0.72;
  const shadow = progress > 0.08 ? `0 8px 28px rgba(14,31,26, ${0.07 * progress})` : 'none';
  const blur = progress > 0.05 ? `blur(${12 * progress}px)` : 'none';

  const go = (id: string) => {
    setOpen(false);
    setDrop(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <>
      <header
        className={`nav ${overlay ? 'on-hero' : ''} ${scrolled ? 'scrolled' : ''}`}
        style={{
          ['--nav-progress' as string]: String(progress),
          boxShadow: overlay ? shadow : undefined,
          backdropFilter: overlay ? blur : undefined,
        }}
      >
        <div className="container nav-inner">
          <button type="button" className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="brand-tile">
              <NavBrandMark />
            </span>
            <span className="brand-word">{BRAND.name}</span>
          </button>

          <nav className="nav-links">
            <button
              type="button"
              className={`nav-link ${active === 'problem' ? 'is-active' : ''}`}
              aria-current={active === 'problem' ? 'location' : undefined}
              onClick={() => go('problem')}
            >
              Problem
            </button>
            <div className={`drop ${drop ? 'open' : ''}`} ref={dropRef}>
              <button
                type="button"
                className={`nav-link ${active === 'flow' ? 'is-active' : ''}`}
                aria-expanded={drop}
                aria-haspopup="true"
                aria-current={active === 'flow' ? 'location' : undefined}
                onClick={() => setDrop((v) => !v)}
              >
                How it works <span className="caret" />
              </button>
              <div className="drop-panel">
                <a href="#flow" onClick={(e) => { e.preventDefault(); go('flow'); }}>
                  Upload → PDF
                  <span className="d-sub">Four steps from file to transcript</span>
                </a>
                <a href="#portals" onClick={(e) => { e.preventDefault(); go('portals'); }}>
                  Studio
                  <span className="d-sub">Jobs, library, and exports</span>
                </a>
              </div>
            </div>
            <button
              type="button"
              className={`nav-link ${active === 'portals' ? 'is-active' : ''}`}
              aria-current={active === 'portals' ? 'location' : undefined}
              onClick={() => go('portals')}
            >
              Studio
            </button>
          </nav>

          <div className="nav-right">
            <button type="button" className="nav-signin" onClick={onSignIn}>
              Sign in
            </button>
            <button type="button" className="btn btn-dark" onClick={onEnter}>
              Enter studio
              <span className="node">
                <ArrowRight size={14} />
              </span>
            </button>
            <button type="button" className="nav-burger" aria-label="Open menu" onClick={() => setOpen(true)}>
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="nav-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex items-center justify-between mb-6 gap-3 min-w-0">
            <span className="flex items-center gap-3 min-w-0">
              <span className="brand-tile" style={{ width: 38, height: 38, borderRadius: 10 }}>
                <NavBrandMark />
              </span>
              <span className="brand-word text-white min-w-0 truncate" style={{ fontSize: 22 }}>{BRAND.lockup}</span>
            </span>
            <button type="button" className="nav-burger" style={{ display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.14)', color: '#fff' }} aria-label="Close" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <button type="button" className={`sheet-link ${active === 'problem' ? 'is-active' : ''}`} onClick={() => go('problem')}>Problem</button>
          <button type="button" className={`sheet-link ${active === 'flow' ? 'is-active' : ''}`} onClick={() => go('flow')}>How it works</button>
          <button type="button" className={`sheet-link sub ${active === 'portals' ? 'is-active' : ''}`} onClick={() => go('portals')}>Studio</button>
          <button type="button" className="sheet-link" onClick={onSignIn}>Sign in</button>
          <button type="button" className="btn btn-lime mt-6" onClick={onEnter}>
            Enter studio
            <span className="node"><ArrowRight size={14} /></span>
          </button>
        </div>
      ) : null}
    </>
  );
}
