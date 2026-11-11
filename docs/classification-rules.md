# Classification rules

This page is the human-readable version of [`src/domain/classification/rules.ts`](../src/domain/classification/rules.ts). The engine in [`engine.ts`](../src/domain/classification/engine.ts) is a pure function: the same answers always give the same result.

> AIControl supports governance and documentation; it is not legal advice. Classification results are indicative and must be reviewed by a responsible person.

## How a result is decided

The tiers are evaluated in the order PROHIBITED → HIGH → LIMITED → MINIMAL. The highest tier that is triggered wins, and every triggered rule is recorded in the rationale, so a prohibited system that is also used in a high-risk area shows both reasons.

## Step 1: Role

The first question is whether the organization built the system (provider) or uses a system from someone else (deployer). The role is stored with the assessment and decides which actions are generated for a high-risk system.

## Step 2: Prohibited practices (Article 5)

Yes on any question → **PROHIBITED**.

| Reference | Question | Rule shown in the rationale |
| --- | --- | --- |
| Art. 5(1)(c) | Does the system score or rank people on their social behaviour or personal traits, leading to unjustified or unfavourable treatment? | Social scoring of people |
| Art. 5(1)(a)-(b) | Does the system use manipulative or deceptive techniques, or exploit vulnerabilities (age, disability, social or economic situation), in a way that causes significant harm? | Manipulation or exploitation of vulnerabilities |
| Art. 5(1)(f) | Does the system recognise emotions of employees or students (other than for medical or safety reasons)? | Emotion recognition of employees or students |
| Art. 5(1)(e) | Does the system build or expand a facial recognition database by untargeted scraping of facial images from the internet or camera footage? | Untargeted scraping of facial images |
| Art. 5(1)(g) | Does the system categorise people by biometric data to infer sensitive traits such as ethnicity, political opinions or sexual orientation? | Biometric categorisation inferring sensitive traits |
| Art. 5(1)(d) | Does the system predict whether a person will commit a criminal offence based solely on profiling or personality traits? | Predicting criminal offences solely by profiling |

## Step 3: High-risk areas (Annex III and Annex I)

Yes on any question → candidate **HIGH**.

| Reference | Question | Rule shown in the rationale |
| --- | --- | --- |
| Annex III(1) | Is the system used for biometric identification or categorisation of people? | Biometric identification or categorisation |
| Annex III(2) | Is the system a safety component of critical infrastructure (energy, water, traffic, digital infrastructure)? | Safety component of critical infrastructure |
| Annex III(3) | Is the system used in education for admission, grading or monitoring of students? | Used in education for admission, grading or monitoring |
| Annex III(4) | Is the system used for recruitment or CV screening, decisions on promotion or termination, task allocation based on behaviour or traits, or monitoring and evaluating performance? | Used in recruitment or decisions about employees |
| Annex III(5) | Does the system decide on access to essential services: creditworthiness, life or health insurance pricing, public benefits or emergency call triage? | Decides on access to essential services |
| Annex III(6)-(8) | Is the system used for law enforcement, migration or border control, or the administration of justice or elections? | Used in law enforcement, migration, justice or elections |
| Art. 6(1), Annex I | Is the system a safety component of a product covered by EU product legislation (for example machinery, vehicles, medical devices)? | Safety component of a regulated product |

## Step 4: Exception check (Article 6(3))

Only asked for an Annex III candidate. If the first answer is yes **and** the system does not profile natural persons, the Annex III rules no longer make the system high-risk; the tier is then decided by step 5 (LIMITED) or step 6 (MINIMAL), and the action "Document why this system is not high-risk and register it in the EU database" is added. Profiling always keeps the system HIGH. A safety component of a regulated product (Annex I) cannot use this exception.

| Reference | Question | Rule shown in the rationale |
| --- | --- | --- |
| Art. 6(3) | Does the system only perform a narrow procedural task, improve the result of a completed human activity, detect patterns without replacing human assessment, or perform a preparatory task? | — |
| Art. 6(3) | Does the system profile natural persons (automatically evaluate personal aspects such as work performance, behaviour, interests or reliability)? | — |

## Step 5: Transparency (Article 50)

Yes on any question → **LIMITED**.

| Reference | Question | Rule shown in the rationale |
| --- | --- | --- |
| Art. 50(1) | Does the system interact directly with people, such as a chatbot or voice assistant? | Interacts directly with people |
| Art. 50(2), 50(4) | Does the system generate or manipulate text, images, audio or video that is shown to others (including deepfakes)? | Generates content that is shown to others |
| Art. 50(3) | Does the system recognise emotions or categorise people by biometric data in a way that is not covered by the prohibited practices? | Emotion recognition or biometric categorisation |

## Step 6: Otherwise

No rule triggered → **MINIMAL**, with the rationale "No prohibited, high-risk or transparency criteria apply".

## Rules that do not belong to one question

| Rule | Reference | Text |
| --- | --- | --- |
| `exceptionApplied` | Art. 6(3) | Exception applies: a narrow, supporting or preparatory task without profiling |
| `profilingNoException` | Art. 6(3) | Profiles natural persons: no exception possible |
| `minimalDefault` | — | No prohibited, high-risk or transparency criteria apply |

## Actions created automatically

| Tier | Actions (deployer) |
| --- | --- |
| PROHIBITED | Stop use immediately; Consult legal counsel; Document the decision |
| HIGH | Assign a human oversight owner; Follow the provider's instructions for use; Keep the logs the system generates; Inform the employees who are affected; Check the provider's conformity documentation; Check whether a fundamental rights impact assessment applies; Review this system every 6 months |
| LIMITED | Tell users that they interact with AI; Label AI-generated content; Review this system every 12 months |
| MINIMAL | Keep the register entry up to date; Follow the company AI policy; Review this system every 12 months |

Additional rules:

- **Provider of a high-risk system**: "Follow the provider's instructions for use" and "Check the provider's conformity documentation" are replaced by "Arrange the provider obligations: conformity assessment, technical documentation and registration".
- **Personal data**: "Check whether GDPR applies (DPIA)" is added when the data categories of the system contain personal or sensitive personal data.
- **Exception applied**: "Document why this system is not high-risk and register it in the EU database" is added.
- **Review date**: HIGH systems are reviewed every 6 months, LIMITED and MINIMAL systems every 12 months. The next review date of the system is set when the assessment is saved.

## Dates shown for high-risk systems

After the Digital Omnibus, Regulation (EU) 2026/1744:

| Basis | Obligations apply from |
| --- | --- |
| Annex III (standalone high-risk areas) | 2 December 2027 |
| Annex I (safety component of a regulated product) | 2 August 2028 |

Prohibited practices have applied since 2 February 2025.

## Changing the rules

Edit `rules.ts`: every question has an id, a step, an article reference and Dutch and English texts. Add a test for each new rule in `engine.test.ts`; the engine is kept at 100% test coverage. All texts are also available in Dutch in `rules.ts`.
