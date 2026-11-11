import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { AssessWizard } from '@/components/assess-wizard';
import { getSystem } from '@/server/services/systems';
import { requirePage } from '@/server/session';

export default async function AssessPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePage('assessments:write');
  const system = await getSystem((await params).id);
  if (!system) notFound();
  const t = await getTranslations('assess');

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xs">
          <Link href={`/systems/${system.id}`}>{system.name}</Link>
        </p>
        <h1>{t('title', { name: system.name })}</h1>
        <p className="mt-1">{t('intro')}</p>
      </div>
      <AssessWizard
        systemId={system.id}
        dataCategories={system.dataCategories}
        // Re-classifying starts from the previous answers.
        initial={system.assessments[0]?.parsed ?? null}
      />
    </div>
  );
}
