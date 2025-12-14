"use client";

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--color-background)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-border)',
        },
        className: 'shadow-lg',
      }}
      duration={4000}
    />
  );
}
