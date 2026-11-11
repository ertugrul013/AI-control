import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { OrganizationForm, UsersPanel } from '@/components/settings-controls';
import { asEntity } from '@/lib/entity';
import { AUDIT_PAGE_SIZE, listAuditLog } from '@/server/services/export';
import { getOrganization } from '@/server/services/organization';
import { listUsers } from '@/server/services/users';
import { requirePage } from '@/server/session';

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePage('settings:manage');
  const page = Math.max(0, Number((await searchParams).page) || 0);
  const [t, te, locale, organization, users, entries] = await Promise.all([
    getTranslations('settings'),
    getTranslations('enums'),
    getLocale(),
    getOrganization(),
    listUsers(),
    listAuditLog(page),
  ]);
  const time = new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  });

  return (
    <div className="grid gap-8">
      <div>
        <h1>{t('title')}</h1>
        <p className="mt-1">{t('intro')}</p>
      </div>

      <section className="border-rule border-t pt-4">
        <h2>{t('organization')}</h2>
        <OrganizationForm organization={organization} />
      </section>

      <section className="border-rule border-t pt-4">
        <h2>{t('users')}</h2>
        <UsersPanel users={users} />
      </section>

      <section id="audit" className="border-rule border-t pt-4">
        <h2>{t('auditLog')}</h2>
        <p className="text-muted mt-1 text-xs">{t('auditIntro')}</p>
        <div className="mt-2 overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">{t('when')}</th>
                <th scope="col">{t('who')}</th>
                <th scope="col">{t('what')}</th>
                <th scope="col">{t('event')}</th>
                <th scope="col">{t('details')}</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, AUDIT_PAGE_SIZE).map((entry) => (
                <tr key={entry.id}>
                  <td className="whitespace-nowrap">{time.format(entry.timestamp)}</td>
                  <td>{entry.actor?.name ?? t('system')}</td>
                  <td>{te(`entity.${asEntity(entry.entityType)}`)}</td>
                  <td>{te(`auditAction.${entry.action}`)}</td>
                  <td className="max-w-md font-mono text-xs break-words">{JSON.stringify(entry.diff)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex gap-4">
          {page > 0 && <Link href={`/settings?page=${page - 1}#audit`}>{t('newer')}</Link>}
          {entries.length > AUDIT_PAGE_SIZE && (
            <Link href={`/settings?page=${page + 1}#audit`}>{t('older')}</Link>
          )}
        </p>
      </section>
    </div>
  );
}
