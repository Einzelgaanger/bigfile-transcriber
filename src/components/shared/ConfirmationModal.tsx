import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useDialogChrome } from '../../hooks/useDialogChrome';

export default function ConfirmationModal({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  destructive,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  useDialogChrome(open, sheetRef, onClose);

  if (!open) return null;

  return (
    <div
      className="confirm-scrim animate-fade-in"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className="confirm-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1 rounded-full bg-[#0E1F1A]/15 mx-auto mb-4" />
        <h2 id="confirm-title" className="m-0 text-[13px] font-bold text-[#0E1F1A]">{title}</h2>
        {body ? <div className="text-[11px] font-medium text-[#5A6B7D] mt-2">{body}</div> : null}
        <div className="confirm-actions flex gap-2 mt-5">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`flex-1 min-h-[48px] rounded-2xl font-bold text-sm ${destructive ? 'bg-destructive text-white' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
