import type { AuditAction, Prisma } from '@prisma/client';
import type { Entity } from '@/lib/enums';

export type Tx = Prisma.TransactionClient;
export type Actor = { id: string };

/** Converts dates and other values to plain JSON for the diff column. */
export const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

/** Writes one audit entry. Always called inside the transaction of the change it describes. */
export function audit(
  tx: Tx,
  actor: Actor | null,
  entityType: Entity,
  entityId: string,
  action: AuditAction,
  diff: unknown = {},
) {
  return tx.auditLog.create({
    data: { actorId: actor?.id ?? null, entityType, entityId, action, diff: json(diff) },
  });
}

/** The fields of `after` that differ from `before`, as { field: { from, to } }. */
export function changes(before: Record<string, unknown>, after: Record<string, unknown>) {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const [key, to] of Object.entries(after)) {
    const from = before[key];
    if (JSON.stringify(from) !== JSON.stringify(to)) diff[key] = { from, to };
  }
  return diff;
}
