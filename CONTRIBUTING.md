# Contributing to AIControl

Thank you for helping. Bug reports, translations, new training modules and improvements to the classification rules are all welcome.

## Getting started

```bash
npm install
cp .env.example .env        # point DATABASE_URL at a PostgreSQL 16 database
npm run db:migrate && npm run db:seed
npm run dev
```

## Before you open a pull request

```bash
npm run lint
npm run typecheck
npm test
npm run build && npm run e2e   # against a freshly seeded database
```

## Rules of the codebase

1. **Domain logic is pure.** Classification and policy building live in `src/domain/` and do not import Next.js or the database. Coverage of this folder stays at 100%.
2. **Every write goes through a service** in `src/server/services/` and writes its audit log entry in the same transaction.
3. **Roles are checked in one place**: add an action to `src/server/authorize.ts` and use it in `route()` and `requirePage()`.
4. **Every text in two languages.** Interface texts go into `messages/nl.json` and `messages/en.json`; rule, action and policy texts carry `nl` and `en` side by side.
5. **No external requests.** No CDN fonts, analytics or remote scripts.
6. **No `any`**, TypeScript strict.

## Changing classification rules

Rules have legal meaning. For a change in `src/domain/classification/rules.ts`:

- cite the article of the AI Act in the pull request,
- add or update the test for the rule in `engine.test.ts`,
- update `docs/classification-rules.md`.

## Design

Follow the tokens in `src/app/globals.css`. Tables over cards, sentence case, one accent colour, tier colour always with a text label. Decisions that deviate from the obvious are recorded in [DECISIONS.md](DECISIONS.md).

## Commit messages

Short, imperative, in English: `Add DPIA checklist to system detail`.

By contributing you agree that your contribution is licensed under Apache-2.0.
