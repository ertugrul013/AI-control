import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { ActionList, ApproveButton, DeleteSystemButton } from '@/components/system-controls';
import { SystemForm } from '@/components/system-form';
import { TierBadge } from '@/components/tier-badge';
import { Button } from '@/components/ui/button';
import { classify, diffAnswers } from '@/domain/classification/engine';
import { actionTitle, questions, roleQuestion, ruleInfo } from '@/domain/classification/rules';
import { asEntity } from '@/lib/entity';
import { formatDate, isoDate } from '@/lib/utils';
import { authorize } from '@/server/authorize';
import { getSystem } from '@/server/services/systems';
import { listUsers } from '@/server/services/users';
import { requirePage } from '@/server/session';

const HISTORY_KEYS = [
  'AiSystem_CREATE',
  'AiSystem_UPDATE',
  'RiskAssessment_CREATE',
  'RiskAssessment_APPROVE',
  'Action_CREATE',
  'Action_UPDATE',
] as const;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ compare?: string }>;
}

export default async function SystemPage({ params, searchParams }: Props) {
  const user = await requirePage('systems:read');
  const [{ id }, { compare }] = await Promise.all([params, searchParams]);
  const system = await getSystem(id);
  if (!system) notFound();

  const can = {
    write: authorize(user.role, 'systems:write'),
    assess: authorize(user.role, 'assessments:write'),
    approve: authorize(user.role, 'assessments:approve'),
    remove: authorize(user.role, 'systems:delete'),
    actions: authorize(user.role, 'actions:write'),
  };
  const [t, te, tc, locale, users] = await Promise.all([
    getTranslations('systems'),
    getTranslations('enums'),
    getTranslations('common'),
    getLocale(),
    can.write ? listUsers() : [],
  ]);

  const [latest, ...older] = system.assessments;
  const tier = latest?.resultTier ?? 'NONE';
  const rationale = latest ? (latest.rationale as string[]) : [];
  const result = latest?.parsed ? classify(latest.parsed, system.dataCategories) : null;

  // Assessment diff: the latest version against the chosen (default: previous) version.
  const other = older.find((a) => String(a.version) === compare) ?? older[0];
  const changed = latest?.parsed && other?.parsed ? diffAnswers(other.parsed, latest.parsed) : null;
  const answerText = (answers: NonNullable<typeof latest>['parsed'], questionId: string) =>
    questionId === 'role'
      ? roleQuestion.options[answers!.role][locale]
      : answers!.answers[questionId]
        ? tc('yes')
        : tc('no');

  const facts = [
    [t('vendor'), system.vendor],
    [t('owner'), system.owner.name],
    [t('department'), system.department],
    [t('status'), te(`status.${system.status}`)],
    [t('usageType'), te(`usageType.${system.usageType}`)],
    [t('userGroup'), te(`userGroup.${system.userGroup}`)],
    [t('dataCategories'), system.dataCategories.map((c) => te(`dataCategory.${c}`)).join(', ')],
    [t('nextReview'), formatDate(system.nextReviewDate, locale)],
    [t('description'), system.description],
    [t('purpose'), system.purpose],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="grid content-start gap-6">
        <div>
          <p className="text-xs">
            <Link href="/systems">{t('title')}</Link>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1>{system.name}</h1>
            <TierBadge tier={tier} className="text-base font-semibold" />
          </div>
          <p className="mt-1">
            {!latest
              ? t('notAssessed')
              : latest.approvedAt
                ? t('assessedApproved', {
                    version: latest.version,
                    date: formatDate(latest.approvedAt, locale),
                    name: latest.approvedBy?.name ?? '—',
                  })
                : t('assessedPending', { version: latest.version, name: latest.assessedBy.name })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {can.assess && (
              <Button asChild variant={latest ? 'secondary' : 'primary'}>
                <Link href={`/systems/${system.id}/assess`}>{latest ? t('reclassify') : t('classify')}</Link>
              </Button>
            )}
            {can.approve && latest && !latest.approvedAt && <ApproveButton assessmentId={latest.id} />}
            {can.write && (
              <SystemForm
                users={users.map(({ id, name }) => ({ id, name }))}
                system={{ ...system, nextReviewDate: isoDate(system.nextReviewDate) }}
                trigger={<Button variant="secondary">{tc('edit')}</Button>}
              />
            )}
            {can.remove && <DeleteSystemButton id={system.id} name={system.name} />}
          </div>
        </div>

        <dl className="border-rule grid gap-x-6 border-t pt-4 sm:grid-cols-[10rem_1fr]">
          {facts.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted py-1">{label}</dt>
              <dd className="py-1">{value || '—'}</dd>
            </div>
          ))}
        </dl>

        {latest && (
          <section className="border-rule border-t pt-4">
            <h2>{t('why', { tier: te(`tierLower.${tier}`) })}</h2>
            <ul className="mt-2 grid gap-1.5">
              {rationale.map((ruleId) => {
                const rule = ruleInfo(ruleId);
                return (
                  <li key={ruleId}>
                    {rule.text[locale]}
                    {rule.article && <span className="text-muted"> ({rule.article})</span>}
                  </li>
                );
              })}
            </ul>
            {result?.applicableFrom && (
              <p className="mt-2">
                {t('applicableFrom', { date: formatDate(result.applicableFrom, locale) })}
              </p>
            )}
            <p className="text-muted mt-2 text-xs">{t('indicative')}</p>
          </section>
        )}

        <section className="border-rule border-t pt-4">
          <h2>{t('actions')}</h2>
          <ActionList
            systemId={system.id}
            canWrite={can.actions}
            actions={system.actions.map((a) => ({
              id: a.id,
              title: actionTitle(a, locale),
              done: a.status === 'DONE',
              due: formatDate(a.dueDate, locale),
              assignee: a.assignee.name,
            }))}
          />
        </section>

        {system.assessments.length > 0 && (
          <section className="border-rule border-t pt-4">
            <h2>{t('assessmentHistory')}</h2>
            <div className="mt-2 overflow-x-auto">
              <table className="data">
                <thead>
                  <tr>
                    <th scope="col">{t('version')}</th>
                    <th scope="col">{t('date')}</th>
                    <th scope="col">{t('tier')}</th>
                    <th scope="col">{t('assessedBy')}</th>
                    <th scope="col">{t('approvedBy')}</th>
                    <th scope="col">
                      <span className="sr-only">{t('compare')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {system.assessments.map((a) => (
                    <tr key={a.id}>
                      <td>v{a.version}</td>
                      <td>{formatDate(a.createdAt, locale)}</td>
                      <td>
                        <TierBadge tier={a.resultTier} />
                      </td>
                      <td>{a.assessedBy.name}</td>
                      <td>{a.approvedBy?.name ?? t('notApproved')}</td>
                      <td>
                        {a.id !== latest.id && (
                          <Link href={`/systems/${system.id}?compare=${a.version}#diff`}>{t('compare')}</Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {changed && other && (
              <div id="diff" className="mt-4">
                <h3>{t('diffTitle', { from: other.version, to: latest.version })}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-2">
                  {other.resultTier === latest.resultTier ? (
                    <>
                      {t('tierUnchanged')} <TierBadge tier={latest.resultTier} />
                    </>
                  ) : (
                    <>
                      {t('tierChanged')} <TierBadge tier={other.resultTier} /> {t('to')}{' '}
                      <TierBadge tier={latest.resultTier} className="font-semibold" />
                    </>
                  )}
                </p>
                {changed.length === 0 ? (
                  <p className="text-muted mt-2">{t('noChangedAnswers')}</p>
                ) : (
                  <table className="data mt-2">
                    <thead>
                      <tr>
                        <th scope="col">{t('question')}</th>
                        <th scope="col">v{other.version}</th>
                        <th scope="col">v{latest.version}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changed.map((questionId) => (
                        <tr key={questionId}>
                          <td>
                            {questionId === 'role'
                              ? roleQuestion.text[locale]
                              : questions.find((q) => q.id === questionId)?.text[locale]}
                          </td>
                          <td>{answerText(other.parsed, questionId)}</td>
                          <td className="font-semibold">{answerText(latest.parsed, questionId)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      <aside className="border-rule lg:border-l lg:pl-6">
        <h2>{t('history')}</h2>
        <ol className="mt-2 grid gap-2 text-xs">
          {system.history.map((entry) => {
            const key = HISTORY_KEYS.find((k) => k === `${entry.entityType}_${entry.action}`);
            const diff = entry.diff as Record<string, unknown>;
            return (
              <li key={entry.id} className="flex gap-3">
                <span className="w-24 shrink-0">{formatDate(entry.timestamp, locale)}</span>
                <span>
                  {key
                    ? t(`historyEvent.${key}`, {
                        version: String(diff.version ?? ''),
                        fields: Object.keys(diff).join(', '),
                        title: String(diff.title ?? ''),
                      })
                    : `${te(`entity.${asEntity(entry.entityType)}`)}: ${te(`auditAction.${entry.action}`)}`}
                  <span className="text-muted block">{entry.actor?.name ?? t('bySystem')}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
