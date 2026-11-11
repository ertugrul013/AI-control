# AIControl — One-Shot Build Spec

Nov 10, 2026 · @Ertugrul Yesil

## How to use this with Fable 5.2

Export this doc as Markdown and paste it whole into Fable 5.2 below the prompt here. Everything Fable needs is in this spec, so it should not have to ask questions.

```markdown
You are building AIControl, an open-source, self-hostable AI governance tool for small and medium businesses (SMEs/MKB). The full specification follows below. Build the complete, runnable v1 in one go.

Rules:
- Deliver every file in full. No placeholders, no TODOs, no "implement later".
- Follow the stack, data model, screens and acceptance criteria exactly.
- Follow the "UX and UI design" section strictly, including its tokens, wireframes, "Do not use" list and the patterns under "Design system references". Build on shadcn/ui, restyled with the AIControl tokens; borrow patterns from those design systems, never their branding, logos or fonts.
- Where the spec is silent, choose the simplest robust option and list the decision in DECISIONS.md.
- The app must start with one command: docker compose up.
- Include seed data so the demo works on first launch.
- Finish with: the full file tree, then each file, then exact run instructions.
- If output gets long, continue in follow-up parts without skipping or summarising files.

SPECIFICATION:
[paste the rest of this doc here]
```

If Fable stops partway, reply: "Continue exactly where you stopped. Do not repeat or summarise earlier files."

## Product vision and positioning

AIControl gives an SME of 10–500 employees a complete, auditable picture of its AI use in one afternoon: what AI it uses, how risky each use is, who is trained, and which policy applies.

**Problem.** Most SMEs use ChatGPT, Copilot and AI features inside existing SaaS without any register or policy. Commercial governance platforms are priced and designed for enterprises.

**Why now.** The Digital Omnibus on AI, Regulation (EU) 2026/1744, entered into force on 27 July 2026 ([source](https://forkast.news/eus-ai-act-teeth-pulled-by-digital-omnibus-deferring-high-risk-obligations-16-months/)). Standalone high-risk (Annex III) obligations now apply from 2 December 2027 and product-embedded (Annex I) from 2 August 2028; prohibited practices have applied since 2 February 2025 ([source](https://compliancehub.wiki/blog/eu-digital-omnibus-ai-act-deadline-deferral-annex-iii-2027)). Companies now have roughly a year to get their house in order, which is exactly what this tool supports.

**Target users.**

- IT manager or information manager who owns AI governance (primary user)
- Management board that signs off the policy (read-only reports)
- Employees who complete AI literacy training and acknowledge the policy

**Positioning.** Free, open source, self-hosted, data never leaves the company. Dutch and English from day one. Practical, not legalistic: it helps a company take control, it does not replace a lawyer.

**Disclaimer in the app.** AIControl supports governance and documentation; it is not legal advice. Classification results are indicative and must be reviewed by a responsible person.

## Scope v1

v1 ships six modules; everything else waits for v2 so the one-shot build stays achievable.

| # | Module | What it does |
| --- | --- | --- |
| 1 | AI register | CRUD for every AI system or tool in use: name, vendor, purpose, owner, department, data processed, status, review date |
| 2 | Risk classification | Guided questionnaire per system that results in a risk tier plus explanation (see Risk classification logic) |
| 3 | Policy generator | Wizard that produces a company AI policy in NL or EN, editable, versioned, exportable as PDF and Markdown |
| 4 | AI literacy tracking | Training modules, assignment to employees, completion status, policy acknowledgement |
| 5 | Dashboard | Counts per risk tier, overdue reviews, training completion %, open actions |
| 6 | Audit log and export | Every change logged; full export as JSON and CSV, management report as PDF |

**Out of scope for v1:** multi-tenant SaaS hosting, billing, SSO beyond OIDC, automatic discovery of AI tools on the network, integrations with HR systems, DPIA workflow, mobile app.

## Tech stack and architecture

One TypeScript monorepo, one container for the app, one for the database, started with `docker compose up`.

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), TypeScript strict mode |
| UI | Tailwind CSS + shadcn/ui, restyled with the AIControl tokens (see UX and UI design), light and dark mode |
| UI patterns | GOV.UK "check answers" and task list patterns, Carbon data table rules, NL Design System accessibility approach (see Design system references) |
| Typography | Public Sans, self-hosted via @fontsource/public-sans, tabular numerals |
| Icons | lucide-react, 16px, navigation and status only |
| i18n | next-intl, Dutch (default) and English, visible language switch in the header, all UI and generated content translated |
| Database | PostgreSQL 16 via Prisma ORM; migrations and seed script included |
| Auth | Auth.js: email + password (bcrypt) by default, optional OIDC provider (e.g. Microsoft Entra ID) via env vars |
| Roles | Admin, Editor, Viewer, Employee |
| API | REST route handlers under `/api/v1`, validated with Zod, documented in an OpenAPI 3.1 file at `/api/v1/openapi.json` |
| PDF | @react-pdf/renderer for policy and management report |
| Tests | Vitest (unit, classification engine 100% covered), Playwright (3 end-to-end flows) |
| Deploy | Multi-stage Dockerfile, docker-compose.yml with app + postgres + volume, `.env.example` |

**Architecture rules.**

1. API-first: every UI action goes through the `/api/v1` endpoints; no direct database calls from components.
2. Domain logic lives in `src/domain/` as pure functions (classification engine, policy builder), independent of Next.js.
3. Every write goes through a service layer that also writes an audit log entry in the same transaction.
4. Role checks happen server-side in a single `authorize(role, action)` helper.
5. No external network calls at runtime. No telemetry. All data stays on the host.

## Data model

Ten Prisma models cover v1; all have `id` (cuid), `createdAt` and `updatedAt`.

| Model | Key fields | Relations |
| --- | --- | --- |
| Organization | name, sector, employeeCount, country, defaultLocale (nl/en) | has many of everything below (single org per install in v1) |
| User | name, email, passwordHash, role (ADMIN/EDITOR/VIEWER/EMPLOYEE), department, locale | assessments, trainingAssignments, acknowledgements |
| AiSystem | name, vendor, description, purpose, department, ownerId, usageType (THIRD\_PARTY\_TOOL / EMBEDDED\_IN\_SAAS / IN\_HOUSE), dataCategories\[\] (NONE / BUSINESS / PERSONAL / SENSITIVE\_PERSONAL), userGroup (INTERNAL / CUSTOMERS / PUBLIC), status (PROPOSED / APPROVED / IN\_USE / RETIRED), nextReviewDate | owner (User), assessments, actions |
| RiskAssessment | aiSystemId, answers (JSON), resultTier (PROHIBITED / HIGH / LIMITED / MINIMAL), rationale (JSON list of triggered rules), assessedById, approvedById?, approvedAt?, version | aiSystem, assessor, approver |
| Action | aiSystemId?, title, description, dueDate, assigneeId, status (OPEN / DONE) | generated from assessment rules or created manually |
| Policy | version, locale, title, contentMarkdown, wizardAnswers (JSON), status (DRAFT / PUBLISHED / ARCHIVED), publishedAt? | acknowledgements |
| PolicyAcknowledgement | policyId, userId, acknowledgedAt | unique per policy + user |
| TrainingModule | slug, titleNl, titleEn, contentNl, contentEn (Markdown), quiz (JSON), estimatedMinutes, audience (ALL / POWER\_USERS / MANAGEMENT) | assignments |
| TrainingAssignment | moduleId, userId, assignedAt, dueDate, completedAt?, score? | unique per module + user |
| AuditLog | actorId, entityType, entityId, action (CREATE / UPDATE / DELETE / APPROVE / PUBLISH / EXPORT), diff (JSON), timestamp | append-only, never updated or deleted |

**Seed data:** one demo organization, four users (one per role, password `demo1234`, forced change on first login), eight AI systems (ChatGPT, Microsoft 365 Copilot, DeepL, a CV-screening tool, a customer chatbot, Grammarly, a GIS image-recognition model, an AI feature in an HR system) with assessments covering all four tiers, three training modules in NL and EN, one published policy.

## Screens and user flows

Twelve screens, a left sidebar for navigation and the language switch plus user menu in the header.

| Route | Screen | Roles |
| --- | --- | --- |
| `/login` | Login, first-login password change | all |
| `/setup` | Onboarding wizard on first run: organization name, sector, size, locale, first admin | first admin |
| `/` | Dashboard: tiles per risk tier, overdue reviews, training completion %, open actions, recent audit events | Admin, Editor, Viewer |
| `/systems` | AI register table with search, filters (tier, status, department), CSV import and export | Admin, Editor, Viewer |
| `/systems/[id]` | System detail: fields, latest assessment, assessment history, actions | Admin, Editor, Viewer |
| `/systems/[id]/assess` | Step-by-step classification questionnaire with live tier preview | Admin, Editor |
| `/policy` | Policy versions list, current published version | all |
| `/policy/wizard` | Policy wizard (8 questions) → generated draft → Markdown editor → publish | Admin |
| `/training` | Module overview and assignments; employees see only their own | all |
| `/training/[slug]` | Read module, take quiz (pass at 80%) | all |
| `/reports` | Management report PDF, full JSON/CSV export | Admin, Viewer |
| `/settings` | Users and roles, organization profile, audit log viewer | Admin |

**Three core flows (also the Playwright tests):**

1. Register and classify: Editor adds "CV screening tool" → completes questionnaire → result HIGH with rationale → actions are created automatically → Admin approves the assessment.
2. Publish policy: Admin runs the wizard → edits the draft → publishes v1 → all employees get an acknowledgement task.
3. Employee onboarding: Employee logs in → sees assigned training and policy → completes module and quiz → acknowledges policy → dashboard completion % rises.

## UX and UI design

AIControl should feel like a well-kept register at a serious organization: calm, dense with information, and readable at a glance. One element is allowed to be memorable, the risk strip; everything else stays quiet.

**Design principles.**

1. Answer first. Every screen opens with a plain sentence that says what matters, then the detail.
2. Tables over cards. The register is the product; lists of things are tables, not grids of tiles.
3. Show why. Every risk tier, warning or number can be opened to see the rule or data behind it.
4. Gaps are visible. "Not yet assessed" is a real state with its own look, never hidden.
5. One way to do each thing. Each action has one name and one place.

**Tokens.**

| Token | Value | Use |
| --- | --- | --- |
| Ink | #1C2430 | Body text, headings |
| Paper | #FFFFFF | Page background |
| Shelf | #F2F4F6 | Sidebar, table header, inactive surfaces |
| Rule | #D8DDE3 | Borders and dividers (1px) |
| Action | #1F4E79 | Primary buttons, links, focus ring |
| Prohibited | #8E1B2B | Tier colour |
| High | #B4690E | Tier colour |
| Limited | #2F6690 | Tier colour |
| Minimal | #5E8566 | Tier colour |
| Not assessed | #9AA3AD, diagonal hatch | Missing assessment |

Dark mode uses the same tier hues, lightened one step, on #12181F. Tier colour always comes with a text label; colour is never the only signal.

**Typography.** Public Sans (the open-source typeface built for government interfaces), self-hosted via @fontsource so no external requests. Scale: 14px body, 13px table cells, 16px section titles, 22px page titles, weights 400 and 600 only. Tabular numerals everywhere numbers appear. Sentence case for every label, button and heading.

**Shape and depth.** Radius 4px on inputs and buttons, 6px on panels, none on tables. No shadows except on menus and dialogs. No gradients.

**Signature element: the risk strip.** At the top of the dashboard, one horizontal bar where every AI system is an equal-width segment, sorted by tier and coloured by it, with not-assessed systems hatched. Hover shows the name and tier; click opens the system. It shows the whole AI landscape and its gaps in one look.

**Dashboard wireframe.**

```text
+--------------------------------------------------------------+
| 14 AI systems registered. 2 need action, 3 are not assessed. |
| High-risk obligations apply from 2 Dec 2027 (387 days).      |
|                                                              |
| [##][##][##][==][==][==][==][..][..][..][::][::][::]         |
|  Prohibited 0  High 2  Limited 4  Minimal 5  Not assessed 3  |
|--------------------------------------------------------------|
| Needs your attention          | Coverage                     |
| - CV screening: approve       | Assessed        11/14  79%   |
| - Chatbot: label AI output    | Trained         38/52  73%   |
| - 2 reviews overdue           | Policy signed   45/52  87%   |
|--------------------------------------------------------------|
| Department x tier             | Upcoming reviews             |
| (small heat table)            | (next 5, date + system)      |
+--------------------------------------------------------------+
```

**System detail wireframe** (a dossier: facts left, history right).

```text
+-------------------------------------+------------------------+
| CV screening tool       [High]      | History                |
| Vendor, owner, department, status   | 12 Nov  Assessed (v2)  |
|-------------------------------------| 03 Oct  Owner changed  |
| Why high                            | 01 Sep  Registered     |
| - Used in recruitment (Annex III 4) |                        |
| - Profiles candidates: no exception |                        |
|-------------------------------------|                        |
| Actions  [ ] Assign oversight owner |                        |
|          [x] Inform employees       |                        |
+-------------------------------------+------------------------+
```

**Insightful features that stay simple.**

- Live tier preview: while answering the questionnaire, a side panel shows the current tier and which answer triggered it, so the logic is learned, not hidden.
- Quick-add catalogue: an empty register offers one-click presets for common tools (ChatGPT, Microsoft 365 Copilot, DeepL, Grammarly, Gemini, Notion AI) with vendor and purpose prefilled.
- Countdown: the dashboard counts days to the next applicable AI Act date, only when the organization has a high-risk system.
- Assessment diff: comparing two versions highlights the changed answers and the tier change.
- My AI to-dos: employees get one page with their training, quiz and policy acknowledgement, nothing else.
- Department × tier table: a small heat table that shows which department carries the most risk.
- Print-ready report: the management report uses the same tokens and reads well on A4 in black and white.

**Copy rules.** Plain verbs, consistent names: "Classify" opens the questionnaire, "Approve assessment" produces the toast "Assessment approved". Empty states say what to do next, e.g. "No AI systems yet. Add the tools your team uses daily." Errors state what happened and how to fix it, without apologising.

**Do not use** (these make it look generated): gradient backgrounds or text, glassmorphism, emoji as icons, grids of identical rounded cards, big-number stat tiles with icons, all-caps labels above headings, arrows appended to button text, decorative fade-in on every section, more than one accent colour outside the tier palette. Icons from lucide-react, 16px, only where they aid scanning (navigation, status).

**Motion.** Only to confirm an action or reveal what changed: 150ms ease-out, respects reduced-motion.

### Design system references

Build on shadcn/ui for the components, and borrow patterns and rules from public-sector and enterprise design systems: they are tested with real users and look trustworthy rather than generated. Borrow patterns, never their branding.

| Design system | What to take for AIControl | Why it fits |
| --- | --- | --- |
| [NL Design System](https://www.github.com/nl-design-system) | Accessible component patterns and the layered token approach | The Dutch government's community design system, used by Utrecht, Den Haag, RVO, Amsterdam and Logius; open source under EUPL v1.2, documentation CC0 |
| [Amsterdam Design System](https://oss.developer.overheid.nl/repositories/235bba28-3fe0-4e55-9660-0c68a720743a) | A reference for clean React components and design tokens in a Dutch context | Ships separate CSS, React and token packages, WCAG-accessible, built on NL Design System |
| [GOV.UK Design System](https://design-system.service.gov.uk/patterns/check-answers) | The "check answers" pattern before saving an assessment; the task list pattern for employee to-dos; plain-language naming | Its patterns are named by what they help users do and written for non-experts |
| [U.S. Web Design System](https://designsystem.digital.gov/design-tokens/typesetting/font) | Public Sans and its accessible colour approach | Public Sans is free (SIL OFL 1.1) and has tabular numerals for data design |
| [Carbon Design System](https://carbondesignsystem.com/components/data-table/usage/) | Data table rules for the register: left-aligned text, row hover, sort icon only on the sorted column, toolbar for search and export | IBM's system for dense enterprise data, with detailed table guidance |

**Patterns to apply directly.**

- Questionnaire: one topic per step, then a "check your answers" summary with change links before the assessment is saved.
- Employee page: a task list with status per item (not started, in progress, done).
- Register: Carbon-style table with row dividers instead of zebra stripes, sortable headers and a toolbar for search, filter and export.

**Watch out:** NL Design System repositories keep proprietary assets (logos, house-style fonts) outside the open-source licence, and GOV.UK's official font is reserved for UK government services. Use the patterns and code, not those assets.

## Risk classification logic

Classification is a pure, data-driven rules engine: questions and rules live in `src/domain/classification/rules.ts`, the highest triggered tier wins, and every result lists the rules that triggered it.

**Order of evaluation:** PROHIBITED → HIGH → LIMITED → MINIMAL. The engine stops raising the tier once PROHIBITED is reached but always records every triggered rule.

**Step 1: Role.** Ask whether the organization built the system (provider) or uses a third-party system (deployer). Store it; it decides which actions are generated. Most SMEs are deployers.

**Step 2: Prohibited practices (Article 5).** Yes on any → PROHIBITED, action "Stop use immediately and consult legal counsel".

- Social scoring of people leading to unjustified detrimental treatment
- Manipulative or deceptive techniques, or exploiting vulnerabilities (age, disability, social or economic situation), causing significant harm
- Emotion recognition of employees or students (except medical or safety reasons)
- Untargeted scraping of facial images to build recognition databases
- Biometric categorisation inferring sensitive traits (e.g. ethnicity, political opinions, sexual orientation)
- Predicting criminal offences based solely on profiling

**Step 3: High-risk areas (Annex III).** Yes on any → candidate HIGH.

- Biometric identification or categorisation
- Safety component of critical infrastructure (energy, water, traffic, digital infrastructure)
- Education: admission, grading, monitoring of students
- Employment: recruitment and CV screening, decisions on promotion or termination, task allocation based on behaviour or traits, monitoring and evaluating performance
- Access to essential services: creditworthiness, life or health insurance pricing, public benefits, emergency call triage
- Law enforcement, migration and border control, administration of justice or elections
- Safety component of a product covered by EU product legislation (Annex I, e.g. machinery, vehicles, medical devices)

**Step 4: Exception check (Article 6(3)).** For an Annex III candidate, ask whether the system only performs a narrow procedural task, improves the result of a completed human activity, detects patterns without replacing human assessment, or performs a preparatory task. If yes AND it does not profile natural persons → downgrade to LIMITED or MINIMAL, but generate the action "Document why this system is not high-risk and register it in the EU database". Profiling always keeps it HIGH.

**Step 5: Transparency (Article 50).** Yes on any → LIMITED.

- Interacts directly with people (chatbot, voice assistant)
- Generates or manipulates text, images, audio or video shown to others (including deepfakes)
- Emotion recognition or biometric categorisation not covered by step 2

**Step 6: Otherwise** → MINIMAL.

**Generated actions per tier (deployer):**

| Tier | Actions created automatically |
| --- | --- |
| PROHIBITED | Stop use; consult legal counsel; document decision |
| HIGH | Assign human oversight owner; follow provider instructions for use; keep logs; inform affected employees; check provider's conformity documentation; check whether a fundamental rights impact assessment applies; review every 6 months. Show the applicability date (2 December 2027 for Annex III, 2 August 2028 for Annex I) |
| LIMITED | Inform users they interact with AI; label AI-generated content; review every 12 months |
| MINIMAL | Record in register; follow company AI policy; review every 12 months |

Always add the action "Check whether GDPR applies (DPIA)" when `dataCategories` contains PERSONAL or SENSITIVE\_PERSONAL. Rule texts are bilingual and carry the article reference shown to the user.

## Policy generator and AI literacy tracking

Both are template-driven and run fully offline: no LLM is required for v1.

**Policy wizard: 8 questions.**

1. Which AI tools are approved? (pre-filled from register items with status APPROVED or IN\_USE)
2. May employees use free public AI tools? (no / only without company data / yes)
3. Which data may never be entered into AI tools? (multi-select: personal data, customer data, financial data, source code, trade secrets)
4. Is human review required before AI output is sent externally? (yes / only for customer-facing content)
5. Who approves new AI tools? (role or named person)
6. How must AI-generated content be labelled?
7. Where do employees report incidents or doubts?
8. Review frequency of the policy (6 / 12 months)

**Generation.** `src/domain/policy/buildPolicy.ts` combines answers with section templates (NL and EN Markdown in `src/domain/policy/templates/`) into 9 sections: purpose and scope, definitions, approved tools, prohibited use, data rules, human oversight, transparency and labelling, roles and approval process, incidents and review. Output is editable Markdown; publishing creates an immutable version and acknowledgement tasks for every user.

**AI literacy.** Three seeded modules, each with a 5-question quiz and a pass mark of 80%:

| Module | Audience | Minutes |
| --- | --- | --- |
| What is AI and how do these tools work | ALL | 15 |
| Using AI safely at work: data, privacy, output checking | ALL | 20 |
| AI governance and the AI Act for managers | MANAGEMENT | 25 |

Admins assign modules by audience or per user, with a due date. The dashboard shows completion % per department, and the management report includes a literacy section as evidence of the organization's training effort.

## Repo structure, quality and open-source setup

The repo must look professional on first visit: that is half the LinkedIn value.

```text
aicontrol/
├── .github/
│   ├── workflows/ci.yml          # lint, typecheck, unit, e2e, docker build
│   ├── ISSUE_TEMPLATE/           # bug, feature
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── architecture.md
│   ├── classification-rules.md   # human-readable rules with article references
│   └── screenshots/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── messages/
│   ├── nl.json
│   └── en.json
├── src/
│   ├── app/                      # Next.js routes and /api/v1 handlers
│   ├── components/
│   ├── domain/
│   │   ├── classification/       # rules.ts, engine.ts, engine.test.ts
│   │   └── policy/               # buildPolicy.ts, templates/nl, templates/en
│   ├── server/                   # services, authorize.ts, audit.ts, db.ts
│   └── lib/
├── e2e/                          # 3 Playwright flows
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── README.md                     # NL + EN, screenshots, quick start
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── DECISIONS.md
├── CHANGELOG.md
└── LICENSE                       # Apache-2.0
```

**Quality bar.**

- ESLint + Prettier, TypeScript strict, zero `any`
- Classification engine: 100% unit test coverage, one test per rule plus the 8 seed systems as fixtures
- Security: rate-limited login, CSRF protection via Auth.js, secure headers, input validation on every endpoint, passwords bcrypt cost 12
- Accessibility: keyboard navigable, labels on all inputs, WCAG AA contrast
- README opens with a one-line pitch, a screenshot of the dashboard, and a three-command quick start

## Acceptance criteria

v1 is done when every box below is checked on a clean machine with only Docker installed.

- [ ] `git clone` → `cp .env.example .env` → `docker compose up` gives a working app on `http://localhost:3000` within 3 minutes
- [ ] Migrations and seed run automatically on first start; demo login works
- [ ] Every screen and all generated content switch fully between Dutch and English
- [ ] The 8 seed systems classify into the expected tiers: CV screening tool = HIGH, customer chatbot = LIMITED, ChatGPT used internally = MINIMAL, at least one PROHIBITED example
- [ ] Approving an assessment and publishing a policy both write audit log entries
- [ ] Employee role cannot reach any register, policy-editing or settings route (server-side 403)
- [ ] Policy and management report export as valid PDF in both languages
- [ ] Full data export as JSON and CSV matches the database contents
- [ ] The dashboard opens with the summary sentence and the risk strip, matching the wireframe; not-assessed systems are hatched
- [ ] The questionnaire ends with a "check your answers" summary with change links before saving
- [ ] The employee page is a task list with a status per item
- [ ] The register table follows the Carbon rules: row dividers, left-aligned text, sort icon only on the sorted column, toolbar for search, filter and export
- [ ] Nothing from the "Do not use" list appears anywhere; tier colour always has a text label; keyboard navigation and WCAG AA contrast pass
- [ ] No fonts, scripts or styles load from external hosts
- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run e2e` all pass; CI is green
- [ ] No outgoing network requests at runtime (verified by running with networking disabled after build)
- [ ] README, CONTRIBUTING, SECURITY and DECISIONS are complete

## After the build: launch and LinkedIn plan

This section is for you, not for Fable: leave it out when pasting the spec.

| Week | Step | LinkedIn post |
| --- | --- | --- |
| 1 | Run it locally, fix what Fable got wrong, test classification against your own judgement | none yet |
| 2 | Use it on a real (anonymised) inventory of AI tools you know from practice | "Most SMEs I talk to have no idea which AI tools their people use. So I built a free tool to fix that." + dashboard screenshot |
| 3 | Publish on GitHub, add screenshots and a 60-second demo video | Launch post with repo link and the demo video |
| 4 | Ask 3–5 IT managers in your network to try it and give feedback | "What 5 IT managers taught me about AI governance" |
| Monthly | Ship a small release (e.g. DPIA checklist, OIDC docs, new training module) | One post per release on a specific AI Act topic |

Each post links the repo and positions you as the person who makes AI governance practical for SMEs, which feeds both your IT transformation profile and YESIL.

**Sources**

- [Regulation (EU) 2026/1744 entry into force](https://forkast.news/eus-ai-act-teeth-pulled-by-digital-omnibus-deferring-high-risk-obligations-16-months/)
- [Updated AI Act timeline after the Digital Omnibus](https://compliancehub.wiki/blog/eu-digital-omnibus-ai-act-deadline-deferral-annex-iii-2027)
- [SME definitions and simplified documentation in the Omnibus](https://secureprivacy.ai/blog/eu-ai-act-digital-omnibus-the-new-high-risk-ai-deadlines-after-council-approval)
