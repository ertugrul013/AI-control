import { getTranslations } from 'next-intl/server';
import { SystemsTable } from '@/components/systems-table';
import { isoDate } from '@/lib/utils';
import { authorize } from '@/server/authorize';
import { listSystems, tierOf } from '@/server/services/systems';
import { listUsers } from '@/server/services/users';
import { requirePage } from '@/server/session';

export default async function SystemsPage() {
  const user = await requirePage('systems:read');
  const canWrite = authorize(user.role, 'systems:write');
  const [systems, users, t] = await Promise.all([
    listSystems(),
    canWrite ? listUsers() : [],
    getTranslations('systems'),
  ]);
  const unassessed = systems.filter((s) => tierOf(s) === 'NONE').length;

  return (
    <div className="grid gap-4">
      <div>
        <h1>{t('title')}</h1>
        <p className="mt-1">
          {systems.length === 0 ? t('empty') : t('summary', { count: systems.length, unassessed })}
        </p>
      </div>
      <SystemsTable
        rows={systems.map((s) => ({
          id: s.id,
          name: s.name,
          vendor: s.vendor,
          department: s.department,
          owner: s.owner.name,
          tier: tierOf(s),
          status: s.status,
          nextReviewDate: isoDate(s.nextReviewDate),
        }))}
        users={users.map(({ id, name }) => ({ id, name }))}
        canWrite={canWrite}
      />
    </div>
  );
}
