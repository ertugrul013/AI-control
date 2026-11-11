import { route } from '@/server/api';
import { publishPolicy } from '@/server/services/policy';

export const POST = route('policy:write', null, ({ user, params }) => publishPolicy(user, params.id));
