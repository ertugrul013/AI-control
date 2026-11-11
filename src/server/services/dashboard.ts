import { classify } from '@/domain/classification/engine';
import { TIERS_AND_NONE, type TierOrNone } from '@/lib/enums';
import { answersSchema } from '@/lib/schemas';
import { db } from '../db';
import { tierOf } from './systems';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Everything the dashboard and the management report show, computed from the register. */
export async function getDashboard() {
  const now = new Date();
  const [systems, assignments, userCount, acknowledged, recent] = await Promise.all([
    db.aiSystem.findMany({
      // Retired systems stay in the register but no longer count towards the current picture.
      where: { status: { not: 'RETIRED' } },
      include: {
        assessments: { orderBy: { version: 'desc' }, take: 1 },
        actions: { where: { status: 'OPEN' }, orderBy: { dueDate: 'asc' } },
      },
      orderBy: { name: 'asc' },
    }),
    db.trainingAssignment.findMany({
      select: { completedAt: true, user: { select: { department: true } } },
    }),
    db.user.count(),
    db.policyAcknowledgement.findMany({
      where: { policy: { status: 'PUBLISHED' } },
      distinct: ['userId'],
      select: { userId: true },
    }),
    db.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 6,
      include: { actor: { select: { name: true } } },
    }),
  ]);

  const rows = systems
    .map((s) => ({
      id: s.id,
      name: s.name,
      department: s.department,
      tier: tierOf(s),
      needsApproval: s.assessments.length > 0 && !s.assessments[0].approvedAt,
      openActions: s.actions,
      nextReviewDate: s.nextReviewDate,
      latest: s.assessments[0],
      dataCategories: s.dataCategories,
    }))
    .sort((a, b) => TIERS_AND_NONE.indexOf(a.tier) - TIERS_AND_NONE.indexOf(b.tier));

  const counts = Object.fromEntries(
    TIERS_AND_NONE.map((tier) => [tier, rows.filter((r) => r.tier === tier).length]),
  ) as Record<TierOrNone, number>;

  // The earliest date on which high-risk obligations start to apply to one of the systems.
  const applicableFrom = rows
    .filter((r) => r.tier === 'HIGH')
    .flatMap((r) => {
      const answers = answersSchema.safeParse(r.latest?.answers);
      return answers.success ? [classify(answers.data, r.dataCategories).applicableFrom] : [];
    })
    .filter((date) => date !== null)
    .sort()[0];

  const departments = [...new Set(rows.map((r) => r.department || '—'))].sort();
  const trainingDepartments = [...new Set(assignments.map((a) => a.user.department || '—'))].sort();

  return {
    strip: rows.map(({ id, name, tier }) => ({ id, name, tier })),
    counts,
    total: rows.length,
    needAction: rows.filter((r) => r.needsApproval || r.openActions.length > 0).length,
    countdown: applicableFrom
      ? {
          date: applicableFrom,
          days: Math.ceil((new Date(applicableFrom).getTime() - now.getTime()) / DAY_MS),
        }
      : null,
    toApprove: rows.filter((r) => r.needsApproval).map(({ id, name }) => ({ id, name })),
    openActions: rows
      .flatMap((r) => r.openActions.map((a) => ({ ...a, systemName: r.name })))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
    overdueReviews: rows.filter((r) => r.nextReviewDate && r.nextReviewDate < now).length,
    coverage: {
      assessed: [rows.length - counts.NONE, rows.length],
      trained: [assignments.filter((a) => a.completedAt).length, assignments.length],
      policy: [acknowledged.length, userCount],
    } satisfies Record<string, [number, number]>,
    departmentTiers: departments.map((department) => ({
      department,
      counts: Object.fromEntries(
        TIERS_AND_NONE.map((tier) => [
          tier,
          rows.filter((r) => (r.department || '—') === department && r.tier === tier).length,
        ]),
      ) as Record<TierOrNone, number>,
    })),
    trainingByDepartment: trainingDepartments.map((department) => {
      const own = assignments.filter((a) => (a.user.department || '—') === department);
      return { department, done: own.filter((a) => a.completedAt).length, total: own.length };
    }),
    upcomingReviews: rows
      .filter((r) => r.nextReviewDate)
      .sort((a, b) => a.nextReviewDate!.getTime() - b.nextReviewDate!.getTime())
      .slice(0, 5)
      .map(({ id, name, nextReviewDate }) => ({ id, name, date: nextReviewDate! })),
    recent,
  };
}
