import type { L } from '@/domain/classification/rules';

/** One-click presets for an empty register. */
export const catalogue: { name: string; vendor: string; purpose: L }[] = [
  {
    name: 'ChatGPT',
    vendor: 'OpenAI',
    purpose: {
      en: 'Drafting and summarising texts, brainstorming.',
      nl: 'Teksten opstellen en samenvatten, brainstormen.',
    },
  },
  {
    name: 'Microsoft 365 Copilot',
    vendor: 'Microsoft',
    purpose: {
      en: 'Assistant in Word, Outlook, Teams and Excel.',
      nl: 'Assistent in Word, Outlook, Teams en Excel.',
    },
  },
  {
    name: 'DeepL',
    vendor: 'DeepL SE',
    purpose: {
      en: 'Translating documents and correspondence.',
      nl: 'Documenten en correspondentie vertalen.',
    },
  },
  {
    name: 'Grammarly',
    vendor: 'Grammarly Inc.',
    purpose: { en: 'Checking spelling, grammar and tone.', nl: 'Spelling, grammatica en toon controleren.' },
  },
  {
    name: 'Gemini',
    vendor: 'Google',
    purpose: { en: 'General-purpose AI assistant.', nl: 'Algemene AI-assistent.' },
  },
  {
    name: 'Notion AI',
    vendor: 'Notion Labs',
    purpose: {
      en: 'Writing and summarising notes and documents.',
      nl: 'Notities en documenten schrijven en samenvatten.',
    },
  },
];
