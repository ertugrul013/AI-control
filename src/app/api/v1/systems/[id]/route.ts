import { systemPatchSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { HttpError } from '@/server/errors';
import { deleteSystem, getSystem, updateSystem } from '@/server/services/systems';

export const GET = route('systems:read', null, async ({ params }) => {
  const system = await getSystem(params.id);
  if (!system) throw new HttpError(404, 'notFound');
  return system;
});
export const PATCH = route('systems:write', systemPatchSchema, ({ user, body, params }) =>
  updateSystem(user, params.id, body),
);
export const DELETE = route('systems:delete', null, ({ user, params }) => deleteSystem(user, params.id));
