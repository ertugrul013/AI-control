import { route } from '@/server/api';
import { listAuditLog } from '@/server/services/export';

// ?page=0,1,2…
export const GET = route('settings:manage', null, ({ req }) =>
  listAuditLog(Math.max(0, Number(new URL(req.url).searchParams.get('page')) || 0)),
);
