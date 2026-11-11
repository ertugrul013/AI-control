import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PasswordForm } from '@/components/password-form';
import { currentUser } from '@/server/session';

export default async function ChangePasswordPage() {
  const user = await currentUser();
  if (!user) redirect('/login');
  const t = await getTranslations('login');
  return (
    <main className="mx-auto grid max-w-sm gap-5 px-6 py-16">
      <div>
        <p className="text-muted">AIControl</p>
        <h1>{t('changeTitle')}</h1>
      </div>
      <p>{user.mustChangePassword ? t('changeForced') : t('changeIntro')}</p>
      <PasswordForm />
    </main>
  );
}
