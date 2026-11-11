'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { useApi } from '@/lib/api';
import { Button } from './ui/button';
import { Field, Input } from './ui/form';

export function PasswordForm() {
  const t = useTranslations('login');
  const router = useRouter();
  const call = useApi();
  const [mismatch, setMismatch] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get('password') !== form.get('confirm')) return setMismatch(true);
    setMismatch(false);
    const done = await call(
      '/me/password',
      'POST',
      { currentPassword: form.get('currentPassword'), password: form.get('password') },
      t('changed'),
    );
    if (done) router.push('/');
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label={t('currentPassword')}>
        <Input name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field label={t('newPassword')} hint={t('passwordHint')}>
        <Input name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <Field label={t('confirmPassword')}>
        <Input name="confirm" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      {mismatch && (
        <p role="alert" className="border-prohibited border-l-4 pl-3">
          {t('mismatch')}
        </p>
      )}
      <Button type="submit">{t('changeSubmit')}</Button>
    </form>
  );
}
