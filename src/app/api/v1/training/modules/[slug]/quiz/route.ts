import { quizSchema } from '@/lib/schemas';
import { route } from '@/server/api';
import { submitQuiz } from '@/server/services/training';

export const POST = route('training:read', quizSchema, ({ user, body, params }) =>
  submitQuiz(user, params.slug, body.answers),
);
