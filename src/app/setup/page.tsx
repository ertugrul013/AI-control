import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { LocaleSwitch } from '@/components/locale-switch';
import { SetupForm } from '@/components/setup-form';
import { organizationExists } from '@/server/services/organization';

export default async function SetupPage() {
  if (await organizationExists()) redirect('/login');
  const t = await getTranslations('setup');
  return (
    <main className="mx-auto grid max-w-lg gap-5 px-6 py-12">
      <div>
        <p className="text-muted">AIControl</p>
        <h1>{t('title')}</h1>
      </div>
      <p>{t('intro')}</p>
      <SetupForm />
      <LocaleSwitch />
    </main>
  );
}
