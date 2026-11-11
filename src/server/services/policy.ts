import type { z } from 'zod';
import { buildPolicy } from '@/domain/policy/buildPolicy';
import type { Locale } from '@/lib/enums';
import type { policyCreateSchema, policyPatchSchema } from '@/lib/schemas';
import { audit, type Actor } from '../audit';
import { db } from '../db';
import { HttpError } from '../errors';

/** Drafts are only visible to those who can edit the policy. */
export const listPolicies = (includeDrafts: boolean) =>
  db.policy.findMany({
    where: includeDrafts ? {} : { status: { not: 'DRAFT' } },
    orderBy: { version: 'desc' },
    include: { _count: { select: { acknowledgements: true } } },
  });

export async function getPolicy(id: string, includeDrafts: boolean) {
  const policy = await db.policy.findUniqueOrThrow({ where: { id } });
  if (policy.status === 'DRAFT' && !includeDrafts) throw new HttpError(403, 'forbidden');
  return policy;
}

/** The policy that applies now: the published version in the reader's language, else in the other language. */
export async function currentPolicy(locale: Locale) {
  const published = await db.policy.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { version: 'desc' },
  });
  return published.find((p) => p.locale === locale) ?? published[0] ?? null;
}

/** Whether the user has acknowledged a policy that is currently published. */
export const acknowledgement = (userId: string) =>
  db.policyAcknowledgement.findFirst({ where: { userId, policy: { status: 'PUBLISHED' } } });

/** Names of the tools the wizard proposes as approved. */
export const approvedToolNames = async () =>
  (
    await db.aiSystem.findMany({
      where: { status: { in: ['APPROVED', 'IN_USE'] } },
      select: { name: true },
      orderBy: { name: 'asc' },
    })
  ).map((s) => s.name);

export async function createDraft(actor: Actor, input: z.infer<typeof policyCreateSchema>) {
  const organization = await db.organization.findFirstOrThrow();
  const { title, markdown } = buildPolicy(input.answers, {
    locale: input.locale,
    organization: organization.name,
    date: new Date(),
  });
  return db.$transaction(async (tx) => {
    const last = await tx.policy.aggregate({ _max: { version: true } });
    const policy = await tx.policy.create({
      data: {
        version: (last._max.version ?? 0) + 1,
        locale: input.locale,
        title,
        contentMarkdown: markdown,
        wizardAnswers: input.answers,
      },
    });
    await audit(tx, actor, 'Policy', policy.id, 'CREATE', { version: policy.version, locale: policy.locale });
    return policy;
  });
}

export async function updateDraft(actor: Actor, id: string, input: z.infer<typeof policyPatchSchema>) {
  return db.$transaction(async (tx) => {
    const before = await tx.policy.findUniqueOrThrow({ where: { id } });
    // Published and archived versions are immutable.
    if (before.status !== 'DRAFT') throw new HttpError(409, 'conflict');
    const policy = await tx.policy.update({ where: { id }, data: input });
    await audit(tx, actor, 'Policy', id, 'UPDATE', { version: policy.version, title: policy.title });
    return policy;
  });
}

/** Publishes a draft and archives the previous published version in the same language. */
export async function publishPolicy(actor: Actor, id: string) {
  return db.$transaction(async (tx) => {
    const draft = await tx.policy.findUniqueOrThrow({ where: { id } });
    if (draft.status !== 'DRAFT') throw new HttpError(409, 'conflict');
    await tx.policy.updateMany({
      where: { status: 'PUBLISHED', locale: draft.locale },
      data: { status: 'ARCHIVED' },
    });
    const policy = await tx.policy.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
    await audit(tx, actor, 'Policy', id, 'PUBLISH', { version: policy.version, locale: policy.locale });
    return policy;
  });
}

export async function acknowledgePolicy(actor: Actor, policyId: string) {
  return db.$transaction(async (tx) => {
    const policy = await tx.policy.findUniqueOrThrow({ where: { id: policyId } });
    if (policy.status !== 'PUBLISHED') throw new HttpError(409, 'conflict');
    const existing = await tx.policyAcknowledgement.findUnique({
      where: { policyId_userId: { policyId, userId: actor.id } },
    });
    if (existing) return existing;
    const acknowledged = await tx.policyAcknowledgement.create({ data: { policyId, userId: actor.id } });
    await audit(tx, actor, 'PolicyAcknowledgement', acknowledged.id, 'CREATE', { version: policy.version });
    return acknowledged;
  });
}
