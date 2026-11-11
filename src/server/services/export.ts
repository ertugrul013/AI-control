import { toCsv } from '@/lib/csv';
import { audit, type Actor } from '../audit';
import { db } from '../db';

export const AUDIT_PAGE_SIZE = 50;

export const listAuditLog = (page: number) =>
  db.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    skip: page * AUDIT_PAGE_SIZE,
    take: AUDIT_PAGE_SIZE + 1,
    include: { actor: { select: { name: true } } },
  });

/** Every table as it is in the database, except password hashes. The export itself is logged. */
export async function exportAll(actor: Actor, format: string) {
  return db.$transaction(async (tx) => {
    await audit(tx, actor, 'Export', 'full', 'EXPORT', { format });
    return {
      organization: await tx.organization.findMany(),
      users: await tx.user.findMany({ omit: { passwordHash: true } }),
      aiSystems: await tx.aiSystem.findMany(),
      riskAssessments: await tx.riskAssessment.findMany(),
      actions: await tx.action.findMany(),
      policies: await tx.policy.findMany(),
      policyAcknowledgements: await tx.policyAcknowledgement.findMany(),
      trainingModules: await tx.trainingModule.findMany(),
      trainingAssignments: await tx.trainingAssignment.findMany(),
      auditLog: await tx.auditLog.findMany({ orderBy: { timestamp: 'asc' } }),
    };
  });
}

export const EXPORT_TABLES = [
  'organization',
  'users',
  'aiSystems',
  'riskAssessments',
  'actions',
  'policies',
  'policyAcknowledgements',
  'trainingModules',
  'trainingAssignments',
  'auditLog',
] as const satisfies readonly (keyof Awaited<ReturnType<typeof exportAll>>)[];

export type ExportTable = (typeof EXPORT_TABLES)[number];

/** One table of the export as CSV. */
export async function exportCsv(actor: Actor, table: ExportTable) {
  const rows: Record<string, unknown>[] = (await exportAll(actor, `csv:${table}`))[table];
  return toCsv(rows);
}
