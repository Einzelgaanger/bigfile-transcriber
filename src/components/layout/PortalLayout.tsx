import type { ReactNode } from 'react';
import {
  Bell,
  FilePlus,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  User,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { BRAND, AUTH_HERO } from '../../lib/brand';
import { useDialogChrome } from '../../hooks/useDialogChrome';
import BrandMark from '../brand/BrandMark';
import ConfirmationModal from '../shared/ConfirmationModal';

export type PortalView = 'dashboard' | 'upload' | 'library' | 'settings';

const PRIMARY: { id: PortalView; label: string; icon: typeof FilePlus }[] = [
  { id: 'dashboard', label: 'Studio', icon: LayoutDashboard },
  { id: 'upload', label: 'New job', icon: FilePlus },
  { id: 'library', label: 'Library', icon: FileText },
  { id: 'settings', label: 'Profile', icon: User },
];

function NavLinks({ view, onNav }: { view: PortalView; onNav: (id: PortalView) => void }) {
  return (
    <>
      {PRIMARY.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className={`sidebar-nav-link ${view === item.id ? 'is-active' : ''}`}
            onClick={() => onNav(item.id)}
          >
            <Icon size={18} strokeWidth={1.5} />
            {item.label}
          </button>
        );
      })}
    </>
  );
}

export default function PortalLayout({
  view,
  onView,
  email,
  unread = 0,
  onNotify,
  onSignOut,
  children,
}: {
  view: PortalView;
  onView: (v: PortalView) => void;
  email: string;
  unread?: number;
  onNotify?: () => void;
  onSignOut: () => void;
  children: ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const initial = (email[0] || 'B').toUpperCase();

  useDialogChrome(drawer, drawerRef, () => setDrawer(false));

  const nav = (id: PortalView) => {
    onView(id);
    setDrawer(false);
  };

  return (
    <div className="portal-shell">
      <a className="skip-link" href="#studio-main">Skip to studio</a>
      <div className="portal-backdrop" aria-hidden>
        <img src={AUTH_HERO} alt="" className="portal-backdrop__photo" />
        <div className="portal-backdrop__veil" />
        <div className="auth-grain" />
      </div>

      <div className="relative z-10 flex h-dvh max-h-dvh min-h-0 gap-3 p-2 sm:p-3 lg:p-4">
        <aside className="sidebar-glass hidden lg:flex w-[min(15.5rem,100%)] xl:w-64 shrink-0 flex-col rounded-2xl my-1 ml-1 overflow-hidden min-h-0">
          <div className="flex items-center gap-2.5 px-4 py-4 min-w-0">
            <BrandMark className="w-9 h-9 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-bold text-white tracking-tight truncate">{BRAND.name}</div>
              <div className="text-[11px] font-medium text-[#E8F0EA]/65 truncate">{BRAND.product}</div>
            </div>
          </div>
          <div className="h-px bg-white/[0.08] mx-3 my-2" />
          <nav className="flex flex-col gap-1 p-3 flex-1 min-h-0 overflow-y-auto">
            <NavLinks view={view} onNav={nav} />
          </nav>
          <div className="border-t border-white/[0.08] p-3 flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-md bg-[#D3F36B] text-[#0E1F1A] grid place-items-center text-xs font-bold shrink-0">
              {initial}
            </span>
            <div className="min-w-0 flex-1 rounded-md bg-[#173028] px-2 py-1">
              <div className="text-xs font-semibold text-white truncate">{email}</div>
              <div className="text-[10px] text-[#E8F0EA]/65">Studio</div>
            </div>
            <button type="button" className="relative touch-target grid place-items-center text-[#E8F0EA]/70 hover:text-white shrink-0" aria-label={unread > 0 ? `${unread} jobs in flight` : 'Library'} onClick={() => onNotify?.()}>
              <Bell size={16} />
              {unread > 0 ? <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#F0C419]" /> : null}
            </button>
            <button type="button" className="touch-target grid place-items-center text-[#E8F0EA]/70 hover:text-white shrink-0" aria-label="Sign out" onClick={() => setConfirm(true)}>
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="glass-nav lg:hidden rounded-xl mb-2 flex items-center gap-2 px-2 py-1.5 safe-pad-x safe-pad-top shrink-0">
            <button type="button" className="touch-target grid place-items-center shrink-0" aria-label="Open menu" onClick={() => setDrawer(true)}>
              <Menu size={20} />
            </button>
            <BrandMark className="w-7 h-7 shrink-0" />
            <span className="text-sm font-bold tracking-tight flex-1 min-w-0 truncate">{BRAND.lockup}</span>
            <button type="button" className="relative touch-target grid place-items-center shrink-0" aria-label={unread > 0 ? `${unread} jobs in flight` : 'Library'} onClick={() => onNotify?.()}>
              <Bell size={18} />
              {unread > 0 ? <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#F0C419]" /> : null}
            </button>
          </header>

          <main id="studio-main" className="flex-1 min-h-0 overflow-y-auto scroll-touch pb-[calc(var(--tab-bar-h)+var(--safe-bottom)+0.5rem)] lg:pb-0">
            <div className="main-pad">
              <div className="content-canvas">{children}</div>
            </div>
          </main>

          <nav className="glass-tabbar lg:hidden fixed bottom-0 inset-x-0 z-20 grid grid-cols-5 safe-pad-x safe-pad-bottom">
            {PRIMARY.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => nav(item.id)}
                  className="min-h-[52px] min-w-0 w-full flex flex-col items-center justify-center gap-0.5 px-0.5 active:scale-95"
                >
                  <span className={`rounded-md p-1 shrink-0 ${active ? 'bg-primary/10 text-[#0E1F1A]' : 'text-[#5A6B7D]'}`}>
                    <Icon size={18} strokeWidth={active ? 2 : 1.75} />
                  </span>
                  <span className={`text-[10px] font-medium max-w-full truncate ${active ? 'text-[#0E1F1A]' : 'text-[#5A6B7D]'}`}>{item.label}</span>
                </button>
              );
            })}
            <button type="button" onClick={() => setDrawer(true)} className="min-h-[52px] min-w-0 w-full flex flex-col items-center justify-center gap-0.5 px-0.5 active:scale-95 text-[#5A6B7D]">
              <MoreHorizontal size={18} />
              <span className="text-[10px] font-medium truncate max-w-full">More</span>
            </button>
          </nav>
        </div>
      </div>

      {drawer ? (
        <div className="lg:hidden fixed inset-0 z-40">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close menu" onClick={() => setDrawer(false)} />
          <aside
            ref={drawerRef}
            className="relative h-full w-[min(20rem,88vw)] bg-[#0E1F1A] animate-fade-in flex flex-col overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Studio menu"
          >
            <div className="flex items-center justify-between px-4 py-4 safe-pad-top gap-2 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <BrandMark className="w-9 h-9 shrink-0" />
                <span className="text-sm font-bold text-white truncate">{BRAND.lockup}</span>
              </div>
              <button type="button" className="touch-target grid place-items-center text-white shrink-0" aria-label="Close" onClick={() => setDrawer(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-3 flex-1">
              <NavLinks view={view} onNav={nav} />
            </nav>
            <div className="mt-auto border-t border-white/[0.08] p-3 safe-pad-bottom">
              <button type="button" className="sidebar-nav-link" onClick={() => { setDrawer(false); setConfirm(true); }}>
                <LogOut size={18} strokeWidth={1.5} />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      <ConfirmationModal
        open={confirm}
        title="Sign out of the studio?"
        body="You can sign back in with the same email."
        confirmLabel="Sign out"
        destructive
        onClose={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); onSignOut(); }}
      />
    </div>
  );
}
