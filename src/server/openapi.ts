import { z } from 'zod';
import * as s from '@/lib/schemas';
import { permissions, type Action } from './authorize';

type Method = 'get' | 'post' | 'patch' | 'delete';
type Endpoint = [Method, string, string, Action | null, z.ZodType?];

// One line per endpoint: method, path, summary, required permission, request body schema.
const endpoints: Endpoint[] = [
  ['post', '/setup', 'Create the organization and first admin (empty install only)', null, s.setupSchema],
  ['get', '/organization', 'Get the organization profile', 'settings:manage'],
  ['patch', '/organization', 'Update the organization profile', 'settings:manage', s.organizationSchema],
  ['get', '/users', 'List users', 'settings:manage'],
  ['post', '/users', 'Create a user', 'settings:manage', s.userCreateSchema],
  ['patch', '/users/{id}', 'Update a user or reset the password', 'settings:manage', s.userUpdateSchema],
  ['post', '/me/password', 'Change your own password', 'self', s.passwordSchema],
  ['get', '/systems', 'List AI systems with their latest assessment', 'systems:read'],
  ['post', '/systems', 'Register an AI system', 'systems:write', s.systemSchema],
  ['get', '/systems/export', 'Export the register as CSV', 'systems:read'],
  ['post', '/systems/import', 'Import AI systems from CSV', 'systems:write', s.importSchema],
  ['get', '/systems/{id}', 'Get an AI system with assessments, actions and history', 'systems:read'],
  ['patch', '/systems/{id}', 'Update an AI system', 'systems:write', s.systemPatchSchema],
  ['delete', '/systems/{id}', 'Delete an AI system', 'systems:delete'],
  ['get', '/systems/{id}/assessments', 'List the assessments of a system', 'systems:read'],
  [
    'post',
    '/systems/{id}/assessments',
    'Classify a system: store a new assessment and its actions',
    'assessments:write',
    s.answersSchema,
  ],
  ['post', '/assessments/{id}/approve', 'Approve an assessment', 'assessments:approve'],
  ['post', '/actions', 'Create an action', 'actions:write', s.actionCreateSchema],
  ['patch', '/actions/{id}', 'Mark an action open or done', 'actions:write', s.actionPatchSchema],
  ['get', '/policies', 'List policy versions', 'policy:read'],
  [
    'post',
    '/policies',
    'Generate a policy draft from the wizard answers',
    'policy:write',
    s.policyCreateSchema,
  ],
  ['get', '/policies/{id}', 'Get a policy version', 'policy:read'],
  ['patch', '/policies/{id}', 'Edit a policy draft', 'policy:write', s.policyPatchSchema],
  ['post', '/policies/{id}/publish', 'Publish a policy draft', 'policy:write'],
  ['post', '/policies/{id}/acknowledge', 'Acknowledge a published policy', 'policy:acknowledge'],
  ['get', '/policies/{id}/export', 'Download a policy as PDF or Markdown (?format=pdf|md)', 'policy:read'],
  ['get', '/training/modules', 'List training modules', 'training:read'],
  ['get', '/training/assignments', 'List training assignments (employees: their own)', 'training:read'],
  [
    'post',
    '/training/assignments',
    'Assign a module to an audience or to users',
    'training:manage',
    s.assignSchema,
  ],
  ['post', '/training/modules/{slug}/quiz', 'Submit quiz answers', 'training:read', s.quizSchema],
  ['get', '/dashboard', 'Get the dashboard figures', 'dashboard:read'],
  ['get', '/audit-log', 'List audit log entries (?page=)', 'settings:manage'],
  ['get', '/export', 'Full export (?format=json, or ?format=csv&table=)', 'reports:read'],
  ['get', '/reports/management', 'Download the management report as PDF (?locale=nl|en)', 'reports:read'],
];

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});

export function openApiDocument() {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const [method, path, summary, action, body] of endpoints) {
    const params = [...path.matchAll(/\{(\w+)\}/g)].map(([, name]) => ({
      name,
      in: 'path',
      required: true,
      schema: { type: 'string' },
    }));
    (paths[path] ??= {})[method] = {
      summary,
      description: action ? `Roles: ${permissions[action].join(', ')}.` : 'No session required.',
      ...(action && { security: [{ session: [] }] }),
      ...(params.length > 0 && { parameters: params }),
      ...(body && {
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: z.toJSONSchema(body, { io: 'input', unrepresentable: 'any' }) },
          },
        },
      }),
      responses: {
        200: { description: 'OK' },
        ...(body && { 400: errorResponse('The request body is invalid') }),
        ...(action && {
          401: errorResponse('Not signed in'),
          403: errorResponse('Your role may not do this'),
        }),
      },
    };
  }
  return {
    openapi: '3.1.0',
    info: {
      title: 'AIControl API',
      version: '1.0.0',
      description: 'REST API behind the AIControl interface. Every write is recorded in the audit log.',
      license: { name: 'Apache-2.0', identifier: 'Apache-2.0' },
    },
    servers: [{ url: '/api/v1' }],
    paths,
    components: {
      securitySchemes: { session: { type: 'apiKey', in: 'cookie', name: 'authjs.session-token' } },
      schemas: {
        Error: {
          type: 'object',
          required: ['error'],
          properties: { error: { type: 'string' }, issues: { type: 'array', items: { type: 'object' } } },
        },
      },
    },
  };
}
