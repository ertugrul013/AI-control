'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, trigger, title, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <RadixDialog.Content
          aria-describedby={undefined}
          className="border-rule bg-paper fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-md border p-5 shadow-lg"
        >
          <RadixDialog.Title className="mb-4 text-base font-semibold">{title}</RadixDialog.Title>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
