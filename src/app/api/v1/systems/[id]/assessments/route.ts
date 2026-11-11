import { answersSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { createAssessment, listAssessments } from '@/server/services/assessments';

export const GET = route('systems:read', null, ({ params }) => listAssessments(params.id));
export const POST = route('assessments:write', answersSchema, ({ user, body, params }) =>
  createAssessment(user, params.id, body),
);
