import { AUTH_HERO, BRAND } from './lib/brand';
import BrandMark from './components/brand/BrandMark';

export default function SetupEnv() {
  return (
    <div className="relative min-h-dvh bg-[#0E1F1A]">
      <img src={AUTH_HERO} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_30%]" />
      <div className="absolute inset-0 auth-shade" aria-hidden />
      <div className="auth-grain" aria-hidden />
      <div className="relative z-10 min-h-dvh auth-scroll">
        <div className="min-h-dvh grid lg:grid-cols-[1.1fr_minmax(min(100%,22rem),28rem)] items-end lg:items-center px-5 sm:px-10 py-10 max-w-[1480px] mx-auto gap-8">
          <div>
            <div className="flex items-center gap-3 mb-8 min-w-0">
              <BrandMark className="w-10 h-10 shrink-0" />
              <span className="mk-lockup truncate">{BRAND.lockup}</span>
            </div>
            <p className="mk-label mb-4">Connect</p>
            <h1 className="m-0 font-display font-bold text-[#F3FAF5]" style={{ fontSize: 'clamp(32px, 7vw, 72px)', maxWidth: '12ch' }}>
              Add your Supabase keys to open the studio.
            </h1>
            <div className="auth-rule" aria-hidden />
          </div>
          <section className="bg-white rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.35)] mb-[max(1rem,var(--safe-bottom))]">
            <h2 className="m-0 text-[13px] font-bold">Missing .env</h2>
            <p className="text-[11px] font-medium text-[#5A6B7D] mt-1 mb-0 break-anywhere">
              Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart npm run dev.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
