import { expect, type Page } from '@playwright/test';

const DEMO_PASSWORD = 'demo1234';
const NEW_PASSWORD = 'demo1234-changed';

/**
 * Signs in as one of the four demo users, in English. Demo users must change their password
 * at the first login, so this handles both the first login and later ones.
 */
export async function login(page: Page, role: 'admin' | 'editor' | 'viewer' | 'employee') {
  await page.context().clearCookies();
  await page.goto('/login');
  await page.context().addCookies([{ name: 'locale', value: 'en', url: page.url() }]);

  const changePassword = page.getByRole('heading', { name: 'Choose a new password' });
  const signedIn = page.getByRole('button', { name: 'Sign out' });
  const failed = page.getByText('Sign-in failed');

  for (const password of [DEMO_PASSWORD, NEW_PASSWORD]) {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(`${role}@demo.local`);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(changePassword.or(signedIn).or(failed)).toBeVisible();
    if (await failed.isVisible()) continue;

    if (await changePassword.isVisible()) {
      await page.getByLabel('Current password').fill(DEMO_PASSWORD);
      await page.getByLabel(/^New password/).fill(NEW_PASSWORD);
      await page.getByLabel('Repeat new password').fill(NEW_PASSWORD);
      await page.getByRole('button', { name: 'Save password' }).click();
      await expect(signedIn).toBeVisible();
    }
    return;
  }
  throw new Error(`Could not sign in as ${role}`);
}

/** Answers every question on the current questionnaire step with the same answer. */
export async function answerAll(page: Page, answer: 'Yes' | 'No') {
  const questions = page.locator('fieldset');
  await expect(questions.first()).toBeVisible();
  for (const question of await questions.all()) await question.getByLabel(answer, { exact: true }).check();
}
