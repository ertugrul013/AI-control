import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Forbidden() {
  const t = useTranslations('errors');
  return (
    <main className="mx-auto grid max-w-md gap-3 px-6 py-16">
      <h1>{t('forbiddenTitle')}</h1>
      <p>{t('forbiddenBody')}</p>
      <p>
        <Link href="/training">{t('toMyTodos')}</Link>
      </p>
    </main>
  );
}
