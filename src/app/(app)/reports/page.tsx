import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { EXPORT_TABLES } from '@/server/services/export';
import { requirePage } from '@/server/session';

export default async function ReportsPage() {
  await requirePage('reports:read');
  const t = await getTranslations('reports');

  return (
    <div className="grid gap-6">
      <div>
        <h1>{t('title')}</h1>
        <p className="mt-1">{t('intro')}</p>
      </div>

      <section className="border-rule border-t pt-4">
        <h2>{t('management')}</h2>
        <p className="mt-1 max-w-[70ch]">{t('managementIntro')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild>
            <a href="/api/v1/reports/management?locale=nl">{t('downloadPdf', { language: 'Nederlands' })}</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/api/v1/reports/management?locale=en">{t('downloadPdf', { language: 'English' })}</a>
          </Button>
        </div>
      </section>

      <section className="border-rule border-t pt-4">
        <h2>{t('export')}</h2>
        <p className="mt-1 max-w-[70ch]">{t('exportIntro')}</p>
        <div className="mt-3">
          <Button asChild variant="secondary">
            <a href="/api/v1/export?format=json">{t('downloadJson')}</a>
          </Button>
        </div>
        <h3 className="mt-4">{t('csvPerTable')}</h3>
        <ul className="mt-1 grid gap-1 sm:grid-cols-2">
          {EXPORT_TABLES.map((table) => (
            <li key={table}>
              <a href={`/api/v1/export?format=csv&table=${table}`}>{t(`table.${table}`)}</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
