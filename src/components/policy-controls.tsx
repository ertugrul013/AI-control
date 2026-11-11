'use client';

import { useTranslations } from 'next-intl';
import { useApi } from '@/lib/api';
import { Button } from './ui/button';

export function AcknowledgeButton({ policyId }: { policyId: string }) {
  const t = useTranslations('policy');
  const call = useApi();
  return (
    <Button onClick={() => call(`/policies/${policyId}/acknowledge`, 'POST', undefined, t('acknowledged'))}>
      {t('acknowledge')}
    </Button>
  );
}
