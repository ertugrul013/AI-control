import { en } from './templates/en';
import { nl } from './templates/nl';

export const PUBLIC_TOOLS = ['no', 'withoutCompanyData', 'yes'] as const;
export const FORBIDDEN_DATA = ['personal', 'customer', 'financial', 'sourceCode', 'tradeSecrets'] as const;
export const HUMAN_REVIEW = ['always', 'customerFacing'] as const;

/** The answers to the eight wizard questions. */
export interface PolicyAnswers {
  approvedTools: string[];
  publicTools: (typeof PUBLIC_TOOLS)[number];
  forbiddenData: (typeof FORBIDDEN_DATA)[number][];
  humanReview: (typeof HUMAN_REVIEW)[number];
  approver: string;
  labelling: string;
  incidentContact: string;
  reviewMonths: 6 | 12;
}

export interface PolicyTemplate {
  title: string;
  /** Nine sections; bodies are Markdown with {{placeholders}}. */
  sections: { heading: string; body: string }[];
  phrases: {
    noTools: string;
    publicTools: Record<PolicyAnswers['publicTools'], string>;
    forbiddenData: Record<PolicyAnswers['forbiddenData'][number], string>;
    noForbiddenData: string;
    humanReview: Record<PolicyAnswers['humanReview'], string>;
  };
}

const templates = { nl, en };

const bullets = (items: string[], empty: string) =>
  items.length > 0 ? items.map((item) => `- ${item}`).join('\n') : empty;

/** Combines the wizard answers with the section templates into one Markdown policy. */
export function buildPolicy(
  answers: PolicyAnswers,
  context: { locale: 'nl' | 'en'; organization: string; date: Date },
): { title: string; markdown: string } {
  const template = templates[context.locale];
  const { phrases } = template;
  const values: Record<string, string> = {
    org: context.organization,
    date: new Intl.DateTimeFormat(context.locale === 'nl' ? 'nl-NL' : 'en-GB', {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(context.date),
    tools: bullets(answers.approvedTools, phrases.noTools),
    publicTools: phrases.publicTools[answers.publicTools],
    forbiddenData: bullets(
      answers.forbiddenData.map((key) => phrases.forbiddenData[key]),
      phrases.noForbiddenData,
    ),
    humanReview: phrases.humanReview[answers.humanReview],
    approver: answers.approver,
    labelling: answers.labelling,
    incidentContact: answers.incidentContact,
    reviewMonths: String(answers.reviewMonths),
  };
  const fill = (text: string) => text.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => values[key]);

  const title = fill(template.title);
  const sections = template.sections.map((s, i) => `## ${i + 1}. ${s.heading}\n\n${fill(s.body)}`);
  return { title, markdown: [`# ${title}`, ...sections].join('\n\n') + '\n' };
}
