# SPEC: AIControl, "The board's question" (storyline A)

GOAL: an IT manager at a small company thinks "I can answer the board's AI question in one afternoon, for free" and runs `docker compose up`.

OUTPUT: HyperFrames, 1920 x 1080, 30 fps, English copy, silent (no music source on this machine: no HeyGen sign-in, no local model; add a track later as a separate `<audio>`).

TIME: 45.0 s x 30 = 1350 frames. No music, so the clock is the reading time: 0.5 s + 0.3 s a word.

LOOK: the product's own design tokens, nothing else.
- Ground: Paper #FFFFFF; the email world is on Shelf #F2F4F6. Ink #1C2430, muted #566170, rule #D8DDE3 at 1 px.
- Accent: Action #1F4E79, only on the end card's command.
- Tier colours: #8E1B2B / #B4690E / #2F6690 / #5E8566, plus "not assessed" as a #9AA3AD hatch at 135 degrees (2 px line, 5 px pitch, scaled with the strip). They are always next to a text label or carried from a screen that has one.
- Type: Public Sans 600 for display (72-120 px, -1% tracking) and 400/600 for body (30-40 px); IBM Plex Mono 400 for the command only. Sentence case everywhere, tabular numerals.
- Medium: product UI captured at 2x from localhost:3000 (demo data), shown at 1.05-2.7x of its real size. Radius 4 px on boxes, 6 px on panels, no shadows, no gradients.
- Light and depth: none. Flat, like the app.

OBJECTS:
- Email: a white panel (1320 x 800, 1 px rule border, radius 6) with From, To, Subject and four body lines. It is generic, not modelled on any mail brand.
- Spreadsheet: a white grid with a Shelf header row, 1 px rule lines, a file name above it and "?" in every Risk and Trained cell. The 8 tool names and departments come from the demo register.
- Risk strip: equal segments with 8 px gaps, tier-coloured, with the not-assessed one hatched. It is the carrier from the reveal to the payoff to the end-card mark.
- Cursor: a standard arrow, 54 px tall (5% of the frame), black fill with a 2 px white stroke.

MOTION:
- Arrivals: expo.out 0.5-0.9 s. Camera: power2.inOut 0.5-0.6 s. Zoom-through and exits: power3.in 0.35-0.6 s.
- Words: per word, blur 6 px to 0 plus opacity 0 to 1 in 0.13 s, 0.067 s apart; or grey #C3CAD2 to ink, 0.08 s apart.
- Exits are 0.2 s blur-outs. Overlap is 30-50%. Click: the cursor scales to 0.88 for 3 frames, and the UI changes on the same frame.
- Motion blur is on at the root for the camera moves.

SHOTS:
| Shot | Time | Hero move | The viewer reads | Hand-off |
| --- | --- | --- | --- | --- |
| hook | 0.0-4.6 | The email body turns from grey to ink word by word, then the camera pushes to "by Friday?" | "AI Act: where do we stand?" and the four questions | horizontal whip out |
| sheet | 4.6-11.0 | "?" cells pop in; then the 8 Risk cells fly into a hatched strip and AIControl lands above it | "8 AI tools. Zero answers." → "AIControl / Open-source AI governance for SMEs" | zoom through the hatched Grammarly segment |
| register | 11.0-15.6 | The camera pulls back from Grammarly's "Not assessed" swatch to the whole register | "Register every AI tool" | zoom through the CV screening tool row |
| classify | 15.6-22.6 | The cursor clicks Yes on the recruitment question; the panel flips to High | "Classify it in plain questions", then "High · Used in recruitment… (Annex III(4))" | match cut on the High badge (52 x 24 in both screens) |
| detail | 22.6-28.0 | Pull back to "Why high", tilt down; the 8 actions appear row by row | "Why high", the actions | vertical whip |
| todos | 28.0-32.0 | Two to-dos flip from "Not started" to "Done" | "Train everyone. Track it." | blur swap |
| payoff | 32.0-38.6 | The hatched strip fills tier by tier, the summary lands, then it is carried into the real dashboard | "8 AI systems registered. 3 need action, 1 is not assessed." and "…386 days" | cut on the dashboard hold |
| end | 38.6-45.0 | The claim, then the mark is built segment by segment, the wordmark wipes in and the command lands | "Know your AI, tool by tool." → "AIControl" → `docker compose up` | hold 2.4 s |

Facts on screen all come from the running demo or the README:
- 8 systems; 3 need action; 1 not assessed; the high-risk date 2 Dec 2027 (386 days).
- Recruitment is Annex III(4); the CV screening tool gets 8 actions.
- "Free, open source, self-hosted" comes from the README.

The email and the spreadsheet are the illustrative scenario.

BANNED: the spec defaults (dark void, glow, gradients, cream-serif look, everything centred or fading up, pills, three cards, docked logo, corner labels), plus:
- invented UI, and a click that implies navigation the app does not have;
- a bounce on UI;
- a title moving after it lands;
- tier colour without its label.

QA:
- frames at 0.0 (the thumbnail shows the email), 3.0, 6.5, 9.5, 12.0, 18.5, 21.0, 22.7 (match cut), 25.0, 27.0, 30.5, 34.0, 37.5, 40.0 and 44.5;
- every title at least 28 px; no text over text; the hatch is visible at every size.
