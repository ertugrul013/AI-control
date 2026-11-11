// The three AI literacy modules: text and quiz in Dutch and English.

// A type alias (not an interface) so it is accepted as a Prisma JSON value.
type QuizQuestion = {
  nl: { question: string; options: string[] };
  en: { question: string; options: string[] };
  /** Index of the correct option (the same in both languages). */
  correct: number;
};

export interface SeedModule {
  slug: string;
  titleNl: string;
  titleEn: string;
  contentNl: string;
  contentEn: string;
  estimatedMinutes: number;
  audience: 'ALL' | 'POWER_USERS' | 'MANAGEMENT';
  quiz: QuizQuestion[];
}

export const trainingModules: SeedModule[] = [
  {
    slug: 'what-is-ai',
    titleEn: 'What is AI and how do these tools work',
    titleNl: 'Wat is AI en hoe werken deze tools',
    estimatedMinutes: 15,
    audience: 'ALL',
    contentEn: `## What we mean by AI

Artificial intelligence (AI) is software that carries out tasks that normally need human judgement: recognising patterns, understanding language, making predictions. The tools you meet at work, such as ChatGPT, Microsoft 365 Copilot and DeepL, are built on models that were trained on very large amounts of text and images.

## How a language model works

A language model predicts the next word, again and again. It does not know what is true and it has no facts of its own, unless they are in the question or in a source it can read. That is why an answer can sound confident and still be wrong. Such an error is called a **hallucination**.

## What AI is good at

- Summarising and rewriting text
- Translating
- Making a first draft or a list of ideas
- Finding patterns in large amounts of data

## Where AI falls short

- It can invent facts, sources and figures
- It can repeat bias that was in its training data
- It does not know your organization, customers or context unless you tell it
- Its knowledge stops at a certain date

## What this means for you

Treat AI output as a draft from a fast but unreliable assistant. You stay responsible for everything you send, decide or publish. Check facts, figures and names before you use them.`,
    contentNl: `## Wat we bedoelen met AI

Kunstmatige intelligentie (AI) is software die taken uitvoert waarvoor normaal menselijk oordeel nodig is: patronen herkennen, taal begrijpen, voorspellingen doen. De tools die u op het werk tegenkomt, zoals ChatGPT, Microsoft 365 Copilot en DeepL, zijn gebouwd op modellen die zijn getraind met zeer grote hoeveelheden tekst en beeld.

## Hoe een taalmodel werkt

Een taalmodel voorspelt het volgende woord, steeds opnieuw. Het weet niet wat waar is en heeft zelf geen feiten, tenzij die in de vraag staan of in een bron die het kan lezen. Daarom kan een antwoord overtuigend klinken en toch fout zijn. Zo'n fout heet een **hallucinatie**.

## Waar AI goed in is

- Tekst samenvatten en herschrijven
- Vertalen
- Een eerste opzet of een lijst met ideeën maken
- Patronen vinden in grote hoeveelheden gegevens

## Waar AI tekortschiet

- Het kan feiten, bronnen en cijfers verzinnen
- Het kan vooroordelen herhalen die in de trainingsdata zaten
- Het kent uw organisatie, klanten en context niet, tenzij u die vertelt
- De kennis stopt op een bepaalde datum

## Wat dit voor u betekent

Behandel AI-uitvoer als een concept van een snelle maar onbetrouwbare assistent. U blijft verantwoordelijk voor alles wat u verstuurt, beslist of publiceert. Controleer feiten, cijfers en namen voordat u ze gebruikt.`,
    quiz: [
      {
        correct: 1,
        en: {
          question: 'What does a language model do?',
          options: [
            'It looks up facts in a database',
            'It predicts the next word based on patterns in its training data',
            'It reasons in the same way as a human',
          ],
        },
        nl: {
          question: 'Wat doet een taalmodel?',
          options: [
            'Het zoekt feiten op in een database',
            'Het voorspelt het volgende woord op basis van patronen in de trainingsdata',
            'Het redeneert op dezelfde manier als een mens',
          ],
        },
      },
      {
        correct: 0,
        en: {
          question: 'What is a hallucination?',
          options: [
            'An answer that sounds confident but is factually wrong',
            'An answer that takes a long time',
            'A question that the tool refuses to answer',
          ],
        },
        nl: {
          question: 'Wat is een hallucinatie?',
          options: [
            'Een antwoord dat overtuigend klinkt maar feitelijk onjuist is',
            'Een antwoord dat lang op zich laat wachten',
            'Een vraag die de tool weigert te beantwoorden',
          ],
        },
      },
      {
        correct: 2,
        en: {
          question: 'Who is responsible for AI output that you use in your work?',
          options: ['The vendor of the tool', 'The IT department', 'You'],
        },
        nl: {
          question: 'Wie is verantwoordelijk voor AI-uitvoer die u in uw werk gebruikt?',
          options: ['De leverancier van de tool', 'De IT-afdeling', 'U zelf'],
        },
      },
      {
        correct: 1,
        en: {
          question: 'Which task suits an AI tool well?',
          options: [
            'Taking the final decision on a job application',
            'Writing a first draft of a text',
            'Confirming legal facts without a check',
          ],
        },
        nl: {
          question: 'Welke taak past goed bij een AI-tool?',
          options: [
            'De eindbeslissing nemen over een sollicitatie',
            'Een eerste opzet van een tekst schrijven',
            'Juridische feiten bevestigen zonder controle',
          ],
        },
      },
      {
        correct: 0,
        en: {
          question: 'Why can AI output be biased?',
          options: [
            'Because the training data contained bias',
            'Because the computer has its own opinions',
            'It cannot be: AI is always neutral',
          ],
        },
        nl: {
          question: 'Waarom kan AI-uitvoer bevooroordeeld zijn?',
          options: [
            'Omdat de trainingsdata vooroordelen bevatte',
            'Omdat de computer een eigen mening heeft',
            'Dat kan niet: AI is altijd neutraal',
          ],
        },
      },
    ],
  },
  {
    slug: 'safe-use',
    titleEn: 'Using AI safely at work: data, privacy, output checking',
    titleNl: 'AI veilig gebruiken op het werk: gegevens, privacy, uitvoer controleren',
    estimatedMinutes: 20,
    audience: 'ALL',
    contentEn: `## Use approved tools only

The AI register lists the tools that have been approved for work. A tool that is not in the register has not been checked: nobody knows where your input goes or who can read it. Do you want to use a new tool? Ask for approval first, as described in the AI policy.

## Think before you paste

Everything you type into an AI tool leaves your computer. Free public tools may store your input and use it to train their models. That is why the AI policy lists data that you never enter, such as:

- Personal data of colleagues, customers or applicants
- Customer data and contracts
- Financial data that is not public
- Source code and trade secrets

When in doubt, leave it out or make the text anonymous first.

## Privacy

Personal data is protected by the GDPR. Entering personal data into a tool that is not approved for it can be a data breach, even when you meant well.

## Always check the output

AI makes mistakes that look convincing. Before you use output:

1. Check facts, figures, names and sources
2. Read the tone: does it fit the reader and the organization?
3. Ask yourself whether you could explain and defend the text

## Be open about AI

Label content that was largely made by AI as the AI policy prescribes. People have a right to know when they deal with AI.

## Report mistakes quickly

Did you enter data that should not have been entered, or did wrong AI output go out? Report it straight away to the contact in the AI policy. Reporting quickly limits the damage and never counts against you.`,
    contentNl: `## Gebruik alleen goedgekeurde tools

In het AI-register staan de tools die voor het werk zijn goedgekeurd. Een tool die niet in het register staat, is niet gecontroleerd: niemand weet waar uw invoer terechtkomt of wie die kan lezen. Wilt u een nieuwe tool gebruiken? Vraag eerst goedkeuring aan, zoals beschreven in het AI-beleid.

## Denk na voordat u plakt

Alles wat u in een AI-tool typt, verlaat uw computer. Gratis openbare tools mogen uw invoer vaak opslaan en gebruiken om hun modellen te trainen. Daarom noemt het AI-beleid gegevens die u nooit invoert, zoals:

- Persoonsgegevens van collega's, klanten of sollicitanten
- Klantgegevens en contracten
- Financiële gegevens die niet openbaar zijn
- Broncode en bedrijfsgeheimen

Bij twijfel: laat het weg of maak de tekst eerst anoniem.

## Privacy

Persoonsgegevens worden beschermd door de AVG. Persoonsgegevens invoeren in een tool die daarvoor niet is goedgekeurd, kan een datalek zijn, ook als u het goed bedoelde.

## Controleer altijd de uitvoer

AI maakt fouten die overtuigend lijken. Voordat u uitvoer gebruikt:

1. Controleer feiten, cijfers, namen en bronnen
2. Lees de toon: past die bij de lezer en bij de organisatie?
3. Vraag u af of u de tekst kunt uitleggen en verdedigen

## Wees open over AI

Label content die grotendeels door AI is gemaakt zoals het AI-beleid voorschrijft. Mensen hebben er recht op te weten wanneer zij met AI te maken hebben.

## Meld fouten snel

Heeft u gegevens ingevoerd die niet ingevoerd hadden mogen worden, of is er foute AI-uitvoer verstuurd? Meld het direct bij het contactpunt uit het AI-beleid. Snel melden beperkt de schade en wordt u nooit aangerekend.`,
    quiz: [
      {
        correct: 2,
        en: {
          question: 'Which AI tools may you use for your work?',
          options: [
            'Any tool that is free',
            'Any tool that a colleague recommends',
            'Only tools that are approved in the AI register',
          ],
        },
        nl: {
          question: 'Welke AI-tools mag u voor uw werk gebruiken?',
          options: [
            'Elke tool die gratis is',
            'Elke tool die een collega aanraadt',
            'Alleen tools die in het AI-register zijn goedgekeurd',
          ],
        },
      },
      {
        correct: 1,
        en: {
          question: 'May you paste a customer list with names into a free public chatbot?',
          options: [
            'Yes, if you delete the chat afterwards',
            'No, personal data and customer data do not go into such tools',
            'Yes, if it saves a lot of time',
          ],
        },
        nl: {
          question: 'Mag u een klantenlijst met namen in een gratis openbare chatbot plakken?',
          options: [
            'Ja, als u de chat daarna verwijdert',
            'Nee, persoonsgegevens en klantgegevens horen niet in zulke tools',
            'Ja, als het veel tijd bespaart',
          ],
        },
      },
      {
        correct: 0,
        en: {
          question: 'What do you do before you send AI-generated text to a customer?',
          options: [
            'Check the facts and the tone yourself',
            'Nothing, the tool has already checked it',
            'Ask the tool whether the text is correct',
          ],
        },
        nl: {
          question: 'Wat doet u voordat u door AI gemaakte tekst naar een klant stuurt?',
          options: [
            'Zelf de feiten en de toon controleren',
            'Niets, de tool heeft het al gecontroleerd',
            'De tool vragen of de tekst klopt',
          ],
        },
      },
      {
        correct: 2,
        en: {
          question: 'You entered confidential information into an AI tool by mistake. What do you do?',
          options: [
            'Nothing, as long as nobody notices',
            'Wait and see whether something goes wrong',
            'Report it straight away to the contact in the AI policy',
          ],
        },
        nl: {
          question: 'U heeft per ongeluk vertrouwelijke informatie in een AI-tool ingevoerd. Wat doet u?',
          options: [
            'Niets, zolang niemand het merkt',
            'Afwachten of er iets misgaat',
            'Direct melden bij het contactpunt uit het AI-beleid',
          ],
        },
      },
      {
        correct: 1,
        en: {
          question: 'Why do you label content that was made by AI?',
          options: [
            'Because it makes the text look more modern',
            'Because people have a right to know when they deal with AI',
            'Because unlabelled AI text is automatically deleted',
          ],
        },
        nl: {
          question: 'Waarom labelt u content die door AI is gemaakt?',
          options: [
            'Omdat de tekst er moderner door lijkt',
            'Omdat mensen er recht op hebben te weten wanneer zij met AI te maken hebben',
            'Omdat ongelabelde AI-tekst automatisch wordt verwijderd',
          ],
        },
      },
    ],
  },
  {
    slug: 'governance-for-managers',
    titleEn: 'AI governance and the AI Act for managers',
    titleNl: 'AI-governance en de AI-verordening voor managers',
    estimatedMinutes: 25,
    audience: 'MANAGEMENT',
    contentEn: `## Why this matters to you

The EU AI Act applies to every organization that builds or uses AI, including small and medium businesses. As a manager you decide which AI is used in your team, and you are the one who is asked how it is kept under control.

## Four risk tiers

The AI Act sorts AI by risk:

- **Prohibited**: practices such as social scoring, manipulation and recognising emotions of employees. These have been banned since 2 February 2025.
- **High**: AI in sensitive areas such as recruitment, appraisal of employees, credit and education. Strict obligations apply.
- **Limited**: AI that talks to people or creates content, such as a chatbot. People must be told that they deal with AI.
- **Minimal**: everything else, such as spelling checkers and translation tools.

## The dates

- Since 2 February 2025: prohibited practices are banned and organizations must make sure their staff has enough AI knowledge (AI literacy).
- From 2 December 2027: obligations for high-risk systems in the areas of Annex III, such as recruitment.
- From 2 August 2028: obligations for AI that is a safety component of a regulated product.

## What a user of high-risk AI must do

Most companies use AI that others built. For a high-risk system that means:

1. Assign a person who oversees the system and can step in
2. Use the system according to the instructions of the provider
3. Keep the logs
4. Tell employees that the system is used
5. Review the system regularly

## Getting control in four steps

1. **Register**: list every AI system in the AI register, with an owner
2. **Classify**: answer the questionnaire per system and carry out the actions
3. **Policy**: publish an AI policy and have everyone acknowledge it
4. **Train**: make sure everyone completes the AI literacy training

## Your role

Ask in your team which AI tools are really used, including free tools and AI features inside existing software. What is not in the register cannot be managed.`,
    contentNl: `## Waarom dit voor u belangrijk is

De Europese AI-verordening geldt voor elke organisatie die AI bouwt of gebruikt, ook voor het midden- en kleinbedrijf. Als manager beslist u welke AI in uw team wordt gebruikt, en u bent degene aan wie wordt gevraagd hoe dat onder controle blijft.

## Vier risiconiveaus

De AI-verordening deelt AI in op risico:

- **Verboden**: praktijken zoals social scoring, manipulatie en het herkennen van emoties van medewerkers. Deze zijn verboden sinds 2 februari 2025.
- **Hoog**: AI op gevoelige gebieden zoals werving, beoordeling van medewerkers, krediet en onderwijs. Hiervoor gelden strenge verplichtingen.
- **Beperkt**: AI die met mensen praat of content maakt, zoals een chatbot. Mensen moeten weten dat zij met AI te maken hebben.
- **Minimaal**: al het overige, zoals spellingcontrole en vertaaltools.

## De data

- Sinds 2 februari 2025: verboden praktijken zijn niet toegestaan en organisaties moeten zorgen dat hun medewerkers genoeg van AI weten (AI-geletterdheid).
- Vanaf 2 december 2027: verplichtingen voor hoog-risicosystemen op de gebieden van bijlage III, zoals werving.
- Vanaf 2 augustus 2028: verplichtingen voor AI die een veiligheidscomponent is van een gereguleerd product.

## Wat een gebruiker van hoog-risico-AI moet doen

De meeste bedrijven gebruiken AI die anderen hebben gebouwd. Voor een hoog-risicosysteem betekent dat:

1. Wijs iemand aan die toezicht houdt op het systeem en kan ingrijpen
2. Gebruik het systeem volgens de instructies van de aanbieder
3. Bewaar de logs
4. Vertel medewerkers dat het systeem wordt gebruikt
5. Beoordeel het systeem regelmatig opnieuw

## Grip krijgen in vier stappen

1. **Registreren**: zet elk AI-systeem in het AI-register, met een eigenaar
2. **Classificeren**: beantwoord de vragenlijst per systeem en voer de acties uit
3. **Beleid**: publiceer een AI-beleid en laat iedereen het bevestigen
4. **Trainen**: zorg dat iedereen de training AI-geletterdheid afrondt

## Uw rol

Vraag in uw team welke AI-tools echt worden gebruikt, ook gratis tools en AI-functies in bestaande software. Wat niet in het register staat, kan niet worden beheerd.`,
    quiz: [
      {
        correct: 0,
        en: {
          question: 'In which risk tier is a use banned entirely?',
          options: ['Prohibited', 'High', 'Limited'],
        },
        nl: {
          question: 'Bij welk risiconiveau is een toepassing helemaal niet toegestaan?',
          options: ['Verboden', 'Hoog', 'Beperkt'],
        },
      },
      {
        correct: 2,
        en: {
          question:
            'From which date do the obligations for high-risk systems in recruitment (Annex III) apply?',
          options: ['2 February 2025', '2 August 2028', '2 December 2027'],
        },
        nl: {
          question:
            'Vanaf welke datum gelden de verplichtingen voor hoog-risicosystemen bij werving (bijlage III)?',
          options: ['2 februari 2025', '2 augustus 2028', '2 december 2027'],
        },
      },
      {
        correct: 1,
        en: {
          question: 'A tool ranks job applicants automatically. Which tier is that?',
          options: ['Minimal', 'High', 'Limited'],
        },
        nl: {
          question: 'Een tool rangschikt sollicitanten automatisch. Welk niveau is dat?',
          options: ['Minimaal', 'Hoog', 'Beperkt'],
        },
      },
      {
        correct: 1,
        en: {
          question: 'What must a user of a high-risk system arrange?',
          options: [
            'Nothing: the provider is responsible for everything',
            'A person who oversees the system and can step in',
            'A new version of the system every month',
          ],
        },
        nl: {
          question: 'Wat moet een gebruiker van een hoog-risicosysteem regelen?',
          options: [
            'Niets: de aanbieder is overal verantwoordelijk voor',
            'Iemand die toezicht houdt op het systeem en kan ingrijpen',
            'Elke maand een nieuwe versie van het systeem',
          ],
        },
      },
      {
        correct: 0,
        en: {
          question: 'What is the first step to get control of AI in your organization?',
          options: [
            'Registering every AI system that is in use',
            'Banning all AI tools',
            'Waiting for the regulator to ask questions',
          ],
        },
        nl: {
          question: 'Wat is de eerste stap om grip te krijgen op AI in uw organisatie?',
          options: [
            'Elk AI-systeem dat in gebruik is registreren',
            'Alle AI-tools verbieden',
            'Wachten tot de toezichthouder vragen stelt',
          ],
        },
      },
    ],
  },
];
