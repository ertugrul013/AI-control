import { actionCreateSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { createAction } from '@/server/services/assessments';

export const POST = route('actions:write', actionCreateSchema, ({ user, body }) => createAction(user, body));
