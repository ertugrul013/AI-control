'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useApi } from '@/lib/api';
import { AUDIENCES } from '@/lib/enums';
import { Button } from './ui/button';
import { Choice, Choices, Field, Input, Select } from './ui/form';

interface AssignProps {
  modules: { id: string; title: string; audience: (typeof AUDIENCES)[number] }[];
  users: { id: string; name: string }[];
}

export function AssignForm({ modules, users }: AssignProps) {
  const t = useTranslations('training');
  const te = useTranslations('enums');
  const call = useApi();
  const [moduleId, setModuleId] = useState(modules[0]?.id ?? '');
  const [target, setTarget] = useState('');
  // A module's own audience is the default target.
  const audience = target || (modules.find((m) => m.id === moduleId)?.audience ?? 'ALL');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const isAudience = AUDIENCES.some((a) => a === audience);
    const result = await call<{ assigned: number }>('/training/assignments', 'POST', {
      moduleId,
      dueDate: form.get('dueDate'),
      ...(isAudience ? { audience } : { userIds: [audience] }),
    });
    if (result) toast.success(t('assigned', { count: result.assigned }));
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-wrap items-end gap-3">
      <Field label={t('module')}>
        <Select
          value={moduleId}
          onChange={(e) => (setModuleId(e.target.value), setTarget(''))}
          className="w-72"
        >
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t('assignTo')}>
        <Select value={audience} onChange={(e) => setTarget(e.target.value)} className="w-56">
          <optgroup label={t('audience')}>
            {AUDIENCES.map((value) => (
              <option key={value} value={value}>
                {te(`audience.${value}`)}
              </option>
            ))}
          </optgroup>
          <optgroup label={t('employee')}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </optgroup>
        </Select>
      </Field>
      <Field label={t('due')}>
        <Input name="dueDate" type="date" required />
      </Field>
      <Button type="submit">{t('assignSubmit')}</Button>
    </form>
  );
}

interface QuizProps {
  slug: string;
  questions: Record<'nl' | 'en', { question: string; options: string[] }>[];
  passMark: number;
}

export function Quiz({ slug, questions, passMark }: QuizProps) {
  const t = useTranslations('training');
  const locale = useLocale();
  const call = useApi();
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const answers = questions.map((_, i) => Number(form.get(`q${i}`)));
    setResult(
      (await call<{ score: number; passed: boolean }>(`/training/modules/${slug}/quiz`, 'POST', {
        answers,
      })) ?? null,
    );
  }

  return (
    <form onSubmit={submit} className="grid max-w-[70ch] gap-4">
      {questions.map((q, i) => (
        <Choices key={i} legend={`${i + 1}. ${q[locale].question}`}>
          {q[locale].options.map((option, n) => (
            <Choice key={n} type="radio" name={`q${i}`} value={n} required label={option} />
          ))}
        </Choices>
      ))}
      <div>
        <Button type="submit">{t('submitQuiz')}</Button>
      </div>
      {result && (
        <p role="status" className={`border-l-4 pl-3 ${result.passed ? 'border-minimal' : 'border-high'}`}>
          {result.passed
            ? t('passed', { score: result.score })
            : t('failed', { score: result.score, passMark })}
        </p>
      )}
    </form>
  );
}
