import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { PolicyWizard } from '@/components/policy-wizard';
import { approvedToolNames, getPolicy } from '@/server/services/policy';
import { requirePage } from '@/server/session';

export default async function PolicyWizardPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requirePage('policy:write');
  const { id } = await searchParams;
  const [t, locale, tools] = await Promise.all([getTranslations('policy'), getLocale(), approvedToolNames()]);
  // ?id= reopens an existing draft in the editor.
  const draft = id ? await getPolicy(id, true).catch(() => null) : null;
  if (id && draft?.status !== 'DRAFT') notFound();

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xs">
          <Link href="/policy">{t('title')}</Link>
        </p>
        <h1>{t('wizardTitle')}</h1>
      </div>
      <PolicyWizard
        tools={tools}
        defaultLocale={locale}
        draft={draft && { id: draft.id, title: draft.title, contentMarkdown: draft.contentMarkdown }}
      />
    </div>
  );
}
