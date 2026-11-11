import type { Role } from '@/lib/enums';

const ALL = ['ADMIN', 'EDITOR', 'VIEWER', 'EMPLOYEE'] as const;
const STAFF = ['ADMIN', 'EDITOR', 'VIEWER'] as const;
const WRITERS = ['ADMIN', 'EDITOR'] as const;
const ADMIN = ['ADMIN'] as const;

/** Which roles may perform which action. This is the only place where roles are checked. */
export const permissions = {
  'dashboard:read': STAFF,
  'systems:read': STAFF,
  'systems:write': WRITERS,
  'systems:delete': ADMIN,
  'assessments:write': WRITERS,
  'assessments:approve': ADMIN,
  'actions:write': WRITERS,
  'policy:read': ALL,
  'policy:acknowledge': ALL,
  'policy:write': ADMIN,
  'training:read': ALL,
  'training:overview': STAFF,
  'training:manage': ADMIN,
  'reports:read': ['ADMIN', 'VIEWER'],
  'settings:manage': ADMIN,
  self: ALL,
} as const satisfies Record<string, readonly Role[]>;

export type Action = keyof typeof permissions;

export function authorize(role: Role, action: Action): boolean {
  return (permissions[action] as readonly Role[]).includes(role);
}
