import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { TIERS_AND_NONE, type TierOrNone } from '@/lib/enums';
import { cn } from '@/lib/utils';
import { TierBadge, tierClass } from './tier-badge';

interface Props {
  /** Sorted by tier, most severe first. */
  systems: { id: string; name: string; tier: TierOrNone }[];
  counts: Record<TierOrNone, number>;
  label: string;
}

/** The whole AI landscape in one bar: one equal segment per system, coloured by tier, gaps hatched. */
export function RiskStrip({ systems, counts, label }: Props) {
  const t = useTranslations('tier');
  return (
    <div>
      <ul aria-label={label} className="flex h-9 gap-0.5">
        {systems.map((system) => (
          <li key={system.id} className="min-w-1 flex-1">
            <Link
              href={`/systems/${system.id}`}
              title={`${system.name}: ${t(system.tier)}`}
              aria-label={`${system.name}: ${t(system.tier)}`}
              className={cn(
                'block h-full transition-opacity duration-150 ease-out hover:opacity-70',
                tierClass[system.tier],
              )}
            />
          </li>
        ))}
      </ul>
      <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs">
        {TIERS_AND_NONE.map((tier) => (
          <li key={tier} className="flex items-center gap-1.5">
            <TierBadge tier={tier} />
            <span className="font-semibold">{counts[tier]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
