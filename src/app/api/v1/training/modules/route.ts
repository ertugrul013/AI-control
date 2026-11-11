import { route } from '@/server/api';
import { listModules } from '@/server/services/training';

export const GET = route('training:read', null, () => listModules());
