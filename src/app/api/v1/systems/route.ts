import { systemSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { createSystem, listSystems } from '@/server/services/systems';

export const GET = route('systems:read', null, () => listSystems());
export const POST = route('systems:write', systemSchema, ({ user, body }) => createSystem(user, body));
