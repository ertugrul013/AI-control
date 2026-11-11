'use client';

import { useTranslations } from 'next-intl';
import type { FormEvent } from 'react';
import { useApi } from '@/lib/api';
import { ROLES, type Locale, type Role } from '@/lib/enums';
import { Button } from './ui/button';
import { Field, Input, Select } from './ui/form';

interface Organization {
  name: string;
  sector: string;
  employeeCount: number;
  country: string;
  defaultLocale: Locale;
}

export function OrganizationForm({ organization }: { organization: Organization }) {
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const call = useApi();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void call(
      '/organization',
      'PATCH',
      {
        name: form.get('name'),
        sector: form.get('sector'),
        employeeCount: Number(form.get('employeeCount')),
        country: form.get('country'),
        defaultLocale: form.get('defaultLocale'),
      },
      t('organizationSaved'),
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 grid max-w-2xl gap-4 sm:grid-cols-2">
      <Field label={t('orgName')}>
        <Input name="name" defaultValue={organization.name} required />
      </Field>
      <Field label={t('sector')}>
        <Input name="sector" defaultValue={organization.sector} />
      </Field>
      <Field label={t('employeeCount')}>
        <Input
          name="employeeCount"
          type="number"
          min={1}
          defaultValue={organization.employeeCount}
          required
        />
      </Field>
      <Field label={t('country')}>
        <Input name="country" defaultValue={organization.country} />
      </Field>
      <Field label={t('defaultLocale')}>
        <Select name="defaultLocale" defaultValue={organization.defaultLocale}>
          <option value="nl">Nederlands</option>
          <option value="en">English</option>
        </Select>
      </Field>
      <div className="self-end">
        <Button type="submit">{tc('save')}</Button>
      </div>
    </form>
  );
}

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  mustChangePassword: boolean;
}

export function UsersPanel({ users }: { users: User[] }) {
  const t = useTranslations('settings');
  const te = useTranslations('enums');
  const call = useApi();

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const created = await call('/users', 'POST', Object.fromEntries(data), t('userAdded'));
    if (created) form.reset();
  }

  function resetPassword(user: User) {
    const password = window.prompt(t('resetPrompt', { name: user.name }));
    if (password) void call(`/users/${user.id}`, 'PATCH', { password }, t('passwordReset'));
  }

  return (
    <div className="mt-2 grid gap-4">
      <div className="overflow-x-auto">
        <table className="data">
          <thead>
            <tr>
              <th scope="col">{t('userName')}</th>
              <th scope="col">{t('email')}</th>
              <th scope="col">{t('department')}</th>
              <th scope="col">{t('role')}</th>
              <th scope="col">{t('password')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.department}</td>
                <td>
                  <Select
                    aria-label={t('roleOf', { name: user.name })}
                    value={user.role}
                    onChange={(e) =>
                      call(`/users/${user.id}`, 'PATCH', { role: e.target.value }, t('roleChanged'))
                    }
                    className="w-40"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {te(`role.${role}`)}
                      </option>
                    ))}
                  </Select>
                </td>
                <td>
                  <button
                    type="button"
                    className="text-action cursor-pointer underline"
                    onClick={() => resetPassword(user)}
                  >
                    {t('reset')}
                  </button>
                  {user.mustChangePassword && (
                    <span className="text-muted block text-xs">{t('temporary')}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={add} className="grid max-w-3xl gap-3 sm:grid-cols-3">
        <h3 className="sm:col-span-3">{t('addUser')}</h3>
        <Field label={t('userName')}>
          <Input name="name" required />
        </Field>
        <Field label={t('email')}>
          <Input name="email" type="email" required />
        </Field>
        <Field label={t('department')}>
          <Input name="department" />
        </Field>
        <Field label={t('role')}>
          <Select name="role" defaultValue="EMPLOYEE">
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {te(`role.${role}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('temporaryPassword')} hint={t('passwordHint')}>
          <Input name="password" type="text" minLength={8} required autoComplete="off" />
        </Field>
        <div className="self-center">
          <Button type="submit">{t('addUser')}</Button>
        </div>
      </form>
    </div>
  );
}
