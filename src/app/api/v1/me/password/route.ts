import { passwordSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { changeOwnPassword } from '@/server/services/users';

export const POST = route('self', passwordSchema, ({ user, body }) => changeOwnPassword(user, body));
