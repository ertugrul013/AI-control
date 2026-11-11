import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { answersSchema, systemSchema } from '@/lib/schemas';
import { parseCsv, toCsv } from '@/lib/csv';
import type { TierOrNone } from '@/lib/enums';
import { isoDate } from '@/lib/utils';
import { audit, changes, type Actor, type Tx } from '../audit';
import { db } from '../db';
import { HttpError } from '../errors';

type SystemInput = z.infer<typeof systemSchema>;

const listInclude = {
  owner: { select: { id: true, name: true, email: true } },
  assessments: { orderBy: { version: 'desc' }, take: 1 },
  _count: { select: { actions: { where: { status: 'OPEN' } } } },
} satisfies Prisma.AiSystemInclude;

/** The tier of a system is the result of its latest assessment. */
export const tierOf = (system: { assessments: { resultTier: TierOrNone }[] }): TierOrNone =>
  system.assessments[0]?.resultTier ?? 'NONE';

export const listSystems = () => db.aiSystem.findMany({ include: listInclude, orderBy: { name: 'asc' } });

export async function getSystem(id: string) {
  const system = await db.aiSystem.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      assessments: {
        orderBy: { version: 'desc' },
        include: { assessedBy: { select: { name: true } }, approvedBy: { select: { name: true } } },
      },
      actions: {
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
        include: { assignee: { select: { name: true } } },
      },
    },
  });
  if (!system) return null;
  const history = await db.auditLog.findMany({
    where: {
      OR: [
        { entityType: 'AiSystem', entityId: id },
        { entityType: 'RiskAssessment', entityId: { in: system.assessments.map((a) => a.id) } },
        { entityType: 'Action', entityId: { in: system.actions.map((a) => a.id) } },
      ],
    },
    orderBy: { timestamp: 'desc' },
    take: 30,
    include: { actor: { select: { name: true } } },
  });
  return {
    ...system,
    // Stored answers were validated on the way in; anything unreadable is treated as "no previous answers".
    assessments: system.assessments.map((a) => ({
      ...a,
      parsed: answersSchema.safeParse(a.answers).data ?? null,
    })),
    history,
  };
}

function toData<T extends Partial<SystemInput>>({ nextReviewDate, ...rest }: T) {
  return {
    ...rest,
    ...(nextReviewDate !== undefined && { nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null }),
  };
}

async function create(tx: Tx, actor: Actor, input: SystemInput) {
  const system = await tx.aiSystem.create({ data: { ...toData(input), ownerId: input.ownerId ?? actor.id } });
  await audit(tx, actor, 'AiSystem', system.id, 'CREATE', { name: system.name });
  return system;
}

export const createSystem = (actor: Actor, input: SystemInput) =>
  db.$transaction((tx) => create(tx, actor, input));

export async function updateSystem(actor: Actor, id: string, input: Partial<SystemInput>) {
  return db.$transaction(async (tx) => {
    const before = await tx.aiSystem.findUniqueOrThrow({ where: { id } });
    const data = toData(input);
    const system = await tx.aiSystem.update({ where: { id }, data });
    await audit(tx, actor, 'AiSystem', id, 'UPDATE', changes(before, data));
    return system;
  });
}

export async function deleteSystem(actor: Actor, id: string) {
  return db.$transaction(async (tx) => {
    const system = await tx.aiSystem.delete({ where: { id } });
    await audit(tx, actor, 'AiSystem', id, 'DELETE', { name: system.name });
    return { ok: true };
  });
}

const CSV_COLUMNS = [
  'name',
  'vendor',
  'description',
  'purpose',
  'department',
  'ownerEmail',
  'usageType',
  'dataCategories',
  'userGroup',
  'status',
  'nextReviewDate',
] as const;

export async function exportSystemsCsv() {
  const systems = await listSystems();
  return toCsv(
    systems.map((s) => ({
      ...s,
      ownerEmail: s.owner.email,
      dataCategories: s.dataCategories.join(';'),
      nextReviewDate: isoDate(s.nextReviewDate),
      tier: tierOf(s),
    })),
    [...CSV_COLUMNS, 'tier'],
  );
}

/** Imports systems from CSV with the columns of the export. All rows are created, or none. */
export async function importSystems(actor: Actor, csv: string) {
  const rows = parseCsv(csv);
  if (rows.length === 0) throw new HttpError(400, 'validation');
  const owners = new Map((await db.user.findMany()).map((u) => [u.email, u.id]));
  const inputs = rows.map((row) =>
    systemSchema.parse({
      name: row.name,
      vendor: row.vendor ?? '',
      description: row.description ?? '',
      purpose: row.purpose ?? '',
      department: row.department ?? '',
      ownerId: owners.get((row.ownerEmail ?? '').toLowerCase()),
      usageType: row.usageType || 'THIRD_PARTY_TOOL',
      dataCategories: (row.dataCategories ?? '').split(';').filter(Boolean),
      userGroup: row.userGroup || 'INTERNAL',
      status: row.status || 'PROPOSED',
      nextReviewDate: row.nextReviewDate || null,
    }),
  );
  return db.$transaction(async (tx) => {
    for (const input of inputs) await create(tx, actor, input);
    return { imported: inputs.length };
  });
}
