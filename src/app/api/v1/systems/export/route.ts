import { download, route } from '@/server/api';
import { exportSystemsCsv } from '@/server/services/systems';

export const GET = route('systems:read', null, async () =>
  download(await exportSystemsCsv(), 'text/csv; charset=utf-8', 'ai-register.csv'),
);
