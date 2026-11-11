# Decisions

Choices made where the build spec was silent or where two requirements pulled in different directions. Each one is the simplest option that is robust enough for v1.

## Product

| # | Decision | Why |
| --- | --- | --- |
| 1 | Demo data and the setup wizard are both present, switched by `SEED_DEMO`. With `true` (the default in `.env.example`) the demo organization is loaded on an empty database; with `false` the first visit goes to `/setup`. | The spec asks for a demo that works on first launch and for an onboarding wizard on first run; an empty install cannot show both. |
| 2 | Seven of the eight seed systems have an assessment; Grammarly is left "not assessed". All eight are classification fixtures in the unit tests. | "Gaps are visible" is a design principle and the hatched state is an acceptance criterion; without one unassessed system the demo cannot show it. |
| 3 | The seed publishes the policy in Dutch and in English (versions 1 and 2). One published policy per language can exist; a user has acknowledged the policy when they acknowledged any currently published version. | Policy text is free text and cannot be translated on the fly, yet the demo must read well in both languages. |
| 4 | The tier of a system is the result of its latest assessment, approved or not. Approval is shown next to it and unapproved assessments appear under "Needs your attention". | A new classification should show its risk immediately. |
| 5 | Re-classifying replaces the open generated actions of the previous assessment and keeps completed ones. Manual actions are never touched. | Avoids duplicate actions without losing work that was done. |
| 6 | A provider of a high-risk system gets one action "Arrange the provider obligations" instead of the two deployer actions about the provider's instructions and conformity documents. Other tiers get the same actions for both roles. | The spec only lists deployer actions; provider obligations are too extensive to model in v1. |
| 7 | The Article 6(3) exception only applies to Annex III areas, not to a safety component of a regulated product (Annex I). | That is how Article 6 is built. |
| 8 | "Training completed" on the dashboard counts completed assignments out of all assignments, not people. | It moves as soon as someone completes one module, which is what the onboarding flow expects. |
| 9 | Training audiences are derived from roles: ALL is everyone, POWER_USERS is Admin and Editor, MANAGEMENT is Admin and Viewer. | Avoids an extra field on users; the Viewer role is the management board. |
| 10 | Anyone can take any module; a module that was not assigned counts once it is passed. | Simple, and voluntary training is worth recording. |
| 11 | Users can be added, changed and given a new temporary password, but not deleted. | Deleting a user would break ownership and audit history; deactivation is a v2 topic. The last admin cannot be demoted. |
| 12 | The full CSV export is one file per table; the JSON export is everything in one file. | A single CSV cannot hold ten tables, and a zip would need an extra dependency. |
| 13 | Retired systems stay in the register but are left out of the dashboard figures. | The dashboard shows the current picture. |
| 14 | An employee who opens `/` is redirected to "My AI to-dos". Register, policy editing, reports and settings return 403. | The dashboard is not for employees, but a dead end on the start page would be unfriendly. |

## Technical

| # | Decision | Why |
| --- | --- | --- |
| 15 | Every write goes through `/api/v1`. Pages read through the same service functions the API uses; components never touch the database. | "API-first" without server pages making HTTP calls to themselves. Every read is also available as a GET endpoint. |
| 16 | `Organization` has no foreign keys from the other tables. | v1 is one organization per install; multi-tenancy is out of scope. |
| 17 | Extra fields on the spec's data model: `User.mustChangePassword` (forced change on first login) and `Action.actionKey` (generated actions are shown in the language of the reader). `AuditLog` has `timestamp` only, no `updatedAt`. | Needed for the required behaviour; an append-only table has no updates. |
| 18 | Role and status of the signed-in user are read from the database on every request; the session token only carries the user id. | Role changes and password resets apply immediately. |
| 19 | Pages are guarded per page with `requirePage(action)` and Next.js `forbidden()` (the `authInterrupts` flag), not with middleware. | A real 403 status with one `authorize()` helper, and no database access from the edge runtime. |
| 20 | The language is stored in a cookie; routes have no `/nl` or `/en` prefix. Dutch is the default. | The spec lists routes without a locale prefix. |
| 21 | Dark mode follows the operating system setting; there is no toggle. | One less control, no flash of the wrong theme. |
| 22 | The tier label is ink-coloured text next to a colour swatch, not white text on the tier colour. | White on the High colour (#B4690E) has a contrast of 4.2:1, below WCAG AA for small text. |
| 23 | shadcn/ui is used the shadcn way: a small set of components in `src/components/ui` (button, form controls, dialog) written with cva, Radix and the AIControl tokens. Selects are native. | Only what the screens need; native selects are accessible and need no code. |
| 24 | Markdown is rendered by a 40-line parser (`src/lib/markdown.ts`) that supports headings, lists, paragraphs and bold, for the screen and the PDF. | That is everything the templates use, and it keeps the screen and PDF output identical. Marked as a shortcut in the code. |
| 25 | PDFs use the built-in Helvetica instead of Public Sans. | No font embedding; the report is designed for black-and-white A4. |
| 26 | The OpenAPI document is generated from the same Zod schemas that validate requests, plus a hand-kept list of endpoints. Response bodies are not described in detail. | Request validation and documentation cannot drift apart; full response schemas are a v2 topic. |
| 27 | Login rate limiting (5 failures per 15 minutes per email address) is kept in memory. | Enough for a single container. Marked as a shortcut in the code: move it to the database when running more than one instance. |
| 28 | CSRF: Auth.js protects its own routes; `/api/v1` relies on the SameSite session cookie plus an Origin check on every write. | No token plumbing in every form. |
| 29 | The Docker image keeps the full `node_modules`, and starts with `prisma migrate deploy`, the idempotent seed and `next start`. | Migrations and seed need the Prisma CLI and tsx at runtime; a smaller standalone image is not worth the complexity in v1. |
| 30 | TypeScript is pinned to 5.x, Prisma to 6.x, Next.js to 15.x. | Next.js 15 cannot load `next.config.ts` with TypeScript 7, and Prisma 7+ changes how the client is configured. |
| 31 | `bcryptjs` (cost 12) instead of native `bcrypt`. | No native build step in the Alpine image. |
