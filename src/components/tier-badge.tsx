import { useTranslations } from 'next-intl';
import type { TierOrNone } from '@/lib/enums';
import { cn } from '@/lib/utils';

export const tierClass: Record<TierOrNone, string> = {
  PROHIBITED: 'bg-prohibited',
  HIGH: 'bg-high',
  LIMITED: 'bg-limited',
  MINIMAL: 'bg-minimal',
  NONE: 'hatch border border-muted',
};

/** Tier colour never stands alone: the swatch always comes with the tier name. */
export function TierBadge({ tier, className }: { tier: TierOrNone; className?: string }) {
  const t = useTranslations('tier');
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', className)}>
      <span aria-hidden className={cn('size-2.5 shrink-0', tierClass[tier])} />
      {t(tier)}
    </span>
  );
}
