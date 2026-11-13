---
name: slidev-lecture-deck
description: Build a teaching slide deck in Slidev in a clean light lecture style (Plus Jakarta Sans, white background, big plain headlines, full-width inline-SVG figures that build one click at a time, calm CSS looping motion). Use when asked to make lecture slides, a talk deck or a teaching presentation in this style, or to add slides or figures to such a deck.
---

# Slidev lecture deck

The full reference is `GUIDE.md` in the slidev-lecture-template repository. A working starter deck is in `starter/`. Start every new deck by copying `starter/`, then change the topic.

## Workflow

1. **Outline first.** Write the slide titles as full sentences that state the point ("On a miss, the value makes the whole trip from memory"), 1 idea per slide. Show the outline before building.
2. **Copy the starter**, into a path with no spaces (Vite breaks on spaces). Keep its headmatter: `canvasWidth: 1180`, `colorSchema: light`, `defaults.preload: false`, and editor, recorder, exporter and drawings turned off.
3. **One slide type per slide:** title (`.ttl`), section (`.sec`), content (`.kick` eyebrow, `.hd` headline with one `<em>` highlight, then a full-width figure), closing. Use the classes in `starter/style.css`; do not invent new colours. Use the tokens (indigo, emerald, amber, rose, slate).
4. **Figures are Vue components with inline SVG**, one per figure, in `components/`. Copy `FigPipeline.vue`: an array of items, each with an `at` click number, shown when `$clicks >= at`. Text inside SVG at least 15 px at the 1180 px canvas.
5. **Clicks:** set `clicks: N` in each slide's frontmatter to match the highest step. Use `v-click="n"` with explicit numbers. To merge two slides, pass an `off` prop so the second figure's clicks start after the first.
6. **Motion:** looping CSS only (dots along an `offset-path`, marching dashes), calm and slow, only where it shows data moving. No flashing. Pause animations after 15 s idle (the starter's `global-bottom.vue` does this).
7. **Speaker notes** in `<!-- -->` under every slide: what to say, click by click.

## Content rules

- Define every term the first time it appears, in plain words, often as a small definition card on the last click.
- Derive numbers on the slide instead of asserting them.
- No code excerpts, function names or file paths on slides; figures and plain words.
- No analogies or metaphors; use plain technical labels.
- Light theme only, white background, no italic or decorative title fonts.
- No em dashes in slide text.
- Label lectures "Lecture N", not "Lecture N of M".

## Self-QA before showing anyone

Run `npx slidev build`, then step through every click in the browser and check:
- Each animation appears on the click the notes say it does, and nothing is hidden behind another element.
- No text overflows its box or the slide; nothing is cut off at 1180 x 664.
- Every click reveals something (no empty clicks), and `clicks:` matches.
- Memory use stays reasonable with only the current slide mounted (`preload: false`).
