import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const control = 'border-rule bg-paper text-ink w-full rounded border px-2.5 text-sm';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(control, 'h-8', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(control, 'py-1.5', className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(control, 'h-8', className)} {...props} />;
}

/** A labelled control: the label wraps the control, so they are linked without ids. */
export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn('grid content-start gap-1', className)}>
      <span className="font-semibold">{label}</span>
      {children}
      {hint && <span className="text-muted text-xs">{hint}</span>}
    </label>
  );
}

/** A group of checkboxes or radio buttons with one question above it. */
export function Choices({ legend, hint, children }: { legend: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-1">
      <legend className="mb-1 font-semibold">{legend}</legend>
      {hint && <p className="text-muted text-xs">{hint}</p>}
      {children}
    </fieldset>
  );
}

export function Choice({ label, ...props }: ComponentProps<'input'> & { label: string }) {
  return (
    <label className="flex items-start gap-2">
      <input className="mt-0.5 shrink-0" {...props} />
      <span>{label}</span>
    </label>
  );
}
