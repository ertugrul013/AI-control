import { describe, expect, it } from 'vitest';
import { classify, diffAnswers, needsExceptionCheck } from './engine';
import { answered, seedSystems } from './fixtures';
import { actionTexts, actionTitle, questions, ruleInfo, tierActions, TIERS } from './rules';

const byStep = (step: string) => questions.filter((q) => q.step === step);

describe('rules data', () => {
  it('has unique question ids and bilingual texts', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const q of questions) {
      expect(q.text.en && q.text.nl && q.article).toBeTruthy();
      if (q.step !== 'exception') expect(q.rule?.en && q.rule?.nl).toBeTruthy();
    }
  });

  it('only generates actions that have a text', () => {
    for (const tier of TIERS) for (const key of tierActions[tier]) expect(actionTexts[key]).toBeDefined();
  });
});

describe('classify: one test per rule', () => {
  it.each(byStep('prohibited').map((q) => q.id))('%s → PROHIBITED', (id) => {
    const result = classify(answered('deployer', id));
    expect(result.tier).toBe('PROHIBITED');
    expect(result.rationale).toEqual([id]);
    expect(result.actions).toEqual(['stopUse', 'consultLegal', 'documentDecision']);
    expect(result.reviewMonths).toBeNull();
    expect(result.applicableFrom).toBeNull();
  });

  it.each(
    byStep('highRisk')
      .filter((q) => q.annex === 'III')
      .map((q) => q.id),
  )('%s → HIGH, applies from 2 December 2027', (id) => {
    const result = classify(answered('deployer', id));
    expect(result.tier).toBe('HIGH');
    expect(result.rationale).toEqual([id]);
    expect(result.actions).toEqual(tierActions.HIGH);
    expect(result.reviewMonths).toBe(6);
    expect(result.applicableFrom).toBe('2027-12-02');
  });

  it('productSafety → HIGH under Annex I, applies from 2 August 2028', () => {
    const result = classify(answered('deployer', 'productSafety'));
    expect(result.tier).toBe('HIGH');
    expect(result.applicableFrom).toBe('2028-08-02');
  });

  it.each(byStep('transparency').map((q) => q.id))('%s → LIMITED', (id) => {
    const result = classify(answered('deployer', id));
    expect(result.tier).toBe('LIMITED');
    expect(result.rationale).toEqual([id]);
    expect(result.actions).toEqual(['informUsers', 'labelContent', 'review12']);
    expect(result.reviewMonths).toBe(12);
  });

  it('nothing triggered → MINIMAL with the default rule', () => {
    const result = classify(answered('deployer'));
    expect(result.tier).toBe('MINIMAL');
    expect(result.rationale).toEqual(['minimalDefault']);
    expect(result.actions).toEqual(['recordRegister', 'followPolicy', 'review12']);
  });
});

describe('classify: Article 6(3) exception', () => {
  it('downgrades an Annex III candidate to MINIMAL and asks to document it', () => {
    const result = classify(answered('deployer', 'education', 'exceptionApplies'));
    expect(result.tier).toBe('MINIMAL');
    expect(result.rationale).toEqual(['education', 'exceptionApplied']);
    expect(result.actions).toContain('documentNotHighRisk');
    expect(result.applicableFrom).toBeNull();
  });

  it('downgrades to LIMITED when a transparency rule also applies', () => {
    const result = classify(answered('deployer', 'education', 'exceptionApplies', 'interactsWithPeople'));
    expect(result.tier).toBe('LIMITED');
    expect(result.rationale).toEqual(['education', 'exceptionApplied', 'interactsWithPeople']);
  });

  it('profiling always keeps the system HIGH', () => {
    const result = classify(answered('deployer', 'employment', 'exceptionApplies', 'profiling'));
    expect(result.tier).toBe('HIGH');
    expect(result.rationale).toEqual(['employment', 'profilingNoException']);
    expect(result.actions).not.toContain('documentNotHighRisk');
  });

  it('does not apply to Annex I products', () => {
    const result = classify(answered('deployer', 'productSafety', 'exceptionApplies'));
    expect(result.tier).toBe('HIGH');
    expect(result.rationale).toEqual(['productSafety']);
  });

  it('keeps HIGH for the Annex I part when an Annex III part is exempt', () => {
    const result = classify(answered('deployer', 'productSafety', 'education', 'exceptionApplies'));
    expect(result.tier).toBe('HIGH');
    expect(result.applicableFrom).toBe('2028-08-02');
  });

  it('is only asked for Annex III candidates', () => {
    expect(needsExceptionCheck(answered('deployer', 'education'))).toBe(true);
    expect(needsExceptionCheck(answered('deployer', 'productSafety'))).toBe(false);
    expect(needsExceptionCheck(answered('deployer'))).toBe(false);
  });
});

describe('classify: precedence and extra actions', () => {
  it('PROHIBITED wins but every triggered rule is recorded', () => {
    const result = classify(answered('deployer', 'socialScoring', 'employment', 'generatesContent'));
    expect(result.tier).toBe('PROHIBITED');
    expect(result.rationale).toEqual(['socialScoring', 'employment', 'generatesContent']);
  });

  it('HIGH wins over LIMITED', () => {
    expect(classify(answered('deployer', 'employment', 'interactsWithPeople')).tier).toBe('HIGH');
  });

  it('a provider of a high-risk system gets provider obligations', () => {
    const { actions } = classify(answered('provider', 'employment'));
    expect(actions).toContain('providerObligations');
    expect(actions).not.toContain('followInstructions');
    expect(actions).not.toContain('checkConformity');
  });

  it('a provider of a lower-tier system gets the normal actions', () => {
    expect(classify(answered('provider')).actions).toEqual(tierActions.MINIMAL);
  });

  it.each(['PERSONAL', 'SENSITIVE_PERSONAL'])('adds the GDPR check for %s data', (category) => {
    expect(classify(answered('deployer'), [category]).actions).toContain('checkGdpr');
  });

  it('adds no GDPR check for business data', () => {
    expect(classify(answered('deployer'), ['BUSINESS', 'NONE']).actions).not.toContain('checkGdpr');
  });

  it('treats unanswered questions as no', () => {
    expect(classify({ role: 'deployer', answers: {} }).tier).toBe('MINIMAL');
  });
});

describe('the eight seed systems', () => {
  it('cover all four tiers', () => {
    expect(seedSystems).toHaveLength(8);
    expect(new Set(seedSystems.map((s) => s.expectedTier))).toEqual(new Set(TIERS));
  });

  it.each(seedSystems.map((s) => [s.name, s.expectedTier, s] as const))('%s → %s', (_name, tier, system) => {
    expect(classify(system.answers, system.dataCategories).tier).toBe(tier);
  });
});

describe('diffAnswers', () => {
  it('lists changed answers and a changed role', () => {
    expect(diffAnswers(answered('deployer', 'education'), answered('provider', 'employment'))).toEqual([
      'role',
      'education',
      'employment',
    ]);
  });

  it('is empty for identical answers, treating missing as no', () => {
    expect(diffAnswers(answered('deployer'), { role: 'deployer', answers: {} })).toEqual([]);
  });
});

describe('texts', () => {
  it('ruleInfo returns question rules, special rules and a fallback', () => {
    expect(ruleInfo('employment')).toMatchObject({ article: 'Annex III(4)' });
    expect(ruleInfo('exceptionApplied').article).toBe('Art. 6(3)');
    expect(ruleInfo('removedRule')).toEqual({ article: '', text: { en: 'removedRule', nl: 'removedRule' } });
  });

  it('actionTitle translates generated actions and keeps manual titles', () => {
    expect(actionTitle({ actionKey: 'stopUse', title: 'x' }, 'nl')).toBe('Stop het gebruik onmiddellijk');
    expect(actionTitle({ actionKey: null, title: 'Call vendor' }, 'nl')).toBe('Call vendor');
    expect(actionTitle({ actionKey: 'gone', title: 'Old action' }, 'en')).toBe('Old action');
  });
});
