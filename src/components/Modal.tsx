import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  narrow?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  subtitle,
  onClose,
  children,
  narrow = false,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const previousActiveElement = useRef(document.activeElement as HTMLElement | null);

  onCloseRef.current = onClose;

  useEffect(() => {
    const prevActive = previousActiveElement.current;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button initially
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled):not([tabindex="-1"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter(el => el.getClientRects().length > 0);

      if (!focusable.length) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (prevActive && prevActive.isConnected) {
        window.requestAnimationFrame(() => {
          if (!backdropRef.current?.isConnected) {
            prevActive.focus();
          }
        });
      }
    };
  }, []);

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onMouseDown={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={panelRef}
        className={`modal-panel ${narrow ? 'modal-narrow' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            ref={closeBtnRef}
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
};
