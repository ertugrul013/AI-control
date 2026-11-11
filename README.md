<h1 align="center">AIControl</h1>

<p align="center">
  <strong>Know your AI, tool by tool.</strong><br />
  Free, open-source AI governance for small and medium businesses.<br />
  One afternoon from "which AI do we even use?" to a register, risk tiers, a policy and trained people.
</p>

<p align="center">
  <img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-1F4E79" />
  <img alt="Runs with Docker Compose" src="https://img.shields.io/badge/run-docker%20compose%20up-1F4E79" />
  <img alt="Self-hosted, no telemetry" src="https://img.shields.io/badge/self--hosted-no%20telemetry-5E8566" />
  <img alt="Dutch and English" src="https://img.shields.io/badge/i18n-NL%20%7C%20EN-2F6690" />
  <img alt="EU AI Act" src="https://img.shields.io/badge/EU%20AI%20Act-ready%20to%20document-B4690E" />
</p>

<p align="center">
  <img src="docs/screenshots/demo.gif" alt="The risk strip fills in tier by tier and lands in the AIControl dashboard" width="900" />
</p>

<p align="center">
  <a href="#-quick-start">Quick start</a> ·
  <a href="#-setup-from-a-to-z">Setup A to Z</a> ·
  <a href="#-your-first-afternoon">First afternoon</a> ·
  <a href="#-running-it-day-to-day">Day to day</a> ·
  <a href="#-troubleshooting">Troubleshooting</a> ·
  <a href="#-nederlands">Nederlands</a>
</p>

> [!NOTE]
> AIControl supports governance and documentation; it is **not legal advice**. Classification results are indicative and must be reviewed by a responsible person.

---

## ✨ Why AIControl

Most companies use ChatGPT, Copilot and AI features hidden inside their SaaS tools without a register, a risk assessment or a policy. Enterprise governance platforms are priced and built for enterprises. AIControl is for the company with 10 to 500 people that just wants to take control:

- **Self-hosted.** Your data never leaves your server. No telemetry, no external fonts, scripts or calls at runtime.
- **Practical, not legalistic.** Plain questions, plain answers, and the AI Act article behind every result.
- **Bilingual from day one.** Every screen and every generated document in Dutch and English.

The EU AI Act's high-risk obligations for Annex III systems apply from **2 December 2027** (after the Digital Omnibus, Regulation (EU) 2026/1744). Prohibited practices have been banned since 2 February 2025. That leaves roughly a year to get your house in order.

## 🧭 What's inside

| | Module | What you get |
| --- | --- | --- |
| 📋 | **AI register** | Every AI system in use: vendor, purpose, owner, department, data, status and review date. Search, filter, sort, CSV import and export, plus one-click presets for common tools. |
| ⚖️ | **Risk classification** | A step-by-step questionnaire per system with a live tier preview and a "check your answers" page. You get prohibited, high, limited or minimal, with the rules and articles that caused it and the actions that follow. [The rules →](docs/classification-rules.md) |
| 📝 | **Policy generator** | Eight questions produce a company AI policy in Dutch or English. Edit it in Markdown, publish versions, and export them as PDF or Markdown. |
| 🎓 | **AI literacy** | Three training modules with a quiz, assigned per audience or person. Employees get one to-do list with their training and the policy acknowledgement. |
| 📊 | **Dashboard** | The risk strip shows every system and every gap at a glance. Below it: what needs attention, coverage, department by tier, upcoming reviews and the AI Act countdown. |
| 🧾 | **Audit and export** | Every change is logged, append-only. Full export as JSON and CSV, and a print-ready management report as PDF. |

**Roles:** Admin (everything), Editor (register and classification), Viewer (read and reports, for the board), Employee (own training and policy only).

---

## 🚀 Quick start

All you need is [Docker](https://docs.docker.com/get-docker/).

```bash
git clone <repository-url> aicontrol && cd aicontrol
cp .env.example .env
docker compose up
```

Open **<http://localhost:3000>** and sign in with `admin@demo.local` / `demo1234`. That's the demo. For real use, follow the setup below.

---

## 🛠 Setup from A to Z

### A. Check the requirements

| You need | Why |
| --- | --- |
| Docker with Compose v2 (Docker Desktop, OrbStack or Docker Engine on Linux) | Runs the app and its PostgreSQL database |
| Git | To get the code and updates |
| About 2 GB free RAM and 2 GB disk | For the build and the database |
| Port 3000 free | Where the app listens (you can change it, see [Troubleshooting](#-troubleshooting)) |

Check that Docker works:

```bash
docker compose version
```

### B. Get the code

```bash
git clone <repository-url> aicontrol
cd aicontrol
```

### C. Configure `.env`

```bash
cp .env.example .env
```

Open `.env` and set these three values **before the first start**:

| Variable | Set it to | Why |
| --- | --- | --- |
| `AUTH_SECRET` | the output of `openssl rand -base64 32` | Signs the session cookies. Never keep the example value. |
| `POSTGRES_PASSWORD` | a long random password | The database password. It only applies when the database is created on the first start. |
| `SEED_DEMO` | `false` for real use, `true` to try the demo | `true` loads a demo company with four demo users. `false` starts empty and shows the setup wizard. |

> [!IMPORTANT]
> The demo data is only loaded into an **empty** database, so decide on `SEED_DEMO` before your first start. If you started with the demo and now want a clean install, see [Start over](#start-over) (this deletes all data).

### D. Start it

```bash
docker compose up -d
```

The first start builds the image and takes a few minutes. Every start runs the database migrations automatically. Follow along with:

```bash
docker compose logs -f app
```

It's ready when you see `✓ Ready`. Press `Ctrl+C` to stop following the logs; the app keeps running.

### E. Sign in for the first time

**With `SEED_DEMO=false`.** Open <http://localhost:3000> and the setup wizard appears. Enter your organization (name, sector, size, default language) and create the first admin account. Then sign in with that account.

**With `SEED_DEMO=true`.** Sign in with one of the demo accounts. The password for all four is `demo1234`, and each one asks for a new password at the first sign-in.

| Demo user | Email | Role | Try |
| --- | --- | --- | --- |
| Anna de Vries | `admin@demo.local` | Admin | Everything, including approving and publishing |
| Bram Jansen | `editor@demo.local` | Editor | Register and classify systems |
| Carla Bakker | `viewer@demo.local` | Viewer | The board's view: dashboard and reports |
| Daan Visser | `employee@demo.local` | Employee | The to-do list: training, quiz, policy |

### F. Add your people

As admin, go to **Settings → Users and roles**:

1. Add each colleague with their name, email, department, role and a temporary password. They choose their own password at the first sign-in.
2. Give the management board the **Viewer** role and staff the **Employee** role; keep **Editor** and **Admin** for the people who maintain the register.
3. If someone forgets their password, use **Reset password** to give them a new temporary one.

### G. Optional: single sign-on (Microsoft Entra ID or any OIDC provider)

<details>
<summary>Set up OIDC</summary>

1. Register an application with your identity provider. For Entra ID: **App registrations → New registration**.
2. Set the redirect URI to `https://<your-aicontrol-address>/api/auth/callback/oidc`.
3. Create a client secret, then fill in `.env`:

   ```dotenv
   OIDC_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0
   OIDC_CLIENT_ID=<application-client-id>
   OIDC_CLIENT_SECRET=<client-secret>
   OIDC_NAME=Microsoft
   ```

4. Apply the change with `docker compose up -d`.

The sign-in page then shows **Sign in with Microsoft**. Only people who already exist in AIControl with the same email address can sign in, so add them under Settings first. Their role still comes from AIControl.

</details>

### H. Put it behind HTTPS

Run AIControl on a server in your network, or put a reverse proxy with HTTPS in front of it when it must be reachable from outside.

<details>
<summary>Example with Caddy (automatic HTTPS certificates)</summary>

```caddyfile
aicontrol.example.com {
    reverse_proxy localhost:3000
}
```

Keep the `Host` header intact (Caddy and most proxies do by default). AIControl uses it to refuse cross-origin writes.

</details>

### I. Go-live checklist

- [ ] `AUTH_SECRET` replaced with a random value
- [ ] `POSTGRES_PASSWORD` replaced before the first start
- [ ] `SEED_DEMO=false`, so no demo accounts exist
- [ ] HTTPS in front of the app when it is reachable outside your network
- [ ] A daily [backup](#back-up-and-restore) of the database
- [ ] Every colleague added, with the right role

---

## 🗓 Your first afternoon

A practical route from nothing to an auditable picture:

1. **Register (≈ 30 min).** Go to **AI register**. Start with the one-click presets (ChatGPT, Microsoft 365 Copilot, DeepL, Grammarly, Gemini, Notion AI). Then add the rest, including AI features inside tools you already pay for. Got a spreadsheet? Use **Export CSV** to get the column layout, fill it in and use **Import CSV**.
2. **Classify (≈ 5 min per system).** Open a system and click **Classify**. Answer the questions; the panel on the right shows the tier and why, live. Check your answers and save. AIControl creates the actions that follow, such as human oversight, logging or a GDPR check.
3. **Approve.** An admin reviews each assessment and clicks **Approve assessment**. Everything is in the audit log.
4. **Write the policy (≈ 20 min).** Go to **AI policy → Create a new version**, answer eight questions, edit the draft and **Publish**. Every user gets an acknowledgement task.
5. **Train.** Under **My AI to-dos**, assign the modules to everyone, to management or to a person, with a due date.
6. **Report.** The **Dashboard** shows where you stand. Under **Reports**, download the management report (PDF, Dutch or English) for the board, or export everything as JSON or CSV.

> [!TIP]
> "Not assessed" is a real state in AIControl. It is hatched in the risk strip, so gaps stay visible until they are closed.

---

## 🔁 Running it day to day

### Update to a new version

```bash
git pull
docker compose up -d --build
```

Database migrations run automatically on start, and your data is kept.

### Back up and restore

```bash
# Back up: one SQL file with everything
docker compose exec -T db pg_dump -U aicontrol --clean --if-exists aicontrol > aicontrol-$(date +%F).sql

# Restore that file into the running database
docker compose exec -T db psql -q -U aicontrol -d aicontrol < aicontrol-2026-11-11.sql
```

Schedule the backup command daily (cron, Task Scheduler, or your NAS) and keep copies off the server.

### Stop, start and logs

```bash
docker compose stop          # stop, keep everything
docker compose start         # start again
docker compose logs -f app   # follow the app's logs
```

### Start over

> [!CAUTION]
> This **permanently deletes all data**: register, assessments, policies, users and audit log. Make a backup first.

```bash
docker compose down -v
docker compose up -d
```

---

## 🧯 Troubleshooting

<details>
<summary><strong>Port 3000 is already in use</strong></summary>

Change the left-hand port in `docker-compose.yml`, for example `'3001:3000'`, then run `docker compose up -d` and open <http://localhost:3001>.

</details>

<details>
<summary><strong>"Sign-in failed" even with the right password</strong></summary>

After 5 failed attempts an account is locked for 15 minutes. Wait and try again. A demo account that was signed into before no longer uses `demo1234`; it uses the password chosen at that first sign-in.

</details>

<details>
<summary><strong>The only admin forgot their password</strong></summary>

Another admin can use **Settings → Reset password**. If there is no other admin, set a temporary password from the server:

```bash
docker compose exec -T app node -e "const {PrismaClient}=require('@prisma/client');const b=require('bcryptjs');new PrismaClient().user.update({where:{email:'admin@example.com'},data:{passwordHash:b.hashSync('temporary-pass-123',12),mustChangePassword:true}}).then(()=>console.log('Password reset.')).catch((e)=>{console.error(e.code||e.message);process.exit(1)})"
```

Replace the email and the temporary password; the admin chooses a new one at the next sign-in. `P2025` means no user has that email address.

</details>

<details>
<summary><strong>I changed <code>SEED_DEMO</code> but nothing happened</strong></summary>

The demo is only loaded into an empty database, and the setup wizard only appears on an empty database. To switch, [start over](#start-over).

</details>

<details>
<summary><strong>I changed <code>POSTGRES_PASSWORD</code> and the app can't reach the database</strong></summary>

PostgreSQL sets its password only when the volume is created. Either put the old password back in `.env`, or change it inside the database:

```bash
docker compose exec db psql -U aicontrol -c "ALTER USER aicontrol PASSWORD 'the-new-password';"
```

</details>

<details>
<summary><strong>Something else</strong></summary>

Look at `docker compose logs app` first; errors say what happened. Still stuck? [Open an issue](../../issues/new/choose) with the log lines, and leave out any personal or company data.

</details>

---

## 🧑‍💻 For developers

Requires Node.js 22+ and PostgreSQL 16.

```bash
npm install
cp .env.example .env                      # point DATABASE_URL at your database
npm run db:migrate && npm run db:seed
npm run dev                               # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint and Prettier |
| `npm run typecheck` | TypeScript in strict mode |
| `npm test` | Unit tests; the domain logic stays at 100% coverage |
| `npm run build && npm run e2e` | Playwright flows against a freshly seeded database |

**Stack:** Next.js 15, TypeScript, Tailwind CSS with shadcn/ui, Prisma with PostgreSQL 16, Auth.js, next-intl and @react-pdf/renderer.

**API:** REST under `/api/v1`, documented at [`/api/v1/openapi.json`](http://localhost:3000/api/v1/openapi.json).

**Further reading:** [architecture](docs/architecture.md), [classification rules](docs/classification-rules.md), [design decisions](DECISIONS.md), [contributing](CONTRIBUTING.md), [security](SECURITY.md) and [changelog](CHANGELOG.md).

🎬 A 45-second demo film is in [`demo-video/aicontrol-demo.mp4`](demo-video/aicontrol-demo.mp4).

---

## 🇳🇱 Nederlands

**AIControl** geeft een organisatie van 10 tot 500 medewerkers in één middag grip op haar AI-gebruik: welke AI er is, hoe risicovol elk gebruik is, wie getraind is en welk beleid geldt. U host het zelf, uw gegevens verlaten uw eigen server niet, en de hele interface en alle documenten zijn er in het Nederlands en het Engels.

**Snel starten** (alleen Docker nodig):

```bash
git clone <repository-url> aicontrol && cd aicontrol
cp .env.example .env
docker compose up
```

Open <http://localhost:3000> en log in met `admin@demo.local` / `demo1234`.

**Voor echt gebruik** volgt u de stappen A tot en met I hierboven. De kern:
1. Zet in `.env` een nieuwe `AUTH_SECRET` (`openssl rand -base64 32`) en `POSTGRES_PASSWORD`.
2. Zet `SEED_DEMO=false` vóór de eerste start; u krijgt dan de installatiewizard.
3. Zet er HTTPS voor als de app buiten uw netwerk bereikbaar is.
4. Maak dagelijks een backup.

De taal kiest u rechtsboven in de app.

> AIControl ondersteunt governance en documentatie; het is geen juridisch advies. Classificaties zijn indicatief en moeten door een verantwoordelijke worden beoordeeld.

---

<p align="center">
  <a href="LICENSE">Apache-2.0</a> · Made for the companies that just want to get it right.
</p>
