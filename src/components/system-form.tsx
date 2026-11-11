'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useApi } from '@/lib/api';
import { DATA_CATEGORIES, SYSTEM_STATUSES, USAGE_TYPES, USER_GROUPS } from '@/lib/enums';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import { Choice, Choices, Field, Input, Select, Textarea } from './ui/form';

export interface SystemValues {
  id: string;
  name: string;
  vendor: string;
  description: string;
  purpose: string;
  department: string;
  ownerId: string;
  usageType: (typeof USAGE_TYPES)[number];
  dataCategories: (typeof DATA_CATEGORIES)[number][];
  userGroup: (typeof USER_GROUPS)[number];
  status: (typeof SYSTEM_STATUSES)[number];
  nextReviewDate: string;
}

interface Props {
  users: { id: string; name: string }[];
  /** Given: edit this system. Absent: add a new one. */
  system?: SystemValues;
  trigger: ReactNode;
}

export function SystemForm({ users, system, trigger }: Props) {
  const t = useTranslations('systems');
  const te = useTranslations('enums');
  const tc = useTranslations('common');
  const call = useApi();
  const [open, setOpen] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      ...Object.fromEntries(
        [
          'name',
          'vendor',
          'description',
          'purpose',
          'department',
          'ownerId',
          'usageType',
          'userGroup',
          'status',
        ].map((field) => [field, form.get(field)]),
      ),
      dataCategories: form.getAll('dataCategories'),
      nextReviewDate: form.get('nextReviewDate') || null,
    };
    const saved = system
      ? await call(`/systems/${system.id}`, 'PATCH', body, t('saved'))
      : await call('/systems', 'POST', body, t('added'));
    if (saved) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} trigger={trigger} title={system ? t('edit') : t('add')}>
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('name')}>
            <Input name="name" defaultValue={system?.name} required />
          </Field>
          <Field label={t('vendor')}>
            <Input name="vendor" defaultValue={system?.vendor} />
          </Field>
        </div>
        <Field label={t('description')}>
          <Textarea name="description" rows={2} defaultValue={system?.description} />
        </Field>
        <Field label={t('purpose')} hint={t('purposeHint')}>
          <Textarea name="purpose" rows={2} defaultValue={system?.purpose} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('department')}>
            <Input name="department" defaultValue={system?.department} />
          </Field>
          <Field label={t('owner')}>
            <Select name="ownerId" defaultValue={system?.ownerId}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('usageType')}>
            <Select name="usageType" defaultValue={system?.usageType}>
              {USAGE_TYPES.map((value) => (
                <option key={value} value={value}>
                  {te(`usageType.${value}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('userGroup')}>
            <Select name="userGroup" defaultValue={system?.userGroup}>
              {USER_GROUPS.map((value) => (
                <option key={value} value={value}>
                  {te(`userGroup.${value}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('status')}>
            <Select name="status" defaultValue={system?.status}>
              {SYSTEM_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {te(`status.${value}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('nextReview')}>
            <Input name="nextReviewDate" type="date" defaultValue={system?.nextReviewDate} />
          </Field>
        </div>
        <Choices legend={t('dataCategories')}>
          {DATA_CATEGORIES.map((value) => (
            <Choice
              key={value}
              type="checkbox"
              name="dataCategories"
              value={value}
              defaultChecked={system?.dataCategories.includes(value)}
              label={te(`dataCategory.${value}`)}
            />
          ))}
        </Choices>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            {tc('cancel')}
          </Button>
          <Button type="submit">{tc('save')}</Button>
        </div>
      </form>
    </Dialog>
  );
}
