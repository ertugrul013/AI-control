import { userUpdateSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { updateUser } from '@/server/services/users';

export const PATCH = route('settings:manage', userUpdateSchema, ({ user, body, params }) =>
  updateUser(user, params.id, body),
);
