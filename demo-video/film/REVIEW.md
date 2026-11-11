# Review: AIControl demo film (storyline A, 45.6 s)

## Creative calls
- Built storyline A, "The board's question". Not built: B "Inside the strip" (one endless zoom) and C "386 days" (kinetic type on the beat). Both are in `STORYLINES.md`.
- **Screens:**
  - Every product screen is a 2x capture of the running app (localhost:3000, demo data, English).
  - The email and the spreadsheet are an illustrative scenario drawn in HTML, in no brand's style.
- **The risk strip is the carrier:** the spreadsheet's Risk column becomes a hatched strip, the strip fills in the payoff, and a small strip is the mark on the end card. AIControl has no logo, so the mark is the product's own signature element.
- **Beats:** four verb beats (register, classify, why plus actions, train) instead of the storyline's five. Publishing the policy was left out to keep the film under 46 s; the employee's to-do list does include "Read and acknowledge the AI policy".
- **Classify scene:** the questionnaire answer was clicked in the real wizard, but never saved. The before and after captures are real UI states.
- **To-do list:** the after-state was produced in the real app (the employee passed module 1 and acknowledged the policy). In the after-capture the app listed "What is AI…" second instead of first. Its real Done row is laid over row 1 so the list does not reshuffle on screen.

## Measured and looked at
- `npx hyperframes check`: lint, runtime, layout, motion, contrast and audio are all ok; craft gives 2 warnings (below).
- Snapshots looked at:
  - every QA frame from `SPEC.md`;
  - the beat sheet and seam strips from `snapshot --review`;
  - the match cut at 23.2 s (the High badge is 52 x 24 in both screens and lands within about 60 px).

## Not checked
- Phone-width readability at 360 px was not checked separately.
- Nobody heard the film: it has no sound.

## Warnings kept on purpose
- `film_silent`: there is no music source on this machine (no HeyGen sign-in, no local MusicGen). Add a track as an `<audio id="music">` on the root, or sign in and use `/media-use`.
- `text_below_floor`: the summary, countdown and legend shrink while they are carried into the real dashboard (about 0.5 s). That small size is the dashboard's real scale; they are readable at 56/34/30 px before the carry.

## Weakest shot
- **Classify (16.2 s):** the wide establishing frame of the questionnaire has small text and many identical radio rows. With more time I would start closer, on the question group, and show the step header only.
- **Detail (25.9 s):** about 1 s of empty space under "Actions" before the rows appear.
