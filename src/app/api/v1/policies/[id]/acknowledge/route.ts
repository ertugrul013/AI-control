import { route } from '@/server/api';
import { acknowledgePolicy } from '@/server/services/policy';

export const POST = route('policy:acknowledge', null, ({ user, params }) =>
  acknowledgePolicy(user, params.id),
);
