'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { FORBIDDEN_DATA, HUMAN_REVIEW, PUBLIC_TOOLS } from '@/domain/policy/buildPolicy';
import { useApi } from '@/lib/api';
import type { Locale } from '@/lib/enums';
import { Markdown } from './markdown';
import { Button } from './ui/button';
import { Choice, Choices, Field, Input, Select, Textarea } from './ui/form';

interface Draft {
  id: string;
  title: string;
  contentMarkdown: string;
}

interface Props {
  /** Register items with status approved or in use. */
  tools: string[];
  defaultLocale: Locale;
  draft: Draft | null;
}

/** Eight questions → generated draft → Markdown editor → publish. */
export function PolicyWizard({ tools, defaultLocale, draft: initialDraft }: Props) {
  const t = useTranslations('policy');
  const tc = useTranslations('common');
  const router = useRouter();
  const call = useApi();
  const [draft, setDraft] = useState(initialDraft);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const created = await call<Draft>('/policies', 'POST', {
      locale: form.get('locale'),
      answers: {
        approvedTools: form.getAll('approvedTools'),
        publicTools: form.get('publicTools'),
        forbiddenData: form.getAll('forbiddenData'),
        humanReview: form.get('humanReview'),
        approver: form.get('approver'),
        labelling: form.get('labelling'),
        incidentContact: form.get('incidentContact'),
        reviewMonths: Number(form.get('reviewMonths')),
      },
    });
    if (created) setDraft(created);
  }

  const saveDraft = (current: Draft, message?: string) =>
    call(
      `/policies/${current.id}`,
      'PATCH',
      { title: current.title, contentMarkdown: current.contentMarkdown },
      message,
    );

  async function publish(current: Draft) {
    if (!(await saveDraft(current))) return;
    if (await call(`/policies/${current.id}/publish`, 'POST', undefined, t('publishedToast')))
      router.push('/policy');
  }

  if (draft) {
    return (
      <div className="grid gap-4">
        <p>{t('editIntro')}</p>
        <Field label={t('policyTitle')}>
          <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </Field>
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label={t('markdown')} hint={t('markdownHint')}>
            <Textarea
              value={draft.contentMarkdown}
              onChange={(e) => setDraft({ ...draft, contentMarkdown: e.target.value })}
              rows={32}
              className="font-mono text-xs"
            />
          </Field>
          <section aria-label={t('preview')}>
            <p className="mb-1 font-semibold">{t('preview')}</p>
            <div className="border-rule max-h-[44rem] overflow-auto rounded-md border p-4">
              <Markdown source={draft.contentMarkdown} />
            </div>
          </section>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => saveDraft(draft, t('draftSaved'))}>
            {t('saveDraft')}
          </Button>
          <Button onClick={() => publish(draft)}>{t('publish')}</Button>
        </div>
        <p className="text-muted text-xs">{t('publishNote')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={generate} className="grid max-w-2xl gap-5">
      <p>{t('wizardIntro')}</p>
      <Field label={t('q.locale')}>
        <Select name="locale" defaultValue={defaultLocale} className="w-48">
          <option value="nl">Nederlands</option>
          <option value="en">English</option>
        </Select>
      </Field>
      <Choices legend={`1. ${t('q.approvedTools')}`} hint={t('q.approvedToolsHint')}>
        {tools.length === 0 && <p className="text-muted">{t('q.noTools')}</p>}
        {tools.map((tool) => (
          <Choice key={tool} type="checkbox" name="approvedTools" value={tool} defaultChecked label={tool} />
        ))}
      </Choices>
      <Choices legend={`2. ${t('q.publicTools')}`}>
        {PUBLIC_TOOLS.map((value) => (
          <Choice
            key={value}
            type="radio"
            name="publicTools"
            value={value}
            defaultChecked={value === 'withoutCompanyData'}
            label={t(`q.publicToolsOption.${value}`)}
          />
        ))}
      </Choices>
      <Choices legend={`3. ${t('q.forbiddenData')}`}>
        {FORBIDDEN_DATA.map((value) => (
          <Choice
            key={value}
            type="checkbox"
            name="forbiddenData"
            value={value}
            defaultChecked
            label={t(`q.forbiddenDataOption.${value}`)}
          />
        ))}
      </Choices>
      <Choices legend={`4. ${t('q.humanReview')}`}>
        {HUMAN_REVIEW.map((value) => (
          <Choice
            key={value}
            type="radio"
            name="humanReview"
            value={value}
            defaultChecked={value === 'always'}
            label={t(`q.humanReviewOption.${value}`)}
          />
        ))}
      </Choices>
      <Field label={`5. ${t('q.approver')}`} hint={t('q.approverHint')}>
        <Input name="approver" required maxLength={200} />
      </Field>
      <Field label={`6. ${t('q.labelling')}`}>
        <Textarea
          name="labelling"
          rows={2}
          required
          maxLength={1000}
          defaultValue={t('q.labellingDefault')}
        />
      </Field>
      <Field label={`7. ${t('q.incidentContact')}`} hint={t('q.incidentContactHint')}>
        <Input name="incidentContact" required maxLength={200} />
      </Field>
      <Choices legend={`8. ${t('q.reviewMonths')}`}>
        {[6, 12].map((months) => (
          <Choice
            key={months}
            type="radio"
            name="reviewMonths"
            value={months}
            defaultChecked={months === 12}
            label={t('q.months', { months })}
          />
        ))}
      </Choices>
      <div className="flex gap-2">
        <Button type="submit">{t('generate')}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push('/policy')}>
          {tc('cancel')}
        </Button>
      </div>
    </form>
  );
}
