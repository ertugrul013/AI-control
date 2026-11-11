import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Markdown } from '@/components/markdown';
import { AcknowledgeButton } from '@/components/policy-controls';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { authorize } from '@/server/authorize';
import { acknowledgement, currentPolicy, listPolicies } from '@/server/services/policy';
import { requirePage } from '@/server/session';

export default async function PolicyPage() {
  const user = await requirePage('policy:read');
  const canWrite = authorize(user.role, 'policy:write');
  const locale = await getLocale();
  const [t, te, policies, current, acknowledged] = await Promise.all([
    getTranslations('policy'),
    getTranslations('enums'),
    listPolicies(canWrite),
    currentPolicy(locale),
    acknowledgement(user.id),
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <h1>{t('title')}</h1>
        <p className="mt-1">
          {!current
            ? t('none')
            : acknowledged
              ? t('acknowledgedOn', {
                  version: current.version,
                  date: formatDate(acknowledged.acknowledgedAt, locale),
                })
              : t('notAcknowledged', { version: current.version })}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {current && !acknowledged && <AcknowledgeButton policyId={current.id} />}
          {canWrite && (
            <Button asChild variant={current ? 'secondary' : 'primary'}>
              <Link href="/policy/wizard">{t('startWizard')}</Link>
            </Button>
          )}
        </div>
      </div>

      {current && (
        <section className="border-rule border-t pt-4">
          <p className="text-muted mb-3 text-xs">
            {t('currentVersion', { version: current.version, date: formatDate(current.publishedAt, locale) })}
          </p>
          <Markdown source={current.contentMarkdown} />
        </section>
      )}

      {policies.length > 0 && (
        <section className="border-rule border-t pt-4">
          <h2>{t('versions')}</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">{t('version')}</th>
                  <th scope="col">{t('policyTitle')}</th>
                  <th scope="col">{t('language')}</th>
                  <th scope="col">{t('status')}</th>
                  <th scope="col">{t('published')}</th>
                  <th scope="col">{t('acknowledgements')}</th>
                  <th scope="col">{t('download')}</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id}>
                    <td>v{policy.version}</td>
                    <td>
                      {policy.status === 'DRAFT' ? (
                        <Link href={`/policy/wizard?id=${policy.id}`}>{policy.title}</Link>
                      ) : (
                        policy.title
                      )}
                    </td>
                    <td>{policy.locale === 'nl' ? 'Nederlands' : 'English'}</td>
                    <td>{te(`policyStatus.${policy.status}`)}</td>
                    <td>{formatDate(policy.publishedAt, locale)}</td>
                    <td>{policy._count.acknowledgements}</td>
                    <td>
                      <a href={`/api/v1/policies/${policy.id}/export?format=pdf`}>PDF</a>
                      {' · '}
                      <a href={`/api/v1/policies/${policy.id}/export?format=md`}>Markdown</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
