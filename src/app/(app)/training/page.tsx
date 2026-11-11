import { Circle, CircleCheck, CircleDot } from 'lucide-react';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { AssignForm } from '@/components/training-controls';
import { formatDate } from '@/lib/utils';
import { authorize } from '@/server/authorize';
import { acknowledgement, currentPolicy } from '@/server/services/policy';
import { listAssignments, listModules } from '@/server/services/training';
import { listUsers } from '@/server/services/users';
import { requirePage } from '@/server/session';

type Status = 'notStarted' | 'inProgress' | 'done';

const statusIcon = { notStarted: Circle, inProgress: CircleDot, done: CircleCheck };

const statusOf = (a: { completedAt: Date | null; score: number | null }): Status =>
  a.completedAt ? 'done' : a.score !== null ? 'inProgress' : 'notStarted';

export default async function TrainingPage() {
  const user = await requirePage('training:read');
  const overview = authorize(user.role, 'training:overview');
  const manage = authorize(user.role, 'training:manage');
  const locale = await getLocale();
  const [t, te, mine, policy, acknowledged, modules, all, users] = await Promise.all([
    getTranslations('training'),
    getTranslations('enums'),
    listAssignments(user.id),
    currentPolicy(locale),
    acknowledgement(user.id),
    overview ? listModules() : [],
    overview ? listAssignments() : [],
    manage ? listUsers() : [],
  ]);
  const title = (m: { titleNl: string; titleEn: string }) => (locale === 'nl' ? m.titleNl : m.titleEn);

  // The to-do list: assigned modules plus the policy acknowledgement, each with a status.
  const tasks: { key: string; href: string; label: string; detail: string; status: Status }[] = [
    ...mine.map((a) => ({
      key: a.id,
      href: `/training/${a.module.slug}`,
      label: title(a.module),
      detail: a.completedAt
        ? t('completedOn', { date: formatDate(a.completedAt, locale), score: a.score ?? 0 })
        : t('dueOn', { date: formatDate(a.dueDate, locale), minutes: a.module.estimatedMinutes }),
      status: statusOf(a),
    })),
    ...(policy
      ? [
          {
            key: 'policy',
            href: '/policy',
            label: t('policyTask'),
            detail: acknowledged
              ? t('acknowledgedOn', { date: formatDate(acknowledged.acknowledgedAt, locale) })
              : t('policyTaskDetail', { version: policy.version }),
            status: acknowledged ? ('done' as const) : ('notStarted' as const),
          },
        ]
      : []),
  ];
  const open = tasks.filter((task) => task.status !== 'done').length;

  return (
    <div className="grid gap-6">
      <div>
        <h1>{t('title')}</h1>
        <p className="mt-1">
          {tasks.length === 0 ? t('noTasks') : t('summary', { open, total: tasks.length })}
        </p>
      </div>

      {tasks.length > 0 && (
        <ul className="border-rule border-t">
          {tasks.map((task) => {
            const Icon = statusIcon[task.status];
            return (
              <li
                key={task.key}
                className="border-rule flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b py-3"
              >
                <div>
                  <Link href={task.href} className="font-semibold">
                    {task.label}
                  </Link>
                  <p className="text-muted text-xs">{task.detail}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Icon size={16} aria-hidden />
                  {t(`status.${task.status}`)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {overview && (
        <>
          <section>
            <h2>{t('modules')}</h2>
            <div className="mt-2 overflow-x-auto">
              <table className="data">
                <thead>
                  <tr>
                    <th scope="col">{t('module')}</th>
                    <th scope="col">{t('audience')}</th>
                    <th scope="col">{t('minutes')}</th>
                    <th scope="col">{t('completed')}</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((m) => {
                    const assigned = all.filter((a) => a.moduleId === m.id);
                    return (
                      <tr key={m.id}>
                        <td>
                          <Link href={`/training/${m.slug}`}>{title(m)}</Link>
                        </td>
                        <td>{te(`audience.${m.audience}`)}</td>
                        <td>{m.estimatedMinutes}</td>
                        <td>
                          {assigned.filter((a) => a.completedAt).length}/{assigned.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {manage && (
            <section>
              <h2>{t('assign')}</h2>
              <AssignForm
                modules={modules.map((m) => ({ id: m.id, title: title(m), audience: m.audience }))}
                users={users.map(({ id, name }) => ({ id, name }))}
              />
            </section>
          )}

          <section>
            <h2>{t('assignments')}</h2>
            {all.length === 0 ? (
              <p className="text-muted mt-2">{t('noAssignments')}</p>
            ) : (
              <div className="mt-2 overflow-x-auto">
                <table className="data">
                  <thead>
                    <tr>
                      <th scope="col">{t('employee')}</th>
                      <th scope="col">{t('department')}</th>
                      <th scope="col">{t('module')}</th>
                      <th scope="col">{t('due')}</th>
                      <th scope="col">{t('statusLabel')}</th>
                      <th scope="col">{t('score')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {all.map((a) => (
                      <tr key={a.id}>
                        <td>{a.user.name}</td>
                        <td>{a.user.department}</td>
                        <td>{title(a.module)}</td>
                        <td>{formatDate(a.dueDate, locale)}</td>
                        <td>{t(`status.${statusOf(a)}`)}</td>
                        <td>{a.score === null ? '—' : `${a.score}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
