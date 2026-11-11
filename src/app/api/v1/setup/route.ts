import { setupSchema } from '@/lib/schemas';
import { publicRoute } from '@/server/api';
import { setupOrganization } from '@/server/services/organization';

export const POST = publicRoute(setupSchema, ({ body }) => setupOrganization(body));
