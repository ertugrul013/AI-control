import { cookies } from 'next/headers';
import { download, route } from '@/server/api';
import { renderReportPdf } from '@/server/pdf';
import { getReportData } from '@/server/services/report';

// ?locale=nl|en, defaults to the language of the interface
export const GET = route('reports:read', null, async ({ req }) => {
  const requested = new URL(req.url).searchParams.get('locale') ?? (await cookies()).get('locale')?.value;
  const locale = requested === 'en' ? 'en' : 'nl';
  const pdf = await renderReportPdf(await getReportData(locale), locale);
  return download(new Uint8Array(pdf), 'application/pdf', `ai-management-report-${locale}.pdf`);
});
