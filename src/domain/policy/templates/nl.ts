import type { PolicyTemplate } from '../buildPolicy';

export const nl: PolicyTemplate = {
  title: 'AI-beleid {{org}}',
  sections: [
    {
      heading: 'Doel en reikwijdte',
      body: `Dit beleid beschrijft hoe {{org}} verantwoord omgaat met kunstmatige intelligentie (AI). Het geldt voor alle medewerkers, ingehuurde krachten en tijdelijke medewerkers die AI-tools voor het werk gebruiken, op apparaten van de organisatie en op privéapparaten.

Versiedatum: {{date}}.`,
    },
    {
      heading: 'Definities',
      body: `- **AI-systeem**: software die op basis van invoer uitvoer maakt, zoals voorspellingen, aanbevelingen, tekst of beeld.
- **AI-tool**: een AI-systeem dat medewerkers rechtstreeks gebruiken, zoals een chatbot, een vertaaldienst of een assistent in kantoorsoftware.
- **Generatieve AI**: AI die nieuwe tekst, beelden, audio of video maakt.
- **AI-register**: de lijst in AIControl van alle AI-systemen die {{org}} gebruikt, met eigenaar en risiconiveau.
- **Persoonsgegevens**: alle informatie over een geïdentificeerde of identificeerbare persoon.`,
    },
    {
      heading: 'Goedgekeurde tools',
      body: `Alleen AI-tools die in het AI-register staan met de status goedgekeurd of in gebruik mogen voor het werk worden gebruikt. Op de datum van dit beleid zijn dat:

{{tools}}

{{publicTools}}`,
    },
    {
      heading: 'Verboden gebruik',
      body: `AI wordt nooit gebruikt voor:

- praktijken die de Europese AI-verordening verbiedt, zoals social scoring, het manipuleren van mensen of het herkennen van emoties van medewerkers;
- beslissingen over mensen (aanname, beoordeling, ontslag, krediet) zonder een mens die beoordeelt en beslist;
- werk met een tool die niet is goedgekeurd;
- het omzeilen van beveiligingsmaatregelen of de regels van dit beleid.`,
    },
    {
      heading: 'Regels voor gegevens',
      body: `De volgende gegevens mogen nooit in een AI-tool worden ingevoerd, tenzij in het AI-register staat dat de tool daarvoor is goedgekeurd:

{{forbiddenData}}

Bij twijfel: voer de gegevens niet in en vraag het aan {{approver}}.`,
    },
    {
      heading: 'Menselijk toezicht',
      body: `{{humanReview}}

De medewerker die AI-uitvoer gebruikt, blijft verantwoordelijk voor de juistheid, de toon en de gevolgen ervan. Controleer feiten, cijfers, namen en bronnen voor gebruik.`,
    },
    {
      heading: 'Transparantie en labeling',
      body: `{{labelling}}

Mensen die communiceren met een AI-systeem van {{org}}, zoals een chatbot, krijgen te horen dat zij met AI te maken hebben.`,
    },
    {
      heading: 'Rollen en goedkeuringsproces',
      body: `Nieuwe AI-tools worden vóór het eerste gebruik goedgekeurd door {{approver}}. Elke aanvraag wordt opgenomen in het AI-register en op risico geclassificeerd. Elk AI-systeem heeft een eigenaar die de registratie actueel houdt en de acties uit de classificatie uitvoert.

Alle medewerkers volgen de training AI-geletterdheid die aan hen is toegewezen en bevestigen dat zij dit beleid hebben gelezen.`,
    },
    {
      heading: 'Incidenten en herziening',
      body: `Meld incidenten, fouten en twijfels over het gebruik van AI zo snel mogelijk bij {{incidentContact}}. Een melding te goeder trouw heeft nooit negatieve gevolgen.

Dit beleid wordt elke {{reviewMonths}} maanden herzien, en eerder als de wet of het gebruik van AI verandert.`,
    },
  ],
  phrases: {
    noTools: 'Er zijn nog geen AI-tools goedgekeurd.',
    publicTools: {
      no: 'Gratis openbare AI-tools die niet in het register staan, mogen niet voor het werk worden gebruikt.',
      withoutCompanyData:
        'Gratis openbare AI-tools mogen alleen voor het werk worden gebruikt zonder bedrijfsgegevens: geen namen, geen klantinformatie en geen interne documenten.',
      yes: 'Gratis openbare AI-tools mogen voor het werk worden gebruikt, binnen de regels voor gegevens in dit beleid.',
    },
    forbiddenData: {
      personal: 'Persoonsgegevens',
      customer: 'Klantgegevens',
      financial: 'Financiële gegevens',
      sourceCode: 'Broncode',
      tradeSecrets: 'Bedrijfsgeheimen',
    },
    noForbiddenData:
      'Er zijn geen categorieën uitgesloten; volg de gegevensclassificatie van de organisatie.',
    humanReview: {
      always: 'Een mens controleert alle AI-uitvoer voordat die de organisatie verlaat.',
      customerFacing: 'Een mens controleert AI-uitvoer voordat die naar klanten gaat of wordt gepubliceerd.',
    },
  },
};
