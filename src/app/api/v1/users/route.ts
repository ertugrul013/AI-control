import { userCreateSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { createUser, listUsers } from '@/server/services/users';

export const GET = route('settings:manage', null, () => listUsers());
export const POST = route('settings:manage', userCreateSchema, ({ user, body }) => createUser(user, body));
