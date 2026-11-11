# Architecture

AIControl is one Next.js application and one PostgreSQL database, started together with `docker compose up`.

```text
Browser
  │  pages (server components)            │  writes: fetch /api/v1/…
  ▼                                        ▼
src/app/(app)/…/page.tsx            src/app/api/v1/…/route.ts
  │  requirePage(action)                   │  route(action, zodSchema, handler)
  └───────────────┬────────────────────────┘
                  ▼
        src/server/services/*.ts      ← every write: one transaction = change + audit entry
                  │
        ┌─────────┴──────────┐
        ▼                    ▼
  src/domain/*          Prisma → PostgreSQL
  (pure functions)
```

## Layers

| Folder | Responsibility | Rules |
| --- | --- | --- |
| `src/domain/` | Classification engine and policy builder | Pure functions, no Next.js, no database. 100% unit test coverage. Also runs in the browser for the live tier preview. |
| `src/server/services/` | All reads and writes | Every write runs in a transaction that also writes the audit log entry (`audit()` in `src/server/audit.ts`). |
| `src/server/authorize.ts` | Who may do what | One table of actions and roles; `authorize(role, action)` is the only place roles are checked. |
| `src/server/api.ts` | The `/api/v1` wrapper | Session and role check, Zod validation of the body, errors to JSON, Origin check on writes. |
| `src/server/session.ts` | Current user and page guard | `requirePage(action)` redirects to the login page or returns 403. |
| `src/app/api/v1/` | REST endpoints | One line per method: permission, schema, service call. Documented at `/api/v1/openapi.json`. |
| `src/app/(app)/` | The screens behind the login | Server components read through services; client components write through the API and then refresh. |
| `src/components/` | UI | `ui/` holds the shadcn-style base components; the rest are screen-specific. |
| `src/lib/` | Shared helpers | Enums, Zod schemas, CSV, Markdown, formatting. |
| `messages/` | Interface texts | `nl.json` and `en.json` must have the same keys (checked by a unit test and by TypeScript). |

## Request flow of a write

1. A client component calls `useApi()` → `fetch('/api/v1/…')`.
2. `route()` loads the user, calls `authorize()`, and validates the body with the Zod schema.
3. The service runs a transaction: the change plus `audit(tx, actor, entity, id, action, diff)`.
4. The client shows a toast and calls `router.refresh()`, so the server components re-read through the services.

## Security

- Passwords: bcrypt, cost 12. Demo users and reset passwords must be changed at the next login.
- Sessions: Auth.js JWT cookie (HttpOnly, SameSite=Lax) that only carries the user id; role and status are read per request.
- Login is rate limited: 5 failures per 15 minutes per email address.
- Headers: Content-Security-Policy that only allows the app's own origin, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`.
- CSV exports prefix formula-like cells so spreadsheets do not execute them.
- No telemetry and no outgoing requests: fonts are self-hosted, Next.js telemetry and Prisma update checks are switched off in the image.

## Internationalisation

`next-intl` without locale prefixes: the language is a cookie (`locale`), Dutch is the default. Texts that belong to the domain (questions, rules, actions, policy templates, training modules) are stored bilingually next to the logic that uses them, so generated content follows the language of the reader.

## Data model

See [`prisma/schema.prisma`](../prisma/schema.prisma). Ten models: Organization, User, AiSystem, RiskAssessment, Action, Policy, PolicyAcknowledgement, TrainingModule, TrainingAssignment and AuditLog (append-only).
