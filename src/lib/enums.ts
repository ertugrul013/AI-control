import { TIERS, type Tier } from '@/domain/classification/rules';

export { TIERS, type Tier };
export type TierOrNone = Tier | 'NONE';
/** Display order: most severe first, not-assessed last. */
export const TIERS_AND_NONE: TierOrNone[] = [...TIERS, 'NONE'];

export const ROLES = ['ADMIN', 'EDITOR', 'VIEWER', 'EMPLOYEE'] as const;
export const LOCALES = ['nl', 'en'] as const;
export const USAGE_TYPES = ['THIRD_PARTY_TOOL', 'EMBEDDED_IN_SAAS', 'IN_HOUSE'] as const;
export const DATA_CATEGORIES = ['NONE', 'BUSINESS', 'PERSONAL', 'SENSITIVE_PERSONAL'] as const;
export const USER_GROUPS = ['INTERNAL', 'CUSTOMERS', 'PUBLIC'] as const;
export const SYSTEM_STATUSES = ['PROPOSED', 'APPROVED', 'IN_USE', 'RETIRED'] as const;
export const AUDIENCES = ['ALL', 'POWER_USERS', 'MANAGEMENT'] as const;
export const ENTITIES = [
  'Organization',
  'User',
  'AiSystem',
  'RiskAssessment',
  'Action',
  'Policy',
  'PolicyAcknowledgement',
  'TrainingAssignment',
  'Export',
] as const;

export type Role = (typeof ROLES)[number];
export type Locale = (typeof LOCALES)[number];
export type Entity = (typeof ENTITIES)[number];
