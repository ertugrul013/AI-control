import { policyCreateSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { authorize } from '@/server/authorize';
import { createDraft, listPolicies } from '@/server/services/policy';

export const GET = route('policy:read', null, ({ user }) =>
  listPolicies(authorize(user.role, 'policy:write')),
);
export const POST = route('policy:write', policyCreateSchema, ({ user, body }) => createDraft(user, body));
