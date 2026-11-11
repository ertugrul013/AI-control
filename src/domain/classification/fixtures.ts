import { questions, type Answers, type OrgRole, type Tier } from './rules';

/** A fully answered questionnaire: every question "no", except the listed ids. */
export function answered(role: OrgRole, ...yesIds: string[]): Answers {
  return { role, answers: Object.fromEntries(questions.map((q) => [q.id, yesIds.includes(q.id)])) };
}

export interface SeedSystem {
  name: string;
  vendor: string;
  description: string;
  purpose: string;
  department: string;
  usageType: 'THIRD_PARTY_TOOL' | 'EMBEDDED_IN_SAAS' | 'IN_HOUSE';
  dataCategories: ('NONE' | 'BUSINESS' | 'PERSONAL' | 'SENSITIVE_PERSONAL')[];
  userGroup: 'INTERNAL' | 'CUSTOMERS' | 'PUBLIC';
  status: 'PROPOSED' | 'APPROVED' | 'IN_USE' | 'RETIRED';
  answers: Answers;
  expectedTier: Tier;
}

/** The eight demo systems: seed data and classification test fixtures in one. */
export const seedSystems: SeedSystem[] = [
  {
    name: 'ChatGPT',
    vendor: 'OpenAI',
    description: 'General-purpose AI assistant, used internally.',
    purpose: 'Drafting and summarising internal texts, brainstorming.',
    department: 'Marketing',
    usageType: 'THIRD_PARTY_TOOL',
    dataCategories: ['BUSINESS'],
    userGroup: 'INTERNAL',
    status: 'IN_USE',
    answers: answered('deployer'),
    expectedTier: 'MINIMAL',
  },
  {
    name: 'Microsoft 365 Copilot',
    vendor: 'Microsoft',
    description: 'AI assistant inside Word, Outlook, Teams and Excel.',
    purpose: 'Drafting emails and documents that are also sent to customers, meeting summaries.',
    department: 'IT',
    usageType: 'EMBEDDED_IN_SAAS',
    dataCategories: ['BUSINESS', 'PERSONAL'],
    userGroup: 'INTERNAL',
    status: 'IN_USE',
    answers: answered('deployer', 'generatesContent'),
    expectedTier: 'LIMITED',
  },
  {
    name: 'DeepL',
    vendor: 'DeepL SE',
    description: 'Machine translation.',
    purpose: 'Translating internal documents and correspondence.',
    department: 'Sales',
    usageType: 'THIRD_PARTY_TOOL',
    dataCategories: ['BUSINESS'],
    userGroup: 'INTERNAL',
    status: 'APPROVED',
    answers: answered('deployer'),
    expectedTier: 'MINIMAL',
  },
  {
    name: 'CV screening tool',
    vendor: 'TalentRank',
    description: 'Ranks incoming applications against the vacancy profile.',
    purpose: 'Pre-selecting candidates in recruitment.',
    department: 'HR',
    usageType: 'THIRD_PARTY_TOOL',
    dataCategories: ['PERSONAL'],
    userGroup: 'PUBLIC',
    status: 'IN_USE',
    answers: answered('deployer', 'employment', 'profiling'),
    expectedTier: 'HIGH',
  },
  {
    name: 'Customer chatbot',
    vendor: 'Helpdesk.ai',
    description: 'Chatbot on the website that answers customer questions.',
    purpose: 'First-line customer service outside office hours.',
    department: 'Customer service',
    usageType: 'THIRD_PARTY_TOOL',
    dataCategories: ['PERSONAL'],
    userGroup: 'CUSTOMERS',
    status: 'IN_USE',
    answers: answered('deployer', 'interactsWithPeople'),
    expectedTier: 'LIMITED',
  },
  {
    name: 'Grammarly',
    vendor: 'Grammarly Inc.',
    description: 'Writing assistant for spelling, grammar and tone.',
    purpose: 'Checking English texts before sending.',
    department: 'Marketing',
    usageType: 'THIRD_PARTY_TOOL',
    dataCategories: ['BUSINESS'],
    userGroup: 'INTERNAL',
    status: 'PROPOSED',
    answers: answered('deployer'),
    expectedTier: 'MINIMAL',
  },
  {
    name: 'GIS image recognition model',
    vendor: 'In-house',
    description: 'Model that flags possible defects in aerial images of the water network.',
    purpose: 'Preparing inspections: an inspector assesses every flagged location.',
    department: 'Operations',
    usageType: 'IN_HOUSE',
    dataCategories: ['BUSINESS'],
    userGroup: 'INTERNAL',
    status: 'IN_USE',
    answers: answered('provider', 'criticalInfrastructure', 'exceptionApplies'),
    expectedTier: 'MINIMAL',
  },
  {
    name: 'HR suite sentiment analysis',
    vendor: 'PeopleCloud',
    description: 'AI feature in the HR system that reads emotions from video calls and survey answers.',
    purpose: 'Measuring employee mood and engagement.',
    department: 'HR',
    usageType: 'EMBEDDED_IN_SAAS',
    dataCategories: ['SENSITIVE_PERSONAL'],
    userGroup: 'INTERNAL',
    status: 'PROPOSED',
    answers: answered('deployer', 'emotionWorkplace', 'employment', 'profiling'),
    expectedTier: 'PROHIBITED',
  },
];
