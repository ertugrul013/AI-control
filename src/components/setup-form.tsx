'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { FormEvent } from 'react';
import { useApi } from '@/lib/api';
import { Button } from './ui/button';
import { Field, Input, Select } from './ui/form';

export function SetupForm() {
  const t = useTranslations('setup');
  const ts = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();
  const call = useApi();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const done = await call(
      '/setup',
      'POST',
      {
        organization: {
          name: form.get('name'),
          sector: form.get('sector'),
          employeeCount: Number(form.get('employeeCount')),
          country: form.get('country'),
          defaultLocale: form.get('defaultLocale'),
        },
        admin: {
          name: form.get('adminName'),
          email: form.get('adminEmail'),
          password: form.get('adminPassword'),
        },
      },
      t('done'),
    );
    if (done) router.push('/login');
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <h2>{t('organization')}</h2>
      <Field label={ts('orgName')}>
        <Input name="name" required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={ts('sector')}>
          <Input name="sector" />
        </Field>
        <Field label={ts('employeeCount')}>
          <Input name="employeeCount" type="number" min={1} defaultValue={50} required />
        </Field>
        <Field label={ts('country')}>
          <Input name="country" defaultValue={locale === 'nl' ? 'Nederland' : 'Netherlands'} />
        </Field>
        <Field label={ts('defaultLocale')}>
          <Select name="defaultLocale" defaultValue={locale}>
            <option value="nl">Nederlands</option>
            <option value="en">English</option>
          </Select>
        </Field>
      </div>
      <h2 className="mt-2">{t('admin')}</h2>
      <Field label={ts('userName')}>
        <Input name="adminName" autoComplete="name" required />
      </Field>
      <Field label={ts('email')}>
        <Input name="adminEmail" type="email" autoComplete="username" required />
      </Field>
      <Field label={ts('password')} hint={ts('passwordHint')}>
        <Input name="adminPassword" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <Button type="submit">{t('submit')}</Button>
    </form>
  );
}
