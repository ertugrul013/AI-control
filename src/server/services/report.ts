import type { Locale } from '@/lib/enums';
import { db } from '../db';
import { getDashboard } from './dashboard';
import { getOrganization } from './organization';
import { currentPolicy } from './policy';
import { listSystems, tierOf } from './systems';

/** The data behind the management report. */
export async function getReportData(locale: Locale) {
  const [organization, dashboard, systems, modules, policy] = await Promise.all([
    getOrganization(),
    getDashboard(),
    listSystems(),
    db.trainingModule.findMany({
      orderBy: { estimatedMinutes: 'asc' },
      include: { assignments: { select: { completedAt: true } } },
    }),
    currentPolicy(locale),
  ]);
  return {
    organization,
    dashboard,
    systems: systems.map((s) => ({ ...s, tier: tierOf(s) })),
    modules: modules.map((m) => ({
      title: locale === 'nl' ? m.titleNl : m.titleEn,
      assigned: m.assignments.length,
      completed: m.assignments.filter((a) => a.completedAt).length,
    })),
    policy,
  };
}

export type ReportData = Awaited<ReturnType<typeof getReportData>>;
