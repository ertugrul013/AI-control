import { expect, test } from '@playwright/test';
import { trainingModules } from '../prisma/seed-content';
import { answerAll, login } from './helpers';

// These flows expect a freshly seeded demo database (npm run db:seed on an empty database).

test('1. register and classify: editor adds a CV screening tool, result is high, admin approves', async ({
  page,
}) => {
  const name = `CV screening tool ${Date.now()}`;
  await login(page, 'editor');
  await page.goto('/systems');

  await page.getByRole('button', { name: 'Add system' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name').fill(name);
  await dialog.getByLabel('Vendor').fill('TalentRank');
  await dialog.getByLabel('Department').fill('HR');
  await dialog.getByLabel('Personal data', { exact: true }).check();
  await dialog.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('link', { name }).click();

  await expect(page.getByText('This system has not been assessed yet')).toBeVisible();
  await page.getByRole('link', { name: 'Classify' }).click();

  await page.getByLabel(/We use a system from a vendor/).check();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Prohibited practices' })).toBeVisible();
  await answerAll(page, 'No');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'High-risk areas' })).toBeVisible();
  await answerAll(page, 'No');
  await page.locator('fieldset', { hasText: 'recruitment or CV screening' }).getByLabel('Yes').check();
  // The live preview follows the answers.
  await expect(page.getByRole('complementary').getByText('High', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Exception check' })).toBeVisible();
  await page.locator('fieldset', { hasText: 'narrow procedural task' }).getByLabel('No').check();
  await page.locator('fieldset', { hasText: 'profile natural persons' }).getByLabel('Yes').check();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Transparency' })).toBeVisible();
  await answerAll(page, 'No');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Check your answers' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Change/ })).toHaveCount(5);
  await page.getByRole('button', { name: 'Save assessment' }).click();

  await page.waitForURL(/\/systems\/[^/]+$/);
  await expect(page.getByRole('heading', { name: 'Why high' })).toBeVisible();
  await expect(page.getByText('Used in recruitment or decisions about employees')).toBeVisible();
  // Actions are created automatically, including the GDPR check for personal data.
  await expect(page.getByText('Assign a human oversight owner')).toBeVisible();
  await expect(page.getByText('Check whether GDPR applies (DPIA)')).toBeVisible();
  await expect(page.getByText('is waiting for approval')).toBeVisible();
  const systemUrl = page.url();

  await login(page, 'admin');
  await page.goto(systemUrl);
  await page.getByRole('button', { name: 'Approve assessment' }).click();
  await expect(page.getByText('Assessment approved', { exact: true })).toBeVisible();
  await expect(page.getByText(/was approved on/)).toBeVisible();

  await page.goto('/settings');
  const latest = page.locator('#audit tbody tr').first();
  await expect(latest).toContainText('Assessment');
  await expect(latest).toContainText('Approved');
});

test('2. publish policy: admin runs the wizard, edits and publishes; employees get a task', async ({
  page,
}) => {
  const title = `AI policy e2e ${Date.now()}`;
  await login(page, 'admin');
  await page.goto('/policy');
  await page.getByRole('link', { name: 'Create a new version' }).click();

  await page.getByLabel('Language of the policy').selectOption('en');
  await page.getByLabel(/Who approves new AI tools/).fill('the IT manager');
  await page.getByLabel(/Where do employees report/).fill('ai@demo.local');
  await page.getByRole('button', { name: 'Generate draft' }).click();

  const editor = page.getByLabel('Policy text');
  await expect(editor).toHaveValue(/## 9\. Incidents and review/);
  await page.getByLabel('Title').fill(title);
  await editor.fill(`${await editor.inputValue()}\nAdded in the editor.\n`);
  await expect(page.getByLabel('Preview').getByText('Added in the editor.')).toBeVisible();
  await page.getByRole('button', { name: 'Publish policy' }).click();

  await page.waitForURL(/\/policy$/);
  await expect(page.getByRole('row', { name: new RegExp(title) })).toContainText('Published');

  await page.goto('/settings');
  const latest = page.locator('#audit tbody tr').first();
  await expect(latest).toContainText('Policy');
  await expect(latest).toContainText('Published');

  await login(page, 'employee');
  await expect(page).toHaveURL(/\/training$/);
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Read and acknowledge the AI policy' }),
  ).toContainText('Not started');
});

test('3. employee onboarding: training, quiz and policy acknowledgement raise the completion rate', async ({
  page,
}) => {
  const completion = async () => {
    await page.goto('/');
    const row = await page.getByRole('row', { name: /Training completed/ }).textContent();
    return Number(/(\d+)%/.exec(row ?? '')?.[1]);
  };
  await login(page, 'admin');
  const before = await completion();

  await login(page, 'employee');
  await expect(page.getByRole('heading', { name: 'My AI to-dos' })).toBeVisible();
  const [trainingModule] = trainingModules;
  await page.getByRole('link', { name: trainingModule.titleEn }).click();

  for (const question of trainingModule.quiz) {
    await page
      .locator('fieldset', { hasText: question.en.question })
      .getByLabel(question.en.options[question.correct], { exact: true })
      .check();
  }
  await page.getByRole('button', { name: 'Check answers' }).click();
  await expect(page.getByText('Passed with 100%')).toBeVisible();

  await page.goto('/training');
  await expect(page.getByRole('listitem').filter({ hasText: trainingModule.titleEn })).toContainText('Done');

  await page.getByRole('link', { name: 'Read and acknowledge the AI policy' }).click();
  await page.getByRole('button', { name: 'I have read this policy' }).click();
  await expect(page.getByText('Policy acknowledged', { exact: true })).toBeVisible();
  await page.goto('/training');
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Read and acknowledge the AI policy' }),
  ).toContainText('Done');

  await login(page, 'admin');
  expect(await completion()).toBeGreaterThan(before);
});

test('employee role gets a server-side 403 on register, policy editing, reports and settings', async ({
  page,
}) => {
  await login(page, 'employee');
  for (const path of ['/systems', '/policy/wizard', '/reports', '/settings']) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(403);
  }
  for (const path of ['/api/v1/systems', '/api/v1/users', '/api/v1/export']) {
    expect((await page.request.get(path)).status(), path).toBe(403);
  }
  expect((await page.request.post('/api/v1/policies', { data: {} })).status()).toBe(403);
});

test('downloads: policy and management report are PDFs in both languages, export matches the register', async ({
  page,
}) => {
  await login(page, 'admin');
  for (const locale of ['nl', 'en']) {
    const report = await page.request.get(`/api/v1/reports/management?locale=${locale}`);
    expect(report.headers()['content-type']).toBe('application/pdf');
    expect((await report.body()).subarray(0, 5).toString()).toBe('%PDF-');
  }
  const policies = (await (await page.request.get('/api/v1/policies')).json()) as {
    id: string;
    locale: string;
  }[];
  expect(new Set(policies.map((p) => p.locale))).toEqual(new Set(['nl', 'en']));
  for (const policy of policies.slice(0, 2)) {
    const pdf = await page.request.get(`/api/v1/policies/${policy.id}/export?format=pdf`);
    expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  }

  const systems = (await (await page.request.get('/api/v1/systems')).json()) as unknown[];
  const full = (await (await page.request.get('/api/v1/export?format=json')).json()) as {
    aiSystems: unknown[];
  };
  expect(full.aiSystems).toHaveLength(systems.length);
  const csv = await (await page.request.get('/api/v1/export?format=csv&table=aiSystems')).text();
  expect(csv.trim().split('\r\n')).toHaveLength(systems.length + 1);

  const openapi = (await (await page.request.get('/api/v1/openapi.json')).json()) as { openapi: string };
  expect(openapi.openapi).toBe('3.1.0');
});
