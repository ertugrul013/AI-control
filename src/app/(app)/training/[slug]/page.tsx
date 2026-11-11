import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Markdown } from '@/components/markdown';
import { Quiz } from '@/components/training-controls';
import { formatDate } from '@/lib/utils';
import { getModule, PASS_MARK } from '@/server/services/training';
import { requirePage } from '@/server/session';

export default async function TrainingModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requirePage('training:read');
  const trainingModule = await getModule((await params).slug, user.id);
  if (!trainingModule) notFound();
  const [t, locale] = await Promise.all([getTranslations('training'), getLocale()]);
  const { assignment } = trainingModule;

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs">
          <Link href="/training">{t('title')}</Link>
        </p>
        <h1>{locale === 'nl' ? trainingModule.titleNl : trainingModule.titleEn}</h1>
        <p className="mt-1">
          {assignment?.completedAt
            ? t('completedOn', {
                date: formatDate(assignment.completedAt, locale),
                score: assignment.score ?? 0,
              })
            : t('moduleIntro', { minutes: trainingModule.estimatedMinutes, passMark: PASS_MARK })}
        </p>
      </div>
      <Markdown source={locale === 'nl' ? trainingModule.contentNl : trainingModule.contentEn} />
      <section className="border-rule border-t pt-4">
        <h2 className="mb-3">{t('quiz')}</h2>
        <Quiz slug={trainingModule.slug} questions={trainingModule.quiz} passMark={PASS_MARK} />
      </section>
    </div>
  );
}
