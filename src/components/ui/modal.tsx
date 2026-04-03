import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from './utils';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  maxWidth?: string; // Optional: allows per-modal customization
}

export function Modal({ open, onOpenChange, children, maxWidth = 'max-w-md' }: ModalProps) {
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Wrapper - Viewport-safe width with per-modal maxWidth override */}
      <div className={cn("fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-1.5rem)]", maxWidth)}>
        {children}
      </div>
    </div>
  );
}

interface ModalContentProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalContent({ className, children }: ModalContentProps) {
  return (
    <div className={cn(
      "bg-background rounded-lg border shadow-lg p-6 w-full animate-in fade-in-0 zoom-in-95 duration-300",
      className
    )}>
      {children}
    </div>
  );
}

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
  return (
    <h2 className={cn("text-lg leading-none font-semibold", className)}>
      {children}
    </h2>
  );
}

interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalDescription({ children, className }: ModalDescriptionProps) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)}>
      {children}
    </p>
  );
}
