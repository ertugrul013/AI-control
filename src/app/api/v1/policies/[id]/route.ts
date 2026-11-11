import { policyPatchSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { authorize } from '@/server/authorize';
import { getPolicy, updateDraft } from '@/server/services/policy';

export const GET = route('policy:read', null, ({ user, params }) =>
  getPolicy(params.id, authorize(user.role, 'policy:write')),
);
export const PATCH = route('policy:write', policyPatchSchema, ({ user, body, params }) =>
  updateDraft(user, params.id, body),
);
