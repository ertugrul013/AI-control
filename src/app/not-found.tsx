import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('errors');
  return (
    <main className="mx-auto grid max-w-md gap-3 px-6 py-16">
      <h1>{t('notFoundTitle')}</h1>
      <p>{t('notFoundBody')}</p>
      <p>
        <Link href="/">{t('toStart')}</Link>
      </p>
    </main>
  );
}
