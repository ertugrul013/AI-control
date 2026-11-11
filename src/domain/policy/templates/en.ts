import type { PolicyTemplate } from '../buildPolicy';

export const en: PolicyTemplate = {
  title: 'AI policy {{org}}',
  sections: [
    {
      heading: 'Purpose and scope',
      body: `This policy describes how {{org}} uses artificial intelligence (AI) responsibly. It applies to all employees, contractors and temporary staff who use AI tools for work, on company devices and on private devices.

Version date: {{date}}.`,
    },
    {
      heading: 'Definitions',
      body: `- **AI system**: software that produces output such as predictions, recommendations, text or images based on the input it receives.
- **AI tool**: an AI system that employees use directly, such as a chatbot, a translation service or an assistant inside office software.
- **Generative AI**: AI that creates new text, images, audio or video.
- **AI register**: the list in AIControl of all AI systems that {{org}} uses, with their owner and risk tier.
- **Personal data**: any information about an identified or identifiable person.`,
    },
    {
      heading: 'Approved tools',
      body: `Only AI tools that are listed in the AI register with the status approved or in use may be used for work. On the date of this policy these are:

{{tools}}

{{publicTools}}`,
    },
    {
      heading: 'Prohibited use',
      body: `AI is never used for:

- practices that the EU AI Act prohibits, such as social scoring, manipulating people or recognising emotions of employees;
- decisions about people (hiring, appraisal, dismissal, credit) without a human who reviews and takes the decision;
- work with a tool that has not been approved;
- bypassing security measures or the rules of this policy.`,
    },
    {
      heading: 'Data rules',
      body: `The following data may never be entered into an AI tool, unless the AI register states that the tool is approved for it:

{{forbiddenData}}

When in doubt, do not enter the data and ask {{approver}}.`,
    },
    {
      heading: 'Human oversight',
      body: `{{humanReview}}

The employee who uses AI output stays responsible for its accuracy, tone and consequences. Check facts, figures, names and sources before use.`,
    },
    {
      heading: 'Transparency and labelling',
      body: `{{labelling}}

People who interact with an AI system of {{org}}, such as a chatbot, are told that they are dealing with AI.`,
    },
    {
      heading: 'Roles and approval process',
      body: `New AI tools are approved by {{approver}} before first use. Every request is added to the AI register and classified by risk. Each AI system has an owner who keeps the register entry up to date and carries out the actions that follow from the classification.

All employees complete the AI literacy training that is assigned to them and acknowledge this policy.`,
    },
    {
      heading: 'Incidents and review',
      body: `Report incidents, mistakes and doubts about the use of AI as soon as possible to {{incidentContact}}. Reporting in good faith never has negative consequences.

This policy is reviewed every {{reviewMonths}} months, and sooner when the law or the use of AI changes.`,
    },
  ],
  phrases: {
    noTools: 'No AI tools have been approved yet.',
    publicTools: {
      no: 'Free public AI tools that are not in the register may not be used for work.',
      withoutCompanyData:
        'Free public AI tools may only be used for work without any company data: no names, no customer information and no internal documents.',
      yes: 'Free public AI tools may be used for work, within the data rules of this policy.',
    },
    forbiddenData: {
      personal: 'Personal data',
      customer: 'Customer data',
      financial: 'Financial data',
      sourceCode: 'Source code',
      tradeSecrets: 'Trade secrets',
    },
    noForbiddenData: 'No categories have been excluded; follow the data classification of the organization.',
    humanReview: {
      always: 'A human reviews all AI output before it is sent outside the organization.',
      customerFacing: 'A human reviews AI output before it is sent to customers or published.',
    },
  },
};
