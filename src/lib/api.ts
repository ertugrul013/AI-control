'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

const KNOWN = [
  'validation',
  'unauthenticated',
  'forbidden',
  'notFound',
  'conflict',
  'lastAdmin',
  'wrongPassword',
] as const;
type ErrorCode = (typeof KNOWN)[number] | 'unknown';

/**
 * Returns a function that calls an /api/v1 endpoint, shows a toast, and refreshes the page data.
 * It resolves to the response body, or undefined when the call failed (the user has been told why).
 */
export function useApi() {
  const router = useRouter();
  const t = useTranslations('errors');
  return async function call<T = { ok: true }>(
    path: string,
    method: 'POST' | 'PATCH' | 'DELETE',
    body?: unknown,
    success?: string,
  ): Promise<T | undefined> {
    let code: ErrorCode = 'unknown';
    try {
      const res = await fetch(`/api/v1${path}`, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body ?? {}),
      });
      const data = (await res.json()) as T & { error?: string };
      if (res.ok) {
        if (success) toast.success(success);
        router.refresh();
        return data;
      }
      code = KNOWN.find((known) => known === data.error) ?? 'unknown';
    } catch {
      // network failure or a non-JSON response: reported as unknown below
    }
    toast.error(t(code));
    return undefined;
  };
}
