import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from './utils';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  maxWidth?: string; // Optional: allows per-modal customization
}

export function Modal({ open, onOpenChange, children, maxWidth = 'max-w-md' }: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-1.5rem)] -translate-x-1/2 -translate-y-1/2 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            maxWidth,
          )}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface ModalContentProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalContent({ className, children }: ModalContentProps) {
  return (
    <div className={cn(
      "w-full max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200/80 bg-white p-6 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.22)] animate-in fade-in-0 zoom-in-95 duration-300",
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
    <DialogPrimitive.Title className={cn("text-lg font-semibold leading-tight tracking-normal", className)}>
      {children}
    </DialogPrimitive.Title>
  );
}

interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalDescription({ children, className }: ModalDescriptionProps) {
  return (
    <DialogPrimitive.Description className={cn("text-muted-foreground text-sm leading-relaxed", className)}>
      {children}
    </DialogPrimitive.Description>
  );
}
