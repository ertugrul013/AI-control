'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { LOCALES } from '@/lib/enums';
import { cn } from '@/lib/utils';

const names = { nl: 'Nederlands', en: 'English' };

export function LocaleSwitch() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  return (
    <div role="group" aria-label={t('language')} className="flex gap-1">
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={code === locale}
          className={cn(
            'hover:bg-shelf cursor-pointer rounded px-2 py-1 text-xs',
            code === locale ? 'font-semibold underline underline-offset-4' : 'text-muted',
          )}
          onClick={() => {
            document.cookie = `locale=${code}; path=/; max-age=31536000; samesite=lax`;
            router.refresh();
          }}
        >
          {names[code]}
        </button>
      ))}
    </div>
  );
}
