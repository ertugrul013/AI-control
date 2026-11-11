import { classify } from '@/domain/classification/engine';
import { actionTexts, type Answers } from '@/domain/classification/rules';
import type { z } from 'zod';
import type { actionCreateSchema } from '@/lib/schemas';
import { audit, type Actor } from '../audit';
import { db } from '../db';
import { HttpError } from '../errors';

const addMonths = (months: number) => {
  const date = new Date();
  date.setUTCMonth(date.getUTCMonth() + months);
  return date;
};

export const listAssessments = (aiSystemId: string) =>
  db.riskAssessment.findMany({ where: { aiSystemId }, orderBy: { version: 'desc' } });

/** Classifies a system, stores the assessment as a new version and creates the actions that follow from it. */
export async function createAssessment(actor: Actor, aiSystemId: string, answers: Answers) {
  return db.$transaction(async (tx) => {
    const system = await tx.aiSystem.findUniqueOrThrow({
      where: { id: aiSystemId },
      include: { assessments: { orderBy: { version: 'desc' }, take: 1 } },
    });
    const result = classify(answers, system.dataCategories);
    const version = (system.assessments[0]?.version ?? 0) + 1;
    const assessment = await tx.riskAssessment.create({
      data: {
        aiSystemId,
        answers: { ...answers },
        resultTier: result.tier,
        rationale: result.rationale,
        assessedById: actor.id,
        version,
      },
    });

    // Open actions from the previous assessment are replaced; actions already done are kept.
    await tx.action.deleteMany({ where: { aiSystemId, actionKey: { not: null }, status: 'OPEN' } });
    const done = await tx.action.findMany({ where: { aiSystemId, actionKey: { not: null } } });
    const doneKeys = new Set(done.map((a) => a.actionKey));
    await tx.action.createMany({
      data: result.actions
        .filter((key) => !doneKeys.has(key))
        .map((key) => ({
          aiSystemId,
          actionKey: key,
          title: actionTexts[key].en,
          dueDate:
            key.startsWith('review') && result.reviewMonths ? addMonths(result.reviewMonths) : addMonths(1),
          assigneeId: system.ownerId,
        })),
    });
    if (result.reviewMonths) {
      await tx.aiSystem.update({
        where: { id: aiSystemId },
        data: { nextReviewDate: addMonths(result.reviewMonths) },
      });
    }

    await audit(tx, actor, 'RiskAssessment', assessment.id, 'CREATE', {
      system: system.name,
      version,
      tier: result.tier,
      rationale: result.rationale,
    });
    return assessment;
  });
}

export async function approveAssessment(actor: Actor, id: string) {
  return db.$transaction(async (tx) => {
    const before = await tx.riskAssessment.findUniqueOrThrow({ where: { id } });
    if (before.approvedAt) throw new HttpError(409, 'conflict');
    const assessment = await tx.riskAssessment.update({
      where: { id },
      data: { approvedById: actor.id, approvedAt: new Date() },
    });
    await audit(tx, actor, 'RiskAssessment', id, 'APPROVE', {
      version: assessment.version,
      tier: assessment.resultTier,
    });
    return assessment;
  });
}

export async function createAction(actor: Actor, input: z.infer<typeof actionCreateSchema>) {
  return db.$transaction(async (tx) => {
    const action = await tx.action.create({
      data: { ...input, dueDate: new Date(input.dueDate), assigneeId: input.assigneeId ?? actor.id },
    });
    await audit(tx, actor, 'Action', action.id, 'CREATE', { title: action.title });
    return action;
  });
}

export async function setActionStatus(actor: Actor, id: string, status: 'OPEN' | 'DONE') {
  return db.$transaction(async (tx) => {
    const action = await tx.action.update({ where: { id }, data: { status } });
    await audit(tx, actor, 'Action', id, 'UPDATE', { title: action.title, status });
    return action;
  });
}
