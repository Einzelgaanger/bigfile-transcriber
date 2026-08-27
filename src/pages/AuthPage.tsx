import { useEffect, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Rocket } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AUTH_HERO, BRAND } from '../lib/brand';
import BrandMark from '../components/brand/BrandMark';

export default function AuthPage({
  onBack,
  onLaunched,
}: {
  onBack: () => void;
  onLaunched: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [launch, setLaunch] = useState(false);

  const go = async () => {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg(error.message);
      setBusy(false);
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) onLaunched();
    else setLaunch(true);
    setBusy(false);
  };

  return (
    <div className="relative min-h-dvh bg-[#0E1F1A]">
      <a className="skip-link" href="#auth-form">Skip to sign in</a>
      <img
        src={AUTH_HERO}
        alt=""
        className="auth-media pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_30%] animate-kenburns"
      />
      <div className="absolute inset-0 auth-shade" aria-hidden />
      <div className="auth-grain" aria-hidden />

      <div className="relative z-10 min-h-dvh auth-scroll">
        <div className="min-h-dvh grid lg:grid-cols-[1.1fr_minmax(min(100%,22rem),28rem)] gap-8 lg:gap-16 items-end lg:items-center px-5 sm:px-10 py-10 lg:py-8 max-w-[1480px] mx-auto">
          <div className="animate-soft-rise pb-4 lg:pb-0">
            <button type="button" className="flex items-center gap-3 mb-8 bg-transparent border-0 p-0 cursor-pointer min-h-11" onClick={onBack}>
              <BrandMark className="w-10 h-10" />
              <span className="mk-lockup">{BRAND.lockup}</span>
            </button>
            <p className="mk-label mb-4">Studio</p>
            <h1
              className="m-0 font-display font-bold text-[#F3FAF5] leading-[1.05]"
              style={{ fontSize: 'clamp(32px, 7vw, 92px)', maxWidth: '11ch' }}
            >
              {BRAND.tagline}
            </h1>
            <p className="mt-5 mb-0 font-body font-normal text-[rgba(243,250,245,0.78)] max-w-[38ch]" style={{ fontSize: 'clamp(15px, 1.15vw, 19px)' }}>
              {BRAND.support}
            </p>
            <div className="auth-rule" aria-hidden />
          </div>

          <section id="auth-form" className="bg-white rounded-2xl p-6 sm:p-7 mb-[max(1rem,var(--safe-bottom))] lg:mb-0 shadow-[0_24px_64px_rgba(0,0,0,0.35)] animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-md bg-[#0E1F1A]/10 grid place-items-center text-[#0E1F1A]">
                <Lock size={14} />
              </span>
              <h2 className="m-0 text-[13px] font-bold text-[#0E1F1A]">Sign in</h2>
            </div>
            <p className="text-[11px] font-medium text-[#5A6B7D] mt-1 mb-5">
              Existing studio accounts only. New users are created in the dashboard.
            </p>

            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" className="input-glass mb-3" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <label className="field-label" htmlFor="password">Password</label>
            <div className="relative mb-4">
              <input
                id="password"
                className="input-glass pr-12"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && email && password) void go(); }}
              />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 touch-target grid place-items-center text-[#5A6B7D]" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((v) => !v)}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="button" className="btn-dark w-full justify-between pl-5" disabled={busy || !email || !password} onClick={() => void go()}>
              {busy ? 'Please wait…' : 'Enter studio'}
              <span className="btn-node"><ArrowRight size={14} /></span>
            </button>

            {msg ? <p className="text-xs mt-3 mb-0 text-red-700">{msg}</p> : null}
          </section>
        </div>
      </div>

      {launch ? <LaunchOverlay onDone={onLaunched} /> : null}
    </div>
  );
}

function LaunchOverlay({ onDone }: { onDone: () => void }) {
  const [line, setLine] = useState('Ignite');

  useEffect(() => {
    const t1 = window.setTimeout(() => setLine('Launch'), 900);
    const t2 = window.setTimeout(() => setLine('Enter'), 1800);
    const t3 = window.setTimeout(onDone, 3400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div className="launch-overlay">
      <div className="text-center">
        <div className="launch-rocket inline-block text-[#D3F36B]">
          <Rocket size={48} strokeWidth={1.75} />
        </div>
        <div className="launch-flame" />
        <p className="mk-label mt-10 mb-0">{line}</p>
      </div>
    </div>
  );
}
