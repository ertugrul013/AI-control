import { actionPatchSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { setActionStatus } from '@/server/services/assessments';

export const PATCH = route('actions:write', actionPatchSchema, ({ user, body, params }) =>
  setActionStatus(user, params.id, body.status),
);
