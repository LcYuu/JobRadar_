import React, { forwardRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/utils';

const Dialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="z-50 w-full max-w-lg bg-background p-6 shadow-lg rounded-lg">
        {children}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const DialogTrigger = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};

const DialogOverlay = ({ children, className, ...props }) => {
  return <div className={cn('fixed inset-0 bg-black/80', className)} {...props}>{children}</div>;
};

const DialogContent = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'z-50 max-w-lg w-full bg-background p-6 rounded-lg shadow-lg',
      className
    )}
    {...props}
  >
    {children}
  </div>
));

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);

const DialogFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);

const DialogTitle = forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
));

const DialogDescription = forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));

export {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
};
