import { organizationSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { getOrganization, updateOrganization } from '@/server/services/organization';

export const GET = route('settings:manage', null, () => getOrganization());
export const PATCH = route('settings:manage', organizationSchema, ({ user, body }) =>
  updateOrganization(user, body),
);
