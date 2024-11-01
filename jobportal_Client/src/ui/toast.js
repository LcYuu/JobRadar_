import React, { useState, useCallback } from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cn } from "../utils/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(function ToastViewport({ className, ...props }, ref) {
  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  );
});

const toastVariants = (variant) => {
  const baseClass =
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all";
  const variantClasses = {
    default: "border bg-background text-foreground",
    destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
    success: "border-green-500 bg-green-100 text-green-900",
    warning: "border-yellow-500 bg-yellow-100 text-yellow-900",
  };
  return `${baseClass} ${variantClasses[variant || "default"]}`;
};

const Toast = React.forwardRef(function Toast({ className, variant, ...props }, ref) {
  return (
    <ToastPrimitives.Root ref={ref} className={cn(toastVariants(variant), className)} {...props} />
  );
});

const ToastAction = React.forwardRef(function ToastAction({ className, ...props }, ref) {
  return (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

const ToastClose = React.forwardRef(function ToastClose({ className, ...props }, ref) {
  return (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  );
});

const ToastTitle = React.forwardRef(function ToastTitle({ className, ...props }, ref) {
  return (
    <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
  );
});

const ToastDescription = React.forwardRef(function ToastDescription({ className, ...props }, ref) {
  return (
    <ToastPrimitives.Description
      ref={ref}
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  );
});

function useToast() {
  const [open, setOpen] = useState(false);
  const [toastData, setToastData] = useState({ title: '', description: '', variant: 'default' });

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    setToastData({ title, description, variant });
    setOpen(true);
    setTimeout(() => setOpen(false), 3000);
  }, []);

  return { toast, open, toastData };
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  useToast,
};
