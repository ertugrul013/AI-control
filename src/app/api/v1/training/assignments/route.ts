import { assignSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { authorize } from '@/server/authorize';
import { assignModule, listAssignments } from '@/server/services/training';

// Employees only see their own assignments.
export const GET = route('training:read', null, ({ user }) =>
  listAssignments(authorize(user.role, 'training:overview') ? undefined : user.id),
);
export const POST = route('training:manage', assignSchema, ({ user, body }) => assignModule(user, body));
