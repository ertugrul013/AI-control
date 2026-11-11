import {
  APPLICABLE_FROM,
  questions,
  tierActions,
  type ActionKey,
  type Answers,
  type Step,
  type Tier,
} from './rules';

export interface Classification {
  tier: Tier;
  /** Ids of every triggered rule, in order of evaluation. */
  rationale: string[];
  actions: ActionKey[];
  /** Months until the next review; null when use has to stop. */
  reviewMonths: 6 | 12 | null;
  /** Date from which high-risk obligations apply (ISO), for HIGH only. */
  applicableFrom: string | null;
}

const yes = (answers: Answers, step: Step) =>
  questions.filter((q) => q.step === step && answers.answers[q.id]);

/** The Article 6(3) exception questions are only relevant for an Annex III candidate. */
export function needsExceptionCheck(answers: Answers): boolean {
  return yes(answers, 'highRisk').some((q) => q.annex === 'III');
}

/**
 * Evaluates PROHIBITED → HIGH → LIMITED → MINIMAL. The highest triggered tier wins,
 * but every triggered rule is recorded so the user can see why.
 */
export function classify(answers: Answers, dataCategories: readonly string[] = []): Classification {
  const prohibited = yes(answers, 'prohibited');
  const high = yes(answers, 'highRisk');
  const transparency = yes(answers, 'transparency');

  const annexIII = needsExceptionCheck(answers);
  const annexI = high.some((q) => q.annex === 'I');
  const exceptionClaimed = annexIII && answers.answers.exceptionApplies === true;
  // Profiling of natural persons always keeps an Annex III system high-risk.
  const exempt = exceptionClaimed && !answers.answers.profiling;
  const highRisk = annexI || (annexIII && !exempt);

  const rationale = [...prohibited, ...high].map((q) => q.id);
  if (exceptionClaimed) rationale.push(exempt ? 'exceptionApplied' : 'profilingNoException');
  rationale.push(...transparency.map((q) => q.id));
  if (rationale.length === 0) rationale.push('minimalDefault');

  const tier: Tier =
    prohibited.length > 0
      ? 'PROHIBITED'
      : highRisk
        ? 'HIGH'
        : transparency.length > 0
          ? 'LIMITED'
          : 'MINIMAL';

  let actions = [...tierActions[tier]];
  if (tier === 'HIGH' && answers.role === 'provider') {
    // A provider cannot rely on someone else's instructions and conformity documentation.
    actions = actions.filter((a) => a !== 'followInstructions' && a !== 'checkConformity');
    actions.push('providerObligations');
  }
  if (exempt) actions.push('documentNotHighRisk');
  if (dataCategories.some((c) => c === 'PERSONAL' || c === 'SENSITIVE_PERSONAL')) actions.push('checkGdpr');

  return {
    tier,
    rationale,
    actions,
    reviewMonths: tier === 'PROHIBITED' ? null : tier === 'HIGH' ? 6 : 12,
    applicableFrom: tier !== 'HIGH' ? null : annexIII && !exempt ? APPLICABLE_FROM.III : APPLICABLE_FROM.I,
  };
}

/** Ids of the questions (and 'role') that were answered differently in two assessments. */
export function diffAnswers(before: Answers, after: Answers): string[] {
  const changed = questions
    .filter((q) => Boolean(before.answers[q.id]) !== Boolean(after.answers[q.id]))
    .map((q) => q.id);
  return before.role === after.role ? changed : ['role', ...changed];
}
