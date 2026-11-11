import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { oidcEnabled, signIn } from '@/auth';
import { LocaleSwitch } from '@/components/locale-switch';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import { organizationExists } from '@/server/services/organization';
import { currentUser } from '@/server/session';

async function login(formData: FormData) {
  'use server';
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/',
    });
  } catch (error) {
    // A successful sign-in throws the redirect; only real sign-in failures end up on the error page.
    if (error instanceof AuthError) redirect('/login?error=1');
    throw error;
  }
}

async function loginWithOidc() {
  'use server';
  await signIn('oidc', { redirectTo: '/' });
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!(await organizationExists())) redirect('/setup');
  if (await currentUser()) redirect('/');
  const t = await getTranslations('login');
  const { error } = await searchParams;

  return (
    <main className="mx-auto grid max-w-sm gap-5 px-6 py-16">
      <div>
        <p className="text-muted">AIControl</p>
        <h1>{t('title')}</h1>
      </div>
      {error && (
        <p role="alert" className="border-prohibited border-l-4 pl-3">
          {t('error')}
        </p>
      )}
      <form action={login} className="grid gap-4">
        <Field label={t('email')}>
          <Input name="email" type="email" autoComplete="username" required />
        </Field>
        <Field label={t('password')}>
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        <Button type="submit">{t('submit')}</Button>
      </form>
      {oidcEnabled && (
        <form action={loginWithOidc}>
          <Button variant="secondary" type="submit" className="w-full">
            {t('oidc', { provider: process.env.OIDC_NAME || 'single sign-on' })}
          </Button>
        </form>
      )}
      <LocaleSwitch />
      <p className="text-muted text-xs">{t('disclaimer')}</p>
    </main>
  );
}
