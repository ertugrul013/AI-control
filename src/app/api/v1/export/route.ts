import { download, route } from '@/server/api';
import { HttpError } from '@/server/errors';
import { EXPORT_TABLES, exportAll, exportCsv } from '@/server/services/export';

// ?format=json (default: everything in one file) or ?format=csv&table=<name> (one table per file)
export const GET = route('reports:read', null, async ({ user, req }) => {
  const query = new URL(req.url).searchParams;
  if (query.get('format') !== 'csv') {
    const data = await exportAll(user, 'json');
    return download(JSON.stringify(data, null, 2), 'application/json', 'aicontrol-export.json');
  }
  const table = EXPORT_TABLES.find((name) => name === query.get('table'));
  if (!table) throw new HttpError(400, 'validation');
  return download(await exportCsv(user, table), 'text/csv; charset=utf-8', `aicontrol-${table}.csv`);
});
