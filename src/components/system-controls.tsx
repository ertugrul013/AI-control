'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { FormEvent } from 'react';
import { useApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Field, Input } from './ui/form';

export function ApproveButton({ assessmentId }: { assessmentId: string }) {
  const t = useTranslations('systems');
  const call = useApi();
  return (
    <Button onClick={() => call(`/assessments/${assessmentId}/approve`, 'POST', undefined, t('approved'))}>
      {t('approve')}
    </Button>
  );
}

export function DeleteSystemButton({ id, name }: { id: string; name: string }) {
  const t = useTranslations('systems');
  const call = useApi();
  const router = useRouter();
  return (
    <Button
      variant="danger"
      onClick={async () => {
        if (!window.confirm(t('deleteConfirm', { name }))) return;
        if (await call(`/systems/${id}`, 'DELETE', undefined, t('deleted'))) router.push('/systems');
      }}
    >
      {t('delete')}
    </Button>
  );
}

interface ActionListProps {
  systemId: string;
  canWrite: boolean;
  actions: { id: string; title: string; done: boolean; due: string; assignee: string }[];
}

export function ActionList({ systemId, canWrite, actions }: ActionListProps) {
  const t = useTranslations('systems');
  const call = useApi();

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const created = await call(
      '/actions',
      'POST',
      { aiSystemId: systemId, title: data.get('title'), description: '', dueDate: data.get('dueDate') },
      t('actionAdded'),
    );
    if (created) form.reset();
  }

  return (
    <div className="mt-2 grid gap-3">
      {actions.length === 0 ? (
        <p className="text-muted">{t('noActions')}</p>
      ) : (
        <ul className="grid gap-1.5">
          {actions.map((action) => (
            <li key={action.id}>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 shrink-0"
                  checked={action.done}
                  disabled={!canWrite}
                  onChange={(e) =>
                    call(
                      `/actions/${action.id}`,
                      'PATCH',
                      { status: e.target.checked ? 'DONE' : 'OPEN' },
                      e.target.checked ? t('actionDone') : t('actionReopened'),
                    )
                  }
                />
                <span>
                  <span className={cn(action.done && 'text-muted line-through')}>{action.title}</span>
                  <span className="text-muted block text-xs">
                    {action.done ? t('done') : t('dueBy', { date: action.due, name: action.assignee })}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {canWrite && (
        <form onSubmit={add} className="flex flex-wrap items-end gap-2">
          <Field label={t('newAction')} className="min-w-52 flex-1">
            <Input name="title" required maxLength={200} />
          </Field>
          <Field label={t('dueDate')}>
            <Input name="dueDate" type="date" required />
          </Field>
          <Button type="submit" variant="secondary">
            {t('addAction')}
          </Button>
        </form>
      )}
    </div>
  );
}
