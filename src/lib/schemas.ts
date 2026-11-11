import { z } from 'zod';
import { questions } from '@/domain/classification/rules';
import { FORBIDDEN_DATA, HUMAN_REVIEW, PUBLIC_TOOLS } from '@/domain/policy/buildPolicy';
import {
  AUDIENCES,
  DATA_CATEGORIES,
  LOCALES,
  ROLES,
  SYSTEM_STATUSES,
  USAGE_TYPES,
  USER_GROUPS,
} from './enums';

// Request bodies of the /api/v1 endpoints. Dates travel as yyyy-mm-dd strings.

const text = (max: number) => z.string().trim().max(max);
const name = text(200).min(1);
const email = z.email().max(254).toLowerCase();
const password = z.string().min(8).max(200);

export const loginSchema = z.object({ email, password: z.string().min(1).max(200) });

export const organizationSchema = z.object({
  name,
  sector: text(200),
  employeeCount: z.number().int().min(1).max(1_000_000),
  country: text(100),
  defaultLocale: z.enum(LOCALES),
});

export const setupSchema = z.object({
  organization: organizationSchema,
  admin: z.object({ name, email, password }),
});

export const userCreateSchema = z.object({
  name,
  email,
  role: z.enum(ROLES),
  department: text(100),
  password,
});

export const userUpdateSchema = z.object({
  name: name.optional(),
  role: z.enum(ROLES).optional(),
  department: text(100).optional(),
  /** A new temporary password; the user must change it at the next login. */
  password: password.optional(),
});

export const passwordSchema = z.object({ currentPassword: z.string().min(1).max(200), password });

export const systemSchema = z.object({
  name,
  vendor: text(200),
  description: text(2000),
  purpose: text(2000),
  department: text(100),
  ownerId: z.string().min(1).optional(),
  usageType: z.enum(USAGE_TYPES),
  dataCategories: z.array(z.enum(DATA_CATEGORIES)),
  userGroup: z.enum(USER_GROUPS),
  status: z.enum(SYSTEM_STATUSES),
  nextReviewDate: z.iso.date().nullable(),
});

export const systemPatchSchema = systemSchema.partial();

export const importSchema = z.object({ csv: z.string().max(1_000_000) });

export const answersSchema = z.object({
  role: z.enum(['deployer', 'provider']),
  answers: z.partialRecord(z.enum(questions.map((q) => q.id)), z.boolean()),
});

export const actionCreateSchema = z.object({
  aiSystemId: z.string().min(1).nullable(),
  title: name,
  description: text(2000),
  dueDate: z.iso.date(),
  assigneeId: z.string().min(1).optional(),
});

export const actionPatchSchema = z.object({ status: z.enum(['OPEN', 'DONE']) });

export const policyAnswersSchema = z.object({
  approvedTools: z.array(text(200)).max(200),
  publicTools: z.enum(PUBLIC_TOOLS),
  forbiddenData: z.array(z.enum(FORBIDDEN_DATA)),
  humanReview: z.enum(HUMAN_REVIEW),
  approver: text(200).min(1),
  labelling: text(1000).min(1),
  incidentContact: text(200).min(1),
  reviewMonths: z.union([z.literal(6), z.literal(12)]),
});

export const policyCreateSchema = z.object({ locale: z.enum(LOCALES), answers: policyAnswersSchema });

export const policyPatchSchema = z.object({ title: name, contentMarkdown: z.string().min(1).max(100_000) });

export const assignSchema = z
  .object({
    moduleId: z.string().min(1),
    dueDate: z.iso.date(),
    audience: z.enum(AUDIENCES).optional(),
    userIds: z.array(z.string().min(1)).optional(),
  })
  .refine((v) => v.audience !== undefined || (v.userIds?.length ?? 0) > 0, {
    message: 'Give an audience or at least one user',
  });

export const quizSchema = z.object({ answers: z.array(z.number().int().min(0)).max(50) });
