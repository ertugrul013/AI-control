import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { RiskStrip } from '@/components/risk-strip';
import { TierBadge } from '@/components/tier-badge';
import { actionTitle } from '@/domain/classification/rules';
import { TIERS_AND_NONE, type TierOrNone } from '@/lib/enums';
import { asEntity } from '@/lib/entity';
import { formatDate, pct } from '@/lib/utils';
import { getDashboard } from '@/server/services/dashboard';
import { requirePage } from '@/server/session';

const tierColor: Record<TierOrNone, string> = {
  PROHIBITED: 'var(--prohibited)',
  HIGH: 'var(--high)',
  LIMITED: 'var(--limited)',
  MINIMAL: 'var(--minimal)',
  NONE: 'var(--unassessed)',
};

export default async function DashboardPage() {
  // Employees have no dashboard: their start page is the to-do list.
  await requirePage('dashboard:read', '/training');
  const [d, t, tEnums, locale] = await Promise.all([
    getDashboard(),
    getTranslations('dashboard'),
    getTranslations('enums'),
    getLocale(),
  ]);

  if (d.total === 0) {
    return (
      <div className="grid gap-3">
        <h1>{t('title')}</h1>
        <p>
          {t('empty')} <Link href="/systems">{t('emptyLink')}</Link>
        </p>
      </div>
    );
  }

  const coverage = [
    { label: t('assessed'), value: d.coverage.assessed },
    { label: t('trained'), value: d.coverage.trained },
    { label: t('policySigned'), value: d.coverage.policy },
  ];
  const heatMax = Math.max(1, ...d.departmentTiers.flatMap((row) => Object.values(row.counts)));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="sr-only">{t('title')}</h1>
        <p className="text-xl font-semibold">
          {t('summary', { count: d.total, action: d.needAction, unassessed: d.counts.NONE })}
        </p>
        {d.countdown && (
          <p className="mt-1">
            {d.countdown.days > 0
              ? t('countdown', { date: formatDate(d.countdown.date, locale), days: d.countdown.days })
              : t('countdownPast', { date: formatDate(d.countdown.date, locale) })}
          </p>
        )}
      </div>

      <RiskStrip systems={d.strip} counts={d.counts} label={t('stripLabel')} />

      <div className="border-rule grid border-t md:grid-cols-2">
        <section className="border-rule py-4 md:border-r md:pr-6">
          <h2>{t('attention')}</h2>
          {d.toApprove.length + d.openActions.length + d.overdueReviews === 0 ? (
            <p className="text-muted mt-2">{t('nothing')}</p>
          ) : (
            <ul className="mt-2 grid gap-1.5">
              {d.toApprove.map((system) => (
                <li key={system.id}>
                  <Link href={`/systems/${system.id}`}>{system.name}</Link>: {t('approve')}
                </li>
              ))}
              {d.openActions.slice(0, 5).map((action) => (
                <li key={action.id}>
                  <Link href={`/systems/${action.aiSystemId}`}>{action.systemName}</Link>:{' '}
                  {actionTitle(action, locale)}
                </li>
              ))}
              {d.openActions.length > 5 && (
                <li className="text-muted">{t('moreActions', { count: d.openActions.length - 5 })}</li>
              )}
              {d.overdueReviews > 0 && <li>{t('overdue', { count: d.overdueReviews })}</li>}
            </ul>
          )}
        </section>

        <section className="border-rule border-t py-4 md:border-t-0 md:pl-6">
          <h2>{t('coverage')}</h2>
          <table className="mt-2 w-full">
            <tbody>
              {coverage.map(({ label, value: [part, total] }) => (
                <tr key={label}>
                  <th scope="row" className="py-1 text-left font-normal">
                    {label}
                  </th>
                  <td className="py-1 text-right">
                    {part}/{total}
                  </td>
                  <td className="w-16 py-1 text-right font-semibold">{pct(part, total)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="border-rule border-t py-4 md:border-r md:pr-6">
          <h2>{t('departmentTier')}</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th scope="col" className="py-1 pr-2 text-left font-semibold">
                    {t('department')}
                  </th>
                  {TIERS_AND_NONE.map((tier) => (
                    <th key={tier} scope="col" className="px-1 py-1 text-left font-semibold">
                      <TierBadge tier={tier} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.departmentTiers.map((row) => (
                  <tr key={row.department} className="border-rule border-t">
                    <th scope="row" className="py-1 pr-2 text-left font-normal">
                      {row.department}
                    </th>
                    {TIERS_AND_NONE.map((tier) => (
                      <td
                        key={tier}
                        className="px-2 py-1"
                        // The heat: more systems of a tier in a department gives a stronger tint.
                        style={{
                          background: `color-mix(in srgb, ${tierColor[tier]} ${Math.round((row.counts[tier] / heatMax) * 45)}%, transparent)`,
                        }}
                      >
                        {row.counts[tier]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-rule border-t py-4 md:pl-6">
          <h2>{t('upcoming')}</h2>
          {d.upcomingReviews.length === 0 ? (
            <p className="text-muted mt-2">{t('noReviews')}</p>
          ) : (
            <ul className="mt-2 grid gap-1.5">
              {d.upcomingReviews.map((review) => (
                <li key={review.id} className="flex gap-3">
                  <span className="w-24 shrink-0">{formatDate(review.date, locale)}</span>
                  <Link href={`/systems/${review.id}`}>{review.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-rule border-t py-4 md:border-r md:pr-6">
          <h2>{t('trainingByDepartment')}</h2>
          {d.trainingByDepartment.length === 0 ? (
            <p className="text-muted mt-2">{t('noTraining')}</p>
          ) : (
            <table className="mt-2 w-full">
              <tbody>
                {d.trainingByDepartment.map((row) => (
                  <tr key={row.department}>
                    <th scope="row" className="py-1 text-left font-normal">
                      {row.department}
                    </th>
                    <td className="py-1 text-right">
                      {row.done}/{row.total}
                    </td>
                    <td className="w-16 py-1 text-right font-semibold">{pct(row.done, row.total)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="border-rule border-t py-4 md:pl-6">
          <h2>{t('recent')}</h2>
          <ul className="mt-2 grid gap-1.5">
            {d.recent.map((entry) => (
              <li key={entry.id} className="flex gap-3">
                <span className="w-24 shrink-0">{formatDate(entry.timestamp, locale)}</span>
                <span>
                  {tEnums(`entity.${asEntity(entry.entityType)}`)}: {tEnums(`auditAction.${entry.action}`)}
                  <span className="text-muted"> · {entry.actor?.name ?? t('system')}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
