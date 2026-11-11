import { describe, expect, it } from 'vitest';
import { buildPolicy, type PolicyAnswers } from './buildPolicy';

const answers: PolicyAnswers = {
  approvedTools: ['ChatGPT', 'DeepL'],
  publicTools: 'withoutCompanyData',
  forbiddenData: ['personal', 'sourceCode'],
  humanReview: 'always',
  approver: 'the IT manager',
  labelling: 'Mark AI-generated content with "Made with AI".',
  incidentContact: 'privacy@example.com',
  reviewMonths: 12,
};
const context = { organization: 'Demo BV', date: new Date('2026-11-10T00:00:00Z') };

describe('buildPolicy', () => {
  it.each(['nl', 'en'] as const)('builds nine filled sections in %s', (locale) => {
    const { title, markdown } = buildPolicy(answers, { ...context, locale });
    expect(title).toContain('Demo BV');
    expect(markdown.match(/^## \d\. /gm)).toHaveLength(9);
    expect(markdown).not.toContain('{{');
    expect(markdown).toContain('- ChatGPT\n- DeepL');
    expect(markdown).toContain('privacy@example.com');
    expect(markdown).toContain('the IT manager');
  });

  it('uses the language of the locale', () => {
    expect(buildPolicy(answers, { ...context, locale: 'nl' }).markdown).toContain('10 november 2026');
    expect(buildPolicy(answers, { ...context, locale: 'en' }).markdown).toContain('10 November 2026');
    expect(buildPolicy(answers, { ...context, locale: 'nl' }).markdown).toContain('- Broncode');
  });

  it('states it when no tools or data categories were chosen', () => {
    const { markdown } = buildPolicy(
      { ...answers, approvedTools: [], forbiddenData: [] },
      { ...context, locale: 'en' },
    );
    expect(markdown).toContain('No AI tools have been approved yet.');
    expect(markdown).toContain('No categories have been excluded');
  });
});
