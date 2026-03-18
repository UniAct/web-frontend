// components/ui/modal.tsx
import * as React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { cn } from './utils';

const ModalContext = React.createContext<{ onClose: () => void } | null>(null);

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  // keep internal open state in sync with prop
  const [isOpen, setIsOpen] = React.useState(open);
  React.useEffect(() => setIsOpen(open), [open]);

  // Lock body scroll when modal open
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Escape to close
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  // Modal markup to be mounted into document.body (portal) to avoid stacking context problems
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-[10000] pointer-events-auto"
        onClick={() => onOpenChange(false)}
        data-testid="modal-overlay"
      />

      {/* Centered content wrapper (higher z) */}
      <div className="relative z-[10001] flex min-h-full w-full items-center justify-center px-4 sm:px-6">
        <ModalContext.Provider value={{ onClose: () => onOpenChange(false) }}>
          {children}
        </ModalContext.Provider>
      </div>
    </div>,
    // ensure portal target exists
    (document.body as HTMLElement)
  );
}

interface ModalContentProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalContent({ className, children }: ModalContentProps) {
  const modalContext = React.useContext(ModalContext);

  return (
    <div
      className={cn(
        "bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300 relative",
        className
      )}
    >
      {modalContext ? (
        <button
          onClick={modalContext.onClose}
          className="absolute right-4 top-4 inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
          aria-label="Close modal"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
      {children}
    </div>
  );
}

/* ModalHeader / ModalTitle / ModalDescription unchanged - keep them as-is */
interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}
export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 text-center sm:text-left mb-4", className)}>
      {children}
    </div>
  );
}

interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}
export function ModalTitle({ children, className }: ModalTitleProps) {
  return <h2 className={cn("text-lg leading-none font-semibold", className)}>{children}</h2>;
}

interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}
export function ModalDescription({ children, className }: ModalDescriptionProps) {
  return <p className={cn("text-muted-foreground text-sm", className)}>{children}</p>;
}
