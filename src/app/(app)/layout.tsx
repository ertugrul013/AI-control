import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { signOut } from '@/auth';
import { LocaleSwitch } from '@/components/locale-switch';
import { Nav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { organizationExists } from '@/server/services/organization';
import { currentUser } from '@/server/session';

async function logout() {
  'use server';
  await signOut({ redirectTo: '/login' });
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!(await organizationExists())) redirect('/setup');
  const user = await currentUser();
  if (!user) redirect('/login');
  if (user.mustChangePassword) redirect('/login/change-password');
  const t = await getTranslations('common');

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <a href="#main" className="bg-paper sr-only p-2 focus:not-sr-only focus:absolute focus:z-50">
        {t('skipToContent')}
      </a>
      <aside className="border-rule bg-shelf shrink-0 border-b md:w-52 md:border-r md:border-b-0">
        <p className="px-4 py-3 text-base font-semibold">AIControl</p>
        <Nav role={user.role} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-rule flex min-h-12 flex-wrap items-center justify-end gap-x-4 border-b px-6">
          <LocaleSwitch />
          <span className="text-muted text-xs">{user.name}</span>
          <form action={logout}>
            <Button variant="ghost" type="submit">
              {t('signOut')}
            </Button>
          </form>
        </header>
        <main id="main" className="w-full max-w-6xl flex-1 px-6 py-6">
          {children}
        </main>
        <footer className="border-rule text-muted border-t px-6 py-3 text-xs">{t('disclaimer')}</footer>
      </div>
    </div>
  );
}
