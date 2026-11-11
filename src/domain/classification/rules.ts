// Questions, rules and generated actions of the classification engine, as data.
// Every text is bilingual and carries the AI Act reference that is shown to the user.

export const TIERS = ['PROHIBITED', 'HIGH', 'LIMITED', 'MINIMAL'] as const;
export type Tier = (typeof TIERS)[number];
export type Lang = 'nl' | 'en';
export type L = Record<Lang, string>;
export type OrgRole = 'deployer' | 'provider';
export type Step = 'prohibited' | 'highRisk' | 'exception' | 'transparency';

export interface Question {
  id: string;
  step: Step;
  article: string;
  /** The question asked in the questionnaire. */
  text: L;
  /** The statement shown in the rationale when the answer is yes. */
  rule?: L;
  /** High-risk questions only: Annex III areas can use the Article 6(3) exception, Annex I products cannot. */
  annex?: 'III' | 'I';
}

export interface Answers {
  role: OrgRole;
  /** Question id → answer; a missing answer counts as no. */
  answers: Partial<Record<string, boolean>>;
}

/** AI Act dates after the Digital Omnibus, Regulation (EU) 2026/1744. */
export const APPLICABLE_FROM = { III: '2027-12-02', I: '2028-08-02' } as const;

export const roleQuestion = {
  article: 'Art. 3(3)-(4)',
  text: {
    en: 'Did your organization build this system, or do you use a system built by someone else?',
    nl: 'Heeft uw organisatie dit systeem zelf gebouwd, of gebruikt u een systeem van een ander?',
  },
  options: {
    deployer: {
      en: 'We use a system from a vendor (deployer)',
      nl: 'Wij gebruiken een systeem van een leverancier (gebruiksverantwoordelijke)',
    },
    provider: {
      en: 'We built it or had it built under our name (provider)',
      nl: 'Wij hebben het gebouwd of onder onze naam laten bouwen (aanbieder)',
    },
  },
} satisfies { article: string; text: L; options: Record<OrgRole, L> };

export const questions: Question[] = [
  {
    id: 'socialScoring',
    step: 'prohibited',
    article: 'Art. 5(1)(c)',
    text: {
      en: 'Does the system score or rank people on their social behaviour or personal traits, leading to unjustified or unfavourable treatment?',
      nl: 'Beoordeelt of rangschikt het systeem mensen op sociaal gedrag of persoonlijke kenmerken, met een ongerechtvaardigde of nadelige behandeling tot gevolg?',
    },
    rule: { en: 'Social scoring of people', nl: 'Social scoring van personen' },
  },
  {
    id: 'manipulation',
    step: 'prohibited',
    article: 'Art. 5(1)(a)-(b)',
    text: {
      en: 'Does the system use manipulative or deceptive techniques, or exploit vulnerabilities (age, disability, social or economic situation), in a way that causes significant harm?',
      nl: 'Gebruikt het systeem manipulatieve of misleidende technieken, of buit het kwetsbaarheden uit (leeftijd, handicap, sociale of economische situatie), op een manier die aanzienlijke schade veroorzaakt?',
    },
    rule: {
      en: 'Manipulation or exploitation of vulnerabilities',
      nl: 'Manipulatie of misbruik van kwetsbaarheden',
    },
  },
  {
    id: 'emotionWorkplace',
    step: 'prohibited',
    article: 'Art. 5(1)(f)',
    text: {
      en: 'Does the system recognise emotions of employees or students (other than for medical or safety reasons)?',
      nl: 'Herkent het systeem emoties van medewerkers of studenten (anders dan om medische of veiligheidsredenen)?',
    },
    rule: {
      en: 'Emotion recognition of employees or students',
      nl: 'Emotieherkenning bij medewerkers of studenten',
    },
  },
  {
    id: 'faceScraping',
    step: 'prohibited',
    article: 'Art. 5(1)(e)',
    text: {
      en: 'Does the system build or expand a facial recognition database by untargeted scraping of facial images from the internet or camera footage?',
      nl: 'Bouwt of vult het systeem een database voor gezichtsherkenning door ongericht gezichtsbeelden van internet of camerabeelden te verzamelen?',
    },
    rule: { en: 'Untargeted scraping of facial images', nl: 'Ongericht verzamelen van gezichtsbeelden' },
  },
  {
    id: 'biometricSensitive',
    step: 'prohibited',
    article: 'Art. 5(1)(g)',
    text: {
      en: 'Does the system categorise people by biometric data to infer sensitive traits such as ethnicity, political opinions or sexual orientation?',
      nl: 'Deelt het systeem mensen op basis van biometrische gegevens in om gevoelige kenmerken af te leiden, zoals etniciteit, politieke opvattingen of seksuele gerichtheid?',
    },
    rule: {
      en: 'Biometric categorisation inferring sensitive traits',
      nl: 'Biometrische categorisering die gevoelige kenmerken afleidt',
    },
  },
  {
    id: 'predictivePolicing',
    step: 'prohibited',
    article: 'Art. 5(1)(d)',
    text: {
      en: 'Does the system predict whether a person will commit a criminal offence based solely on profiling or personality traits?',
      nl: 'Voorspelt het systeem of iemand een strafbaar feit zal plegen, uitsluitend op basis van profilering of persoonlijkheidskenmerken?',
    },
    rule: {
      en: 'Predicting criminal offences solely by profiling',
      nl: 'Voorspellen van strafbare feiten uitsluitend op basis van profilering',
    },
  },
  {
    id: 'biometrics',
    step: 'highRisk',
    annex: 'III',
    article: 'Annex III(1)',
    text: {
      en: 'Is the system used for biometric identification or categorisation of people?',
      nl: 'Wordt het systeem gebruikt voor biometrische identificatie of categorisering van personen?',
    },
    rule: {
      en: 'Biometric identification or categorisation',
      nl: 'Biometrische identificatie of categorisering',
    },
  },
  {
    id: 'criticalInfrastructure',
    step: 'highRisk',
    annex: 'III',
    article: 'Annex III(2)',
    text: {
      en: 'Is the system a safety component of critical infrastructure (energy, water, traffic, digital infrastructure)?',
      nl: 'Is het systeem een veiligheidscomponent van kritieke infrastructuur (energie, water, verkeer, digitale infrastructuur)?',
    },
    rule: {
      en: 'Safety component of critical infrastructure',
      nl: 'Veiligheidscomponent van kritieke infrastructuur',
    },
  },
  {
    id: 'education',
    step: 'highRisk',
    annex: 'III',
    article: 'Annex III(3)',
    text: {
      en: 'Is the system used in education for admission, grading or monitoring of students?',
      nl: 'Wordt het systeem in het onderwijs gebruikt voor toelating, beoordeling of toezicht op studenten?',
    },
    rule: {
      en: 'Used in education for admission, grading or monitoring',
      nl: 'Gebruikt in het onderwijs voor toelating, beoordeling of toezicht',
    },
  },
  {
    id: 'employment',
    step: 'highRisk',
    annex: 'III',
    article: 'Annex III(4)',
    text: {
      en: 'Is the system used for recruitment or CV screening, decisions on promotion or termination, task allocation based on behaviour or traits, or monitoring and evaluating performance?',
      nl: 'Wordt het systeem gebruikt voor werving of cv-selectie, beslissingen over promotie of ontslag, taakverdeling op basis van gedrag of kenmerken, of het monitoren en beoordelen van prestaties?',
    },
    rule: {
      en: 'Used in recruitment or decisions about employees',
      nl: 'Gebruikt bij werving of beslissingen over medewerkers',
    },
  },
  {
    id: 'essentialServices',
    step: 'highRisk',
    annex: 'III',
    article: 'Annex III(5)',
    text: {
      en: 'Does the system decide on access to essential services: creditworthiness, life or health insurance pricing, public benefits or emergency call triage?',
      nl: 'Bepaalt het systeem de toegang tot essentiële diensten: kredietwaardigheid, premies voor levens- of zorgverzekering, uitkeringen of triage van noodoproepen?',
    },
    rule: { en: 'Decides on access to essential services', nl: 'Bepaalt toegang tot essentiële diensten' },
  },
  {
    id: 'lawAndJustice',
    step: 'highRisk',
    annex: 'III',
    article: 'Annex III(6)-(8)',
    text: {
      en: 'Is the system used for law enforcement, migration or border control, or the administration of justice or elections?',
      nl: 'Wordt het systeem gebruikt voor rechtshandhaving, migratie of grenscontrole, rechtspraak of verkiezingen?',
    },
    rule: {
      en: 'Used in law enforcement, migration, justice or elections',
      nl: 'Gebruikt bij rechtshandhaving, migratie, rechtspraak of verkiezingen',
    },
  },
  {
    id: 'productSafety',
    step: 'highRisk',
    annex: 'I',
    article: 'Art. 6(1), Annex I',
    text: {
      en: 'Is the system a safety component of a product covered by EU product legislation (for example machinery, vehicles, medical devices)?',
      nl: 'Is het systeem een veiligheidscomponent van een product dat onder EU-productwetgeving valt (bijvoorbeeld machines, voertuigen, medische hulpmiddelen)?',
    },
    rule: {
      en: 'Safety component of a regulated product',
      nl: 'Veiligheidscomponent van een gereguleerd product',
    },
  },
  {
    id: 'exceptionApplies',
    step: 'exception',
    article: 'Art. 6(3)',
    text: {
      en: 'Does the system only perform a narrow procedural task, improve the result of a completed human activity, detect patterns without replacing human assessment, or perform a preparatory task?',
      nl: 'Voert het systeem alleen een beperkte procedurele taak uit, verbetert het het resultaat van een afgeronde menselijke activiteit, herkent het patronen zonder de menselijke beoordeling te vervangen, of voert het een voorbereidende taak uit?',
    },
  },
  {
    id: 'profiling',
    step: 'exception',
    article: 'Art. 6(3)',
    text: {
      en: 'Does the system profile natural persons (automatically evaluate personal aspects such as work performance, behaviour, interests or reliability)?',
      nl: 'Profileert het systeem natuurlijke personen (automatisch beoordelen van persoonlijke aspecten zoals werkprestaties, gedrag, interesses of betrouwbaarheid)?',
    },
  },
  {
    id: 'interactsWithPeople',
    step: 'transparency',
    article: 'Art. 50(1)',
    text: {
      en: 'Does the system interact directly with people, such as a chatbot or voice assistant?',
      nl: 'Communiceert het systeem rechtstreeks met mensen, zoals een chatbot of spraakassistent?',
    },
    rule: { en: 'Interacts directly with people', nl: 'Communiceert rechtstreeks met mensen' },
  },
  {
    id: 'generatesContent',
    step: 'transparency',
    article: 'Art. 50(2), 50(4)',
    text: {
      en: 'Does the system generate or manipulate text, images, audio or video that is shown to others (including deepfakes)?',
      nl: 'Genereert of bewerkt het systeem tekst, beeld, audio of video die aan anderen wordt getoond (inclusief deepfakes)?',
    },
    rule: {
      en: 'Generates content that is shown to others',
      nl: 'Genereert content die aan anderen wordt getoond',
    },
  },
  {
    id: 'emotionOrBiometric',
    step: 'transparency',
    article: 'Art. 50(3)',
    text: {
      en: 'Does the system recognise emotions or categorise people by biometric data in a way that is not covered by the prohibited practices?',
      nl: 'Herkent het systeem emoties of categoriseert het mensen op basis van biometrische gegevens op een manier die niet onder de verboden praktijken valt?',
    },
    rule: {
      en: 'Emotion recognition or biometric categorisation',
      nl: 'Emotieherkenning of biometrische categorisering',
    },
  },
];

/** Rules that do not belong to a single question. */
export const specialRules: Record<string, { article: string; text: L }> = {
  exceptionApplied: {
    article: 'Art. 6(3)',
    text: {
      en: 'Exception applies: a narrow, supporting or preparatory task without profiling',
      nl: 'Uitzondering van toepassing: een beperkte, ondersteunende of voorbereidende taak zonder profilering',
    },
  },
  profilingNoException: {
    article: 'Art. 6(3)',
    text: {
      en: 'Profiles natural persons: no exception possible',
      nl: 'Profileert natuurlijke personen: geen uitzondering mogelijk',
    },
  },
  minimalDefault: {
    article: '',
    text: {
      en: 'No prohibited, high-risk or transparency criteria apply',
      nl: 'Geen verboden, hoog-risico- of transparantiecriteria van toepassing',
    },
  },
};

export const actionTexts = {
  stopUse: {
    en: 'Stop use immediately',
    nl: 'Stop het gebruik onmiddellijk',
  },
  consultLegal: { en: 'Consult legal counsel', nl: 'Raadpleeg een jurist' },
  documentDecision: { en: 'Document the decision', nl: 'Leg het besluit vast' },
  oversightOwner: {
    en: 'Assign a human oversight owner',
    nl: 'Wijs een verantwoordelijke voor menselijk toezicht aan',
  },
  followInstructions: {
    en: "Follow the provider's instructions for use",
    nl: 'Volg de gebruiksinstructies van de aanbieder',
  },
  keepLogs: { en: 'Keep the logs the system generates', nl: 'Bewaar de logs die het systeem aanmaakt' },
  informEmployees: {
    en: 'Inform the employees who are affected',
    nl: 'Informeer de betrokken medewerkers',
  },
  checkConformity: {
    en: "Check the provider's conformity documentation",
    nl: 'Controleer de conformiteitsdocumentatie van de aanbieder',
  },
  checkFria: {
    en: 'Check whether a fundamental rights impact assessment applies',
    nl: 'Ga na of een effectbeoordeling op grondrechten nodig is',
  },
  providerObligations: {
    en: 'Arrange the provider obligations: conformity assessment, technical documentation and registration',
    nl: 'Regel de aanbiedersverplichtingen: conformiteitsbeoordeling, technische documentatie en registratie',
  },
  review6: { en: 'Review this system every 6 months', nl: 'Beoordeel dit systeem elke 6 maanden opnieuw' },
  informUsers: {
    en: 'Tell users that they interact with AI',
    nl: 'Vertel gebruikers dat zij met AI communiceren',
  },
  labelContent: { en: 'Label AI-generated content', nl: 'Label door AI gegenereerde content' },
  review12: { en: 'Review this system every 12 months', nl: 'Beoordeel dit systeem elke 12 maanden opnieuw' },
  recordRegister: {
    en: 'Keep the register entry up to date',
    nl: 'Houd de registratie in het register actueel',
  },
  followPolicy: { en: 'Follow the company AI policy', nl: 'Volg het AI-beleid van de organisatie' },
  documentNotHighRisk: {
    en: 'Document why this system is not high-risk and register it in the EU database',
    nl: 'Leg vast waarom dit systeem geen hoog risico is en registreer het in de EU-databank',
  },
  checkGdpr: {
    en: 'Check whether GDPR applies (DPIA)',
    nl: 'Ga na of de AVG van toepassing is (DPIA)',
  },
} satisfies Record<string, L>;

export type ActionKey = keyof typeof actionTexts;

export const tierActions: Record<Tier, ActionKey[]> = {
  PROHIBITED: ['stopUse', 'consultLegal', 'documentDecision'],
  HIGH: [
    'oversightOwner',
    'followInstructions',
    'keepLogs',
    'informEmployees',
    'checkConformity',
    'checkFria',
    'review6',
  ],
  LIMITED: ['informUsers', 'labelContent', 'review12'],
  MINIMAL: ['recordRegister', 'followPolicy', 'review12'],
};

/** Text and article reference of a triggered rule; unknown ids (from older data) are shown as-is. */
export function ruleInfo(id: string): { article: string; text: L } {
  const question = questions.find((q) => q.id === id);
  if (question?.rule) return { article: question.article, text: question.rule };
  return specialRules[id] ?? { article: '', text: { en: id, nl: id } };
}

/** Title of an action: generated actions follow the UI language, manual ones keep their own title. */
export function actionTitle(action: { actionKey: string | null; title: string }, lang: Lang): string {
  const key = action.actionKey;
  return key && key in actionTexts ? actionTexts[key as ActionKey][lang] : action.title;
}
