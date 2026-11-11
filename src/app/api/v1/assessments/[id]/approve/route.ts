import { route } from '@/server/api';
import { approveAssessment } from '@/server/services/assessments';

export const POST = route('assessments:approve', null, ({ user, params }) =>
  approveAssessment(user, params.id),
);
