import type { Role } from '@prisma/client';
import type { z } from 'zod';
import type { assignSchema } from '@/lib/schemas';
import { pct } from '@/lib/utils';
import { audit, type Actor } from '../audit';
import { db } from '../db';
import { HttpError } from '../errors';

export const PASS_MARK = 80;

export interface QuizQuestion {
  nl: { question: string; options: string[] };
  en: { question: string; options: string[] };
  correct: number;
}

// Who belongs to an audience is derived from the role, so no extra user field is needed.
const AUDIENCE_ROLES: Record<'ALL' | 'POWER_USERS' | 'MANAGEMENT', Role[]> = {
  ALL: ['ADMIN', 'EDITOR', 'VIEWER', 'EMPLOYEE'],
  POWER_USERS: ['ADMIN', 'EDITOR'],
  MANAGEMENT: ['ADMIN', 'VIEWER'],
};

export const listModules = () =>
  db.trainingModule.findMany({
    orderBy: { estimatedMinutes: 'asc' },
    select: { id: true, slug: true, titleNl: true, titleEn: true, estimatedMinutes: true, audience: true },
  });

export const listAssignments = (userId?: string) =>
  db.trainingAssignment.findMany({
    where: userId ? { userId } : {},
    orderBy: [{ dueDate: 'asc' }, { assignedAt: 'asc' }],
    include: {
      module: { select: { slug: true, titleNl: true, titleEn: true, estimatedMinutes: true } },
      user: { select: { name: true, department: true } },
    },
  });

/** A module with its quiz, without the correct answers: those stay on the server. */
export async function getModule(slug: string, userId: string) {
  const trainingModule = await db.trainingModule.findUnique({
    where: { slug },
    include: { assignments: { where: { userId } } },
  });
  if (!trainingModule) return null;
  const { quiz, assignments, ...rest } = trainingModule;
  return {
    ...rest,
    assignment: assignments[0] ?? null,
    quiz: (quiz as unknown as QuizQuestion[]).map(({ nl, en }) => ({ nl, en })),
  };
}

export async function assignModule(actor: Actor, input: z.infer<typeof assignSchema>) {
  const users = await db.user.findMany({
    where: input.audience ? { role: { in: AUDIENCE_ROLES[input.audience] } } : { id: { in: input.userIds } },
    select: { id: true },
  });
  return db.$transaction(async (tx) => {
    await tx.trainingModule.findUniqueOrThrow({ where: { id: input.moduleId } });
    const { count } = await tx.trainingAssignment.createMany({
      data: users.map((u) => ({ moduleId: input.moduleId, userId: u.id, dueDate: new Date(input.dueDate) })),
      skipDuplicates: true,
    });
    await audit(tx, actor, 'TrainingAssignment', input.moduleId, 'CREATE', {
      audience: input.audience ?? null,
      users: users.length,
      assigned: count,
    });
    return { assigned: count };
  });
}

/** Scores a quiz attempt. Passing completes the assignment; a completed assignment stays completed. */
export async function submitQuiz(actor: Actor, slug: string, answers: number[]) {
  return db.$transaction(async (tx) => {
    const trainingModule = await tx.trainingModule.findUniqueOrThrow({ where: { slug } });
    const quiz = trainingModule.quiz as unknown as QuizQuestion[];
    if (answers.length !== quiz.length) throw new HttpError(400, 'validation');
    const score = pct(quiz.filter((q, i) => q.correct === answers[i]).length, quiz.length);
    const passed = score >= PASS_MARK;

    const key = { moduleId_userId: { moduleId: trainingModule.id, userId: actor.id } };
    const existing = await tx.trainingAssignment.findUnique({ where: key });
    const assignment = await tx.trainingAssignment.upsert({
      where: key,
      // Taking a module that was not assigned is allowed and counts as well.
      create: {
        moduleId: trainingModule.id,
        userId: actor.id,
        dueDate: new Date(),
        score,
        completedAt: passed ? new Date() : null,
      },
      update: existing?.completedAt
        ? { score: Math.max(score, existing.score ?? 0) }
        : { score, completedAt: passed ? new Date() : null },
    });
    await audit(tx, actor, 'TrainingAssignment', assignment.id, 'UPDATE', { module: slug, score, passed });
    return { score, passed };
  });
}
