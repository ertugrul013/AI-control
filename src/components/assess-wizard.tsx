'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { classify, needsExceptionCheck } from '@/domain/classification/engine';
import {
  actionTexts,
  questions,
  roleQuestion,
  ruleInfo,
  type Answers,
  type OrgRole,
} from '@/domain/classification/rules';
import { useApi } from '@/lib/api';
import { TierBadge } from './tier-badge';
import { Button } from './ui/button';

const STEPS = ['role', 'prohibited', 'highRisk', 'exception', 'transparency', 'check'] as const;
type StepId = (typeof STEPS)[number];

interface Props {
  systemId: string;
  dataCategories: string[];
  initial: Answers | null;
}

/** One topic per step, a live tier preview beside it, and a "check your answers" page before saving. */
export function AssessWizard({ systemId, dataCategories, initial }: Props) {
  const t = useTranslations('assess');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const call = useApi();

  const [role, setRole] = useState<OrgRole | undefined>(initial?.role);
  const [given, setGiven] = useState(initial?.answers ?? {});
  const [step, setStep] = useState<StepId>('role');
  const [incomplete, setIncomplete] = useState(false);

  const answers: Answers = { role: role ?? 'deployer', answers: given };
  // The exception step only exists for an Annex III candidate.
  const steps = STEPS.filter((s) => s !== 'exception' || needsExceptionCheck(answers));
  const position = steps.indexOf(step);
  const preview = classify(answers, dataCategories);
  const stepQuestions = (s: StepId) => questions.filter((q) => q.step === s);
  const isComplete = (s: StepId) =>
    s === 'role' ? role !== undefined : stepQuestions(s).every((q) => given[q.id] !== undefined);
  const allComplete = steps.every(isComplete);

  function go(target: StepId) {
    setIncomplete(false);
    setStep(target);
    window.scrollTo({ top: 0 });
  }

  function next() {
    if (!isComplete(step)) return setIncomplete(true);
    go(steps[position + 1]);
  }

  async function save() {
    // Answers to a step that is no longer shown are not part of the assessment.
    const visible = new Set(steps.flatMap((s) => stepQuestions(s).map((q) => q.id)));
    const body = {
      role,
      answers: Object.fromEntries(Object.entries(answers.answers).filter(([id]) => visible.has(id))),
    };
    if (await call(`/systems/${systemId}/assessments`, 'POST', body, t('saved'))) {
      router.push(`/systems/${systemId}`);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div>
        <p className="text-muted text-xs">{t('progress', { current: position + 1, total: steps.length })}</p>
        <h2 className="mt-1">{t(`step.${step}.title`)}</h2>
        <p className="mt-1 max-w-[70ch]">{t(`step.${step}.intro`)}</p>

        {incomplete && (
          <p role="alert" className="border-prohibited mt-3 border-l-4 pl-3">
            {t('incomplete')}
          </p>
        )}

        {step === 'role' && (
          <fieldset className="mt-3 grid gap-2">
            <legend className="font-semibold">{roleQuestion.text[locale]}</legend>
            <p className="text-muted text-xs">{roleQuestion.article}</p>
            {(['deployer', 'provider'] as const).map((option) => (
              <label key={option} className="flex items-start gap-2">
                <input
                  type="radio"
                  name="role"
                  className="mt-0.5 shrink-0"
                  checked={role === option}
                  onChange={() => setRole(option)}
                />
                {roleQuestion.options[option][locale]}
              </label>
            ))}
          </fieldset>
        )}

        {step !== 'role' && step !== 'check' && (
          <div className="mt-2">
            {stepQuestions(step).map((q) => (
              <fieldset key={q.id} className="border-rule border-b py-3">
                <legend className="max-w-[70ch] font-semibold">{q.text[locale]}</legend>
                <p className="text-muted text-xs">{q.article}</p>
                <div className="mt-1.5 flex gap-6">
                  {[true, false].map((value) => (
                    <label key={String(value)} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={q.id}
                        checked={given[q.id] === value}
                        onChange={() => setGiven({ ...given, [q.id]: value })}
                      />
                      {value ? tc('yes') : tc('no')}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        )}

        {step === 'check' && (
          <div className="mt-3 grid gap-5">
            {steps.slice(0, -1).map((s) => (
              <section key={s}>
                <div className="border-rule flex items-baseline justify-between gap-3 border-b pb-1">
                  <h3>{t(`step.${s}.title`)}</h3>
                  <button
                    type="button"
                    className="text-action cursor-pointer underline"
                    onClick={() => go(s)}
                  >
                    {tc('change')}
                    <span className="sr-only"> {t(`step.${s}.title`)}</span>
                  </button>
                </div>
                <dl>
                  {s === 'role' ? (
                    <div className="border-rule grid grid-cols-[1fr_auto] gap-4 border-b py-1.5">
                      <dt>{roleQuestion.text[locale]}</dt>
                      <dd className="font-semibold">{role ? roleQuestion.options[role][locale] : '—'}</dd>
                    </div>
                  ) : (
                    stepQuestions(s).map((q) => (
                      <div key={q.id} className="border-rule grid grid-cols-[1fr_auto] gap-4 border-b py-1.5">
                        <dt>{q.text[locale]}</dt>
                        <dd className="font-semibold">
                          {given[q.id] === undefined ? '—' : given[q.id] ? tc('yes') : tc('no')}
                        </dd>
                      </div>
                    ))
                  )}
                </dl>
              </section>
            ))}
            <section>
              <h3>{t('actionsCreated')}</h3>
              <ul className="mt-1 grid list-disc gap-1 pl-5">
                {preview.actions.map((key) => (
                  <li key={key}>{actionTexts[key][locale]}</li>
                ))}
              </ul>
            </section>
            {!allComplete && (
              <p role="alert" className="border-prohibited border-l-4 pl-3">
                {t('incompleteCheck')}
              </p>
            )}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          {position > 0 && (
            <Button variant="secondary" onClick={() => go(steps[position - 1])}>
              {tc('back')}
            </Button>
          )}
          {step === 'check' ? (
            <Button onClick={save} disabled={!allComplete}>
              {t('save')}
            </Button>
          ) : (
            <Button onClick={next}>{tc('continue')}</Button>
          )}
        </div>
      </div>

      <aside aria-live="polite" className="border-rule lg:border-l lg:pl-6">
        <h2>{t('preview')}</h2>
        <p className="mt-2">
          <TierBadge tier={preview.tier} className="text-base font-semibold" />
        </p>
        <h3 className="mt-3 text-xs">{t('previewWhy')}</h3>
        <ul className="mt-1 grid gap-1.5 text-xs">
          {preview.rationale.map((ruleId) => {
            const rule = ruleInfo(ruleId);
            return (
              <li key={ruleId}>
                {rule.text[locale]}
                {rule.article && <span className="text-muted"> ({rule.article})</span>}
              </li>
            );
          })}
        </ul>
        <p className="text-muted mt-3 text-xs">{t('previewNote')}</p>
      </aside>
    </div>
  );
}
