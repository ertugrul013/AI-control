import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { classify } from '../src/domain/classification/engine';
import { seedSystems } from '../src/domain/classification/fixtures';
import { actionTexts } from '../src/domain/classification/rules';
import { buildPolicy, type PolicyAnswers } from '../src/domain/policy/buildPolicy';
import { trainingModules } from './seed-content';

const db = new PrismaClient();

const DEMO_PASSWORD = 'demo1234';
const DAY = 24 * 60 * 60 * 1000;
const inDays = (days: number) => new Date(Date.now() + days * DAY);

// Systems that stay without an assessment or approval, so the demo shows gaps and open work.
const NOT_ASSESSED = ['Grammarly'];
const NOT_APPROVED = ['CV screening tool', 'HR suite sentiment analysis'];

async function main() {
  // Training modules are part of the product, not of the demo: they are always present.
  for (const trainingModule of trainingModules) {
    await db.trainingModule.upsert({
      where: { slug: trainingModule.slug },
      create: trainingModule,
      update: trainingModule,
    });
  }

  if (process.env.SEED_DEMO === 'false') return console.log('Seed: SEED_DEMO=false, demo data skipped.');
  if ((await db.organization.count()) > 0)
    return console.log('Seed: organization exists, demo data skipped.');

  const organization = await db.organization.create({
    data: { name: 'Demo BV', sector: 'Zakelijke dienstverlening', employeeCount: 85, country: 'Nederland' },
  });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = (
    name: string,
    email: string,
    role: 'ADMIN' | 'EDITOR' | 'VIEWER' | 'EMPLOYEE',
    department: string,
  ) => db.user.create({ data: { name, email, role, department, passwordHash, mustChangePassword: true } });
  const admin = await user('Anna de Vries', 'admin@demo.local', 'ADMIN', 'IT');
  const editor = await user('Bram Jansen', 'editor@demo.local', 'EDITOR', 'IT');
  const viewer = await user('Carla Bakker', 'viewer@demo.local', 'VIEWER', 'Directie');
  const employee = await user('Daan Visser', 'employee@demo.local', 'EMPLOYEE', 'Sales');

  for (const [index, seed] of seedSystems.entries()) {
    const { answers, expectedTier, ...fields } = seed;
    const assessed = !NOT_ASSESSED.includes(seed.name);
    const result = classify(answers, seed.dataCategories);
    if (result.tier !== expectedTier) throw new Error(`Seed: ${seed.name} classifies as ${result.tier}`);

    const system = await db.aiSystem.create({
      data: {
        ...fields,
        ownerId: index % 2 === 0 ? editor.id : admin.id,
        // One review is overdue so the dashboard has something to report.
        nextReviewDate: !assessed ? null : seed.name === 'DeepL' ? inDays(-14) : inDays(30 + index * 40),
      },
    });
    await db.auditLog.create({
      data: {
        actorId: editor.id,
        entityType: 'AiSystem',
        entityId: system.id,
        action: 'CREATE',
        diff: { name: system.name },
      },
    });
    if (!assessed) continue;

    const approved = !NOT_APPROVED.includes(seed.name);
    const assessment = await db.riskAssessment.create({
      data: {
        aiSystemId: system.id,
        answers: { ...answers },
        resultTier: result.tier,
        rationale: result.rationale,
        assessedById: editor.id,
        version: 1,
        ...(approved && { approvedById: admin.id, approvedAt: new Date() }),
      },
    });
    await db.auditLog.create({
      data: {
        actorId: editor.id,
        entityType: 'RiskAssessment',
        entityId: assessment.id,
        action: 'CREATE',
        diff: { system: system.name, version: 1, tier: result.tier },
      },
    });
    if (approved) {
      await db.auditLog.create({
        data: {
          actorId: admin.id,
          entityType: 'RiskAssessment',
          entityId: assessment.id,
          action: 'APPROVE',
          diff: { version: 1, tier: result.tier },
        },
      });
    }
    await db.action.createMany({
      data: result.actions.map((key) => ({
        aiSystemId: system.id,
        actionKey: key,
        title: actionTexts[key].en,
        dueDate: inDays(30),
        assigneeId: system.ownerId,
        // Lower tiers are in order; the open work sits with the high-risk and prohibited systems.
        status:
          result.tier === 'MINIMAL' || result.tier === 'LIMITED' ? ('DONE' as const) : ('OPEN' as const),
      })),
    });
  }

  // One published policy, in both languages so the demo reads well in Dutch and English.
  const answers: PolicyAnswers = {
    approvedTools: seedSystems
      .filter((s) => s.status === 'APPROVED' || s.status === 'IN_USE')
      .map((s) => s.name),
    publicTools: 'withoutCompanyData',
    forbiddenData: ['personal', 'customer', 'financial', 'sourceCode', 'tradeSecrets'],
    humanReview: 'always',
    approver: 'de IT-manager',
    labelling:
      'Content die grotendeels door AI is gemaakt en extern wordt gedeeld, krijgt de vermelding "Gemaakt met hulp van AI".',
    incidentContact: 'ai@demo.local',
    reviewMonths: 12,
  };
  const english: Partial<PolicyAnswers> = {
    approver: 'the IT manager',
    labelling:
      'Content that is largely made by AI and shared outside the organization carries the note "Made with the help of AI".',
  };
  for (const [index, locale] of (['nl', 'en'] as const).entries()) {
    const localized = locale === 'en' ? { ...answers, ...english } : answers;
    const { title, markdown } = buildPolicy(localized, {
      locale,
      organization: organization.name,
      date: new Date(),
    });
    const policy = await db.policy.create({
      data: {
        version: index + 1,
        locale,
        title,
        contentMarkdown: markdown,
        wizardAnswers: { ...localized },
        status: 'PUBLISHED',
        publishedAt: new Date(),
        acknowledgements: { create: locale === 'nl' ? [{ userId: admin.id }, { userId: editor.id }] : [] },
      },
    });
    await db.auditLog.create({
      data: {
        actorId: admin.id,
        entityType: 'Policy',
        entityId: policy.id,
        action: 'PUBLISH',
        diff: { version: policy.version, locale },
      },
    });
  }

  const moduleId = async (slug: string) =>
    (await db.trainingModule.findUniqueOrThrow({ where: { slug } })).id;
  const [basics, safeUse, governance] = await Promise.all(trainingModules.map((m) => moduleId(m.slug)));
  const completed = { completedAt: inDays(-3), score: 100 };
  await db.trainingAssignment.createMany({
    data: [
      { moduleId: basics, userId: admin.id, dueDate: inDays(21), ...completed },
      { moduleId: governance, userId: admin.id, dueDate: inDays(21), ...completed },
      { moduleId: basics, userId: editor.id, dueDate: inDays(21), ...completed },
      { moduleId: safeUse, userId: editor.id, dueDate: inDays(21) },
      { moduleId: governance, userId: viewer.id, dueDate: inDays(21) },
      { moduleId: basics, userId: employee.id, dueDate: inDays(21) },
      { moduleId: safeUse, userId: employee.id, dueDate: inDays(21) },
    ],
  });

  console.log(`Seed: demo organization created. Sign in as admin@demo.local / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
