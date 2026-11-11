import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded px-3 text-sm font-semibold whitespace-nowrap no-underline transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-action text-action-ink hover:opacity-90',
        secondary: 'border-rule bg-paper text-ink hover:bg-shelf border',
        ghost: 'text-action hover:bg-shelf',
        danger: 'border-prohibited text-prohibited hover:bg-shelf border',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />;
}
