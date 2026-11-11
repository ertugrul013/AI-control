import { importSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { importSystems } from '@/server/services/systems';

export const POST = route('systems:write', importSchema, ({ user, body }) => importSystems(user, body.csv));
