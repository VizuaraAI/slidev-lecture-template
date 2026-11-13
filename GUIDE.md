# How to make a lecture deck like "Lecture 0"

This guide shows how to build a Slidev lecture deck on any topic with the look, layout and animations of
Lecture 0 of the vLLM & SGLang Engineering course ("How LLM inference works on a GPU", public at
https://vllm-lecture-0.vercel.app). Everything below is taken from the real deck in
`slides/lecture-0/`. Section 7 has a complete starter you can copy and fill with your own topic.

Contents

1. Slidev: install, run, build, export, deploy
2. The theme: fonts, colours, layouts, slide types
3. Animations: clicks, merged slides, looping figure motion
4. Figures: how they were made, and the tools that were not used
5. Writing rules for the content
6. Performance (low RAM) and a self-QA checklist
7. Starter template

---

## 1. Slidev: install, run, build, export, deploy

### What Slidev is

[Slidev](https://sli.dev) turns one Markdown file (`slides.md`) into a web slide deck. Slides are separated by `---`.
Each slide can hold plain Markdown, HTML and Vue components. Clicks (step-by-step reveals) are built in, the deck
runs in any browser, and `slidev build` produces a static site you can host anywhere.

Lecture 0 uses Slidev mostly as an HTML canvas: every slide is hand-written HTML with CSS classes, and every
figure is a Vue component that draws an inline SVG. There are almost no Markdown bullets.

### Versions

`package.json` from the deck (the `name` field is a leftover; rename it):

```json
{
  "name": "my-lecture",
  "private": true,
  "scripts": {
    "dev": "slidev --open",
    "build": "slidev build"
  },
  "dependencies": {
    "@slidev/cli": "^51.0.0",
    "@slidev/theme-default": "latest",
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "playwright-chromium": "^1.62.1"
  }
}
```

Versions actually installed when Lecture 0 was built: `@slidev/cli` 51.8.2, `@slidev/theme-default` 0.25.0,
`vue` 3.5.42. Use Node 20 or newer. `playwright-chromium` is only needed for PDF or PNG export.

### Scaffold

```text
my-lecture/
  package.json
  slides.md            # headmatter + opening slides, then src: includes for each part
  pages/               # one file per part: part1.md, part2.md, ...
  components/          # one .vue file per figure (auto-registered by Slidev)
  setup/main.ts        # fits the canvas to the window, reloads after a redeploy
  global-bottom.vue    # footer + "pause animations when idle"
  style.css            # tokens, slide types, figure text classes (imports styles/*.css)
  styles/              # extra CSS per part, to keep files small
  public/              # logo, favicon, photos (served at /)
  vite.config.ts       # optional
```

Slidev picks up `style.css`, `global-bottom.vue`, `setup/main.ts` and `components/*.vue` automatically by name.
Long decks are split into parts and pulled in from `slides.md` like this:

```md
---
src: ./pages/part1.md
---
```

### Run, build, export, deploy

Important: keep the project path free of spaces. Vite fails on a space in the path (the original folder,
`vLLM Engineering`, has one, so the course scripts rsync each deck to a space-free mirror before building).

```bash
npm install                      # once
npx slidev --port 8781           # dev server with hot reload: http://localhost:8781
npx slidev build                 # static site in dist/
npx slidev export --output my-lecture.pdf --timeout 180000              # PDF, final click state of each slide
npx slidev export --with-clicks --output my-lecture-clicks.pdf --timeout 180000   # one page per click
npx slidev export --format png --output export --timeout 120000          # PNG per slide
```

Notes:

- Export always uses port 18724, so run one export at a time.
- `browserExporter: false` in the headmatter only removes the in-browser export button; the CLI export above still works.
- Useful dev URLs: `http://localhost:8781/#/5` opens slide 5, `#/5?clicks=99` shows slide 5 fully built.

Deploy to Vercel (the deck is a static site and uses `routerMode: hash`, so no rewrites are needed):

```bash
npm i -g vercel
npx slidev build
cd dist
vercel link --yes --project my-lecture     # first time only: creates dist/.vercel
vercel --prod --yes
```

`slidev build` wipes `dist/`, which deletes the `dist/.vercel` link. Copy it aside before each build and back
after, as the course's `deploy.sh` does:

```bash
keep="$(mktemp -d)"; [ -d dist/.vercel ] && cp -r dist/.vercel "$keep/"
npx slidev build
[ -d "$keep/.vercel" ] && cp -r "$keep/.vercel" dist/
cd dist && vercel --prod --yes
```



---

## 2. The theme

The look in one line: pure white canvas, one clean sans-serif (Plus Jakarta Sans), a small uppercase coloured
label above a big bold headline, one full-width figure per slide, solid colours with soft shadows, indigo as the
main accent.

### Headmatter (top of `slides.md`)

```yaml
---
theme: default
title: "Your lecture title"
fonts:
  sans: Plus Jakarta Sans
  mono: JetBrains Mono
  weights: "400,500,600,700,800"
  italic: false
aspectRatio: 16/9
canvasWidth: 1180
routerMode: hash
colorSchema: light
favicon: /logo.svg
layout: full
# Low-RAM lecture build: mount only the slide on screen, drop editor, recorder, exporter and drawing tools.
defaults:
  preload: false
monaco: false
record: false
browserExporter: false
contextMenu: false
drawings:
  enabled: false
hideFooter: true
---
```

- Slidev loads the fonts from Google Fonts. No italics anywhere.
- `canvasWidth: 1180` with 16:9 means every slide is designed on a 1180 by 664 canvas. All pixel sizes below assume that.
- `colorSchema: light` forces the light theme even when the viewer's OS is in dark mode.
- Every slide uses `layout: full` and positions its own content.

### Colour tokens

```css
:root {
  --ink: #0f172a;      /* main text */
  --ink2: #475569;     /* secondary text */
  --mute: #94a3b8;     /* labels, footer, inactive */
  --line: #e2e8f0;     /* borders */
  --wash: #f6f7fb;     /* card background */
  --indigo: #4f46e5;   /* main accent */
  --indigo-l: #e0e7ff;
  --teal: #0d9488;     /* second accent */
  --teal-l: #ccfbf1;
  --amber: #f59e0b;    /* third accent (text uses #b45309 for contrast) */
  --amber-l: #fef3c7;
  --rose: #e11d48;     /* warnings, "the problem" */
  --rose-l: #ffe4e6;
}
```

Extra shades used inside figures: indigo `#818cf8`, `#a5b4fc`, `#c7d2fe`, `#4338ca`, `#3730a3`, `#1e1b4b`;
teal `#2dd4bf`, `#99f6e4`, `#115e59`; amber `#fbbf24`, `#fcd34d`, `#92400e`; rose `#9f1239`; slate `#cbd5e1`,
`#1e293b`. Dark boxes (`#0f172a` to `#1e293b` gradient) are used sparingly for "the model" or "the chip".

Colour meaning is kept consistent through the deck: indigo for the main object, teal for the second option
or the good outcome, amber for inputs and stages, rose for costs and problems.

### Typography scale (on the 1180 px canvas)

| Element | Size and weight |
|---|---|
| Title slide `h1` | 54 to 58 px, 800, letter-spacing -0.035em, line-height 1.02 |
| Section slide `h1` | 54 px, 800 |
| Section slide numeral | 220 px, 800, white on indigo |
| Content headline `h2.hd` | 33 px, 800, letter-spacing -0.02em, max-width 900 px |
| Kicker label `.kick` | 14 px, 700, uppercase, letter-spacing 0.08em, coloured, with a small pill before it |
| Card titles | 17 to 22 px, 800 |
| Body text in cards | 14 to 16 px, colour `--ink2` |
| Footer | 11 px, 600, `--mute` |
| Figure labels (SVG) | 15 px 700 (`.t-lbl`), 13 px 500 (`.t-sm`), 11 px 600 caps (`.t-xs`) |

Headlines are full sentences that state the point, with the key phrase in indigo:
`Weights are <em>huge and fixed</em>; the activations for one token are <em>tiny</em>`.
`em` is not italic; it is styled as indigo.

### Core CSS (copy into `style.css`)

```css
/* Hide Slidev's closed "go to slide" list, or every slide title leaks onto the right edge. Keep this rule. */
.fixed.-top-20 .autocomplete-list { display: none; }

.slidev-layout {
  background: #fff !important;
  color: var(--ink);
  font-family: "Plus Jakarta Sans", Inter, sans-serif;
  padding: 0 !important;
}

/* Standard content slide */
.s { position: absolute; inset: 0; padding: 40px 56px 44px; display: flex; flex-direction: column; }
.kick { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--indigo); }
.kick::before { content: ""; width: 22px; height: 6px; border-radius: 3px; background: currentColor; }
.kick.teal { color: var(--teal); } .kick.rose { color: var(--rose); } .kick.amber { color: #b45309; }
h2.hd { margin: 10px 0 0; font-size: 33px; line-height: 1.15; font-weight: 800; letter-spacing: -.02em; color: var(--ink); max-width: 900px; }
h2.hd em { font-style: normal; color: var(--indigo); }
/* text blocks keep their natural height; only the figure area flexes */
.s > * { flex-shrink: 0; }
.s > .fig { flex-shrink: 1; }
.fig { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 0; margin-top: 8px; }
.fig svg { width: 100%; height: 100%; }

/* Footer */
.footer2 { position: absolute; left: 56px; right: 56px; bottom: 16px; display: flex; justify-content: space-between; font-size: 11px; color: var(--mute); font-weight: 600; letter-spacing: .02em; }
```

### Slide types

**Content slide** (most slides): kicker, headline, one figure that fills the rest.

```html
<div class="s">
  <div class="kick teal">weights and activations</div>
  <h2 class="hd">Weights are <em>huge and fixed</em>; the activations for one token are <em>tiny</em></h2>
  <div class="fig"><ZWeightsActs /></div>
</div>
```

**Title slide**: text on the left, a soft indigo-to-teal gradient panel with a faint grid and a looping concept
animation on the right (not a photo).

```html
<div class="ttl wl">
  <div class="l">
    <img class="logo" src="/logo.svg" alt="" />
    <div class="lec">Welcome to</div>
    <h1>Course name<br /><span>Second line</span></h1>
    <p class="sub">One sentence on what the learner will be able to do.</p>
    <div class="meta"><div><b>Your Name</b>Your role</div></div>
  </div>
  <div class="r"><div class="grid"></div><ZTitleChip /></div>
</div>
```

```css
.ttl { position: absolute; inset: 0; display: grid; grid-template-columns: 1.25fr 1fr; }
.ttl .l { padding: 56px 0 48px 64px; display: flex; flex-direction: column; }
.ttl .lec { margin-top: auto; font-size: 18px; font-weight: 700; color: var(--indigo); }
.ttl h1 { margin: 8px 0 0; font-size: 54px; line-height: 1.02; font-weight: 800; letter-spacing: -.035em; color: var(--ink); }
.ttl h1 span { color: var(--indigo); }
.ttl .sub { margin-top: 18px; font-size: 19px; line-height: 1.4; color: var(--ink2); max-width: 520px; }
.ttl .meta { margin-top: auto; display: flex; gap: 28px; font-size: 14px; color: var(--ink2); }
.ttl .meta b { display: block; color: var(--ink); font-size: 15px; }
.ttl .r { position: relative; overflow: hidden; background: linear-gradient(160deg, #eef2ff 0%, #e0e7ff 45%, #ccfbf1 100%); border-radius: 0 0 0 48px; }
.ttl .r .grid { position: absolute; inset: 0; background-image: linear-gradient(#4f46e512 1px, transparent 1px), linear-gradient(90deg, #4f46e512 1px, transparent 1px); background-size: 28px 28px; }
.ttl.wl .lec { font-size: 26px; color: var(--ink2); font-weight: 700; }
.ttl.wl h1 { font-size: 58px; }
.ttl.wl .logo { width: 64px; height: 64px; margin-bottom: 18px; }
.ttl .r .zt { position: absolute; inset: 36px 28px 20px; width: auto; height: auto; }
```

**Section divider**: a 420 px indigo band with a giant two-digit numeral, the part title, one sentence, and a
list of all parts with the current one marked.

```html
<div class="sec">
  <div class="band">01</div>
  <div class="tx">
    <div class="p">Part 1</div>
    <h1>How a model writes the next token</h1>
    <p>What one forward pass does, which numbers it reads, and how much maths it costs.</p>
    <div class="steps">
      <div class="on">The next token</div><div>Keys and values</div><div>Inside a GPU</div>
    </div>
  </div>
</div>
```

```css
.sec { position: absolute; inset: 0; display: grid; grid-template-columns: 420px 1fr; }
.sec .band { background: var(--indigo); color: #fff; display: flex; align-items: flex-end; padding: 48px; font-size: 220px; font-weight: 800; letter-spacing: -.06em; line-height: .8; }
.sec .tx { padding: 0 64px; display: flex; flex-direction: column; justify-content: center; }
.sec .tx .p { font-size: 16px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--indigo); }
.sec .tx h1 { margin: 12px 0 0; font-size: 54px; line-height: 1.05; font-weight: 800; letter-spacing: -.03em; }
.sec .tx p { margin-top: 18px; font-size: 20px; line-height: 1.45; color: var(--ink2); max-width: 520px; }
.sec .steps { margin-top: 36px; display: flex; flex-direction: column; gap: 8px; font-size: 15px; color: var(--mute); font-weight: 600; }
.sec .steps .on { color: var(--ink); }
.sec .steps .on::before { content: "→ "; color: var(--indigo); }
```

**Other recurring blocks** in the deck (all plain HTML plus CSS, no figures):

- Big-number callouts (`.stats` / `.stat.indigo`): a row of `--wash` cards, each a 30 px number and a one-line label.
- Agenda cards (`.agenda`): white cards with a numbered indigo square, a title and one line, plus a small inline SVG icon.
- Summary table ("Today in one slide", `.d-map`): rows of idea, number (coloured), why it matters (pill).
- Closing slide (`.d-next`): the title-slide layout reused for "next lecture", three items with coloured left borders.
- Comparison grids (`.cmp`, `.cdiff`): CSS grid with a `--wash` header row and the highlighted columns in `#f5f7ff`.

All of these are in the starter (section 7) or in `slides/lecture-0/style.css` and `styles/*.css`.

### Footer and slide number (`global-bottom.vue`)

A footer with the lecture name on the left and the slide number on the right, hidden on slides that set
`hideFooter: true` in their frontmatter (welcome, about, title). The same file pauses CSS animations 15 seconds
after the last click (see section 6). The full file is in the starter.

### Fill the screen width (`setup/main.ts`)

Slidev letterboxes a fixed aspect ratio. Lecture 0 overrides it so the canvas follows the window (clamped between
1.5 and 2.0), which means no side bars on a laptop or a projector. It also reloads the page once if a tab is open
during a redeploy. The full file is in the starter. Because the aspect changes, every layout must survive both
16:10 and wider windows (see the QA checklist).

---

## 3. Animations

Three kinds of motion, all cheap:

1. **Click reveals** of HTML blocks (`v-click`).
2. **Click builds inside a figure**, driven by the click counter `$clicks` in the Vue component.
3. **Calm looping motion** inside figures (dots flowing along a line, tokens appearing), pure CSS.

There are no slide transitions in Lecture 0 (none set, so slides change instantly), no `v-mark`, and no `v-clicks`
lists. Every reveal is an explicit numbered `v-click`.

### 3.1 Numbered `v-click` and the `clicks:` frontmatter

Each slide declares its total number of clicks, and each element says which click shows it. Elements appear one per
click, in reading order.

```html
---
layout: full
title: "Running example"
clicks: 4
---
<div class="s">
  <div class="kick amber">our running example</div>
  <h2 class="hd">One model on one GPU. <em>Every number today</em> comes from this setup</h2>
  <div class="stats">
    <div v-click="1" class="stat indigo"><b>128 KiB</b><span>of KV cache per token</span></div>
    <div v-click="2" class="stat indigo"><b>~320 MB</b><span>of KV cache per chat</span></div>
    <div v-click="3" class="stat teal"><b>~52 GB</b><span>left after the weights</span></div>
    <div v-click="4" class="stat rose"><b>4.8 ms</b><span>to read the weights once</span></div>
  </div>
</div>
```

Several elements can share a number to appear together (a whole table row: `v-click="5"` on each cell). A range
`v-click="[1, 3]"` shows an element from click 1 and hides it again at click 3.

### 3.2 Builds inside an SVG figure: `$clicks`

Figures read the slide's click counter and toggle classes. The pattern used by every figure in the deck:

```vue
<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
const { $clicks } = useSlideContext()
const s = (n: number) => $clicks.value >= n   // "has click n happened?"
</script>

<template>
  <svg class="fx" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
    <g :class="s(1) ? 'show' : 'hide'"> ... step 1 ... </g>
    <g :class="s(2) ? 'show' : 'hide'"> ... step 2 ... </g>
  </svg>
</template>
```

with these shared classes in `style.css`:

```css
.fx .dim  { opacity: .18; transition: opacity .35s; }
.fx .show { opacity: 1;   transition: opacity .35s; }
.fx .hide { opacity: 0;   transition: opacity .35s; }
```

Variations used in the deck:

- Highlight the current step and keep earlier ones as context: `ck === i + 1 ? '#4f46e5' : ck > i + 1 ? '#e0e7ff' : '#fff'`.
- Fade things that are finished with: `:class="ck > t.last ? 'dim' : 'show'"` (an activation fades once it is freed).
- Move something on a click with a CSS transition: a gauge needle `:style="{ transform: `rotate(${s(1) ? 30 : 60}deg)` }"`
  with `.needle { transition: transform .9s ease-in-out; }`.

The slide's `clicks:` must equal the last step number the figure uses, or the last steps are unreachable.

### 3.3 Merged slides: two slides in one, with a click offset

To keep the slide count down, Lecture 0 merges pairs of slides into one: the first half is visible until click
`k`, then the second half replaces it. The second half's figure gets an `:off` prop so its own steps start at 1.

```html
---
layout: full
title: "Weights and activations"
clicks: 11
---
<div class="s" v-click-hide="4">
  <div class="kick teal">weights and activations</div>
  <h2 class="hd">Weights are <em>huge and fixed</em>; the activations for one token are <em>tiny</em></h2>
  <div class="fig"><ZWeightsActs /></div>          <!-- uses clicks 1 to 3 -->
</div>
<div class="s" v-click="4">
  <div class="kick amber">what are activations?</div>
  <h2 class="hd">One layer, one GPU program at a time: <em>every result goes back to VRAM</em></h2>
  <div class="fig"><ZActLanes :off="4" /></div>     <!-- its steps 1 to 7 are slide clicks 5 to 11 -->
</div>
```

Inside the second figure:

```ts
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
const { $clicks } = useSlideContext()
// off: clicks spent by the first half of the merged slide
const props = withDefaults(defineProps<{ off?: number }>(), { off: 0 })
const ck = computed(() => $clicks.value - props.off)
const s = (n: number) => ck.value >= n
```

Both `.s` blocks are `position: absolute; inset: 0`, so they stack exactly on top of each other.

### 3.4 Looping motion: dots that ride a line

Used on the title slide (weights streaming from memory into the chip), the closing slide (a request moving through
three boxes) and a few figures (a dashed "feed back in" arrow). Rules: the moving element uses `offset-path` with the
exact path data of the drawn line, it is drawn after the line and before the boxes (so it rides on the line and
passes under the boxes), and only `offset-distance`, `opacity`, `transform` or `stroke-dashoffset` are animated.

From `ZTitleChip.vue`:

```vue
<template>
  <svg class="fx zt" viewBox="0 0 490 620">
    <!-- lines first, then the dots that ride them, then the boxes on top -->
    <path v-for="(d, i) in paths" :key="'p' + i" :d="d" fill="none" stroke="#a5b4fc" stroke-width="2"/>
    <circle v-for="(o, i) in dots" :key="'d' + i" r="3.6" fill="#4f46e5" class="zt-dot"
      :style="{ offsetPath: `path('${o.d}')`, animationDelay: `${o.delay}s` }"/>
    <!-- boxes ... -->
  </svg>
</template>

<style scoped>
.zt-dot { opacity: 0; animation: zt-flow 2.2s linear infinite; }
@keyframes zt-flow {
  0%   { offset-distance: 0%;   opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0; }
}
</style>
```

Negative `animation-delay` values spread the dots along the line from the first frame instead of all starting together.

A marching dashed arrow (from `ANextToken.vue`):

```html
<path d="M 950 145 C 990 100, 900 58, 600 58" fill="none" stroke="#4f46e5" stroke-width="3"
      stroke-dasharray="7 6" marker-end="url(#nt-ai)" class="flow"/>
```
```css
.flow { animation: ntflow 1s linear infinite; }
@keyframes ntflow { to { stroke-dashoffset: -26; } }   /* -26 = 2 × (7 + 6), one seamless loop */
```

Items appearing in sequence on a loop (tokens being written, KV blocks filling), one keyframe per item:

```css
.zt-tk { opacity: 0; animation-duration: 7.5s; animation-iteration-count: infinite; animation-timing-function: ease-out; }
.zt-k0 { animation-name: zt-a0; } .zt-k1 { animation-name: zt-a1; }
@keyframes zt-a0 { 0%, 6%  { opacity: 0; } 10%, 90% { opacity: 1; } 96%, 100% { opacity: 0; } }
@keyframes zt-a1 { 0%, 20% { opacity: 0; } 24%, 90% { opacity: 1; } 96%, 100% { opacity: 0; } }
```

Keep looping motion calm and only where it shows the idea (data flowing, tokens appearing). No flashing.

---

## 4. Figures

### How Lecture 0's figures were made

Every figure in Lecture 0 is **hand-written inline SVG inside a Vue component** (about 40 components in
`slides/lecture-0/components/`, named `Z*.vue`, `A*.vue`, `Fig*.vue`). There are no generated images in the deck:
`public/` holds only the logo, the instructor photo, three institution logos and a book cover for the About slide.

The conventions:

- `viewBox="0 0 1000 400"` for content figures (it fills the `.fig` area under a headline), `class="fx"` on the `<svg>` so the shared text classes apply.
- Text uses the deck font through `.fx text { font-family: "Plus Jakarta Sans" }` and the classes `t-lbl`, `t-sm`, `t-xs` (caps labels), `t-big`, `t-huge`, `t-w` (white).
- Solid fills from the palette, rounded corners (`rx` 8 to 20), soft drop shadows on the main object only:
  `<filter id="sh"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0f172a" flood-opacity=".16"/></filter>`.
  Use filters on static elements only, never on animated ones.
- Arrow heads via `<marker>`; grey `#94a3b8` for plain flow, indigo for the highlighted path.
- Positions are computed in the `<script setup>` from small arrays (`words`, `layers`, `progs`) so repeated items line up.
- Real numbers in a worked example are computed by a script and written to `setup/attnData.ts` ("generated, do not edit by hand"), so the figure never shows a hand-typed wrong value.
- Definitions appear inside the figure as a soft card on the last click (for example a pale amber card titled "Token" with a one-line definition).
- About 600 SVG elements per slide at most.

The style memo calls this "solid colours with soft shadows, no pastel outlined boxes": filled shapes, not thin
outlines on pastel backgrounds.

### Tools and skills: what was used and what was not

Checked against the deck folder (component files, `public/`, notes):

| Tool or skill | Used for Lecture 0? | Evidence |
|---|---|---|
| Slidev 51 + Vue 3 SFCs with inline SVG | **Yes**, every figure | `components/*.vue` |
| CSS keyframes, `offset-path` | **Yes** | `ZTitleChip.vue`, `ZNextArt.vue`, `ANextToken.vue` |
| Python script for worked-example numbers | **Yes** | `setup/attnData.ts` header |
| Playwright (screenshots, overflow scan, RAM measurement) | **Yes**, for QA | small Playwright scripts (the RAM one is in section 6) |
| Vercel CLI | **Yes**, deploy | `dist/.vercel/project.json` |
| PaperBanana (`paperbanana:paperbanana` plugin skill, Gemini image model) | **No** | no generated PNGs in the deck; used in the instructor's earlier, image-based decks |
| `annotate.py` + rough.js + Virgil font (hybrid hand-drawn notes) | **No** | no Virgil or rough.js in the deck; used in earlier decks |
| `StepFigure.vue` (masks over a PNG revealed per click) | **No** | only for image-based decks |
| `excalidraw-concept-thumbnails` skill | **No** | for course thumbnails, not slides |
| `animate-image-flow` skill | **No** | makes GIFs from PNG diagrams; the deck animates SVG directly |
| `paper-figures` skill | **No** | matplotlib paper figures |
| KaTeX maths | **No** in Lecture 0 | formulas are written as HTML (fraction built with two stacked spans); KaTeX is still the rule if you need real maths |

### If you want generated figures instead

The older vLLM lightning decks used a different, image-based pipeline. It is a valid option if you cannot write SVG:

1. Generate a clean diagram with an image model (PaperBanana was used, with an Excalidraw-pastel style prompt:
   fills `#A5D8FF/#1971C2`, `#B2F2BB/#2F9E44`, `#FFEC99/#F08C00`, `#FFC9C9/#E03131`, `#D0BFFF`), leaving annotation text out.
2. Add a few hand-written notes and hand-drawn underlines or arrows on top (the course used a small script with the
   Virgil font and rough.js; Excalidraw itself can do this by hand).
3. Whiten the background, then reveal the image step by step with masks that fade out per click (`StepFigure.vue` pattern:
   absolutely positioned white boxes over the image, each with `opacity: 0` once `$clicks >= at`).

Check every generated figure for wrong arrows and wrong labels; image models get these wrong often.

### Approximating the SVG style without writing much code

- Draw the figure in Figma, Inkscape or Excalidraw on a 1000 by 400 frame using the palette above, export as SVG, paste it into a component's `<template>`, and wrap each build step in `<g :class="s(n) ? 'show' : 'hide'">`.
- Ask a coding agent to write the component: give it the viewBox, the palette, the class names and a list of what appears on each click. This is how most of Lecture 0's figures were produced.

---

## 5. Writing rules for the content

These are the rules the course instructor applies to every deck. They work for any technical topic.

1. **One idea per slide.** A kicker, one headline sentence that states the point, one figure. Slightly smaller text with more white space beats large text filling the slide.
2. **Define every term in plain words where it first appears**, on the slide (a small definition card on the last click) or in the speaker notes. Never use one word for two different things.
3. **Show the arithmetic behind every number.** "16 GB" comes with "8 billion weights × 2 bytes". Write derivations in the notes and the key line on the slide.
4. **No code on slides.** No code excerpts, no function or class names, no file paths, no monospace identifiers. Explain with figures and plain words. Code names, if needed at all, go in the speaker notes.
5. **No analogies or metaphors** in titles, labels or notes ("hidden tax", "highway", "kitchen"). Name the thing plainly: "CPU time per step", not "the hidden tax".
6. **White background, light theme only.** No dark slides, no automatic dark mode (`colorSchema: light`).
7. **One plain sans-serif.** No decorative, condensed or serif display fonts, no italics. Typeset real maths with KaTeX rather than hand-built fractions with slashes.
8. **Multiple elements appear one per click, in reading order.** Complex figures always build step by step, never all at once.
9. **When you zoom into part of an overview**, show the overview with that part highlighted so the audience knows where they are.
10. **No dates or times on slides** (they go stale). Label lectures "Lecture 3", never "Lecture 3 of 12".
11. **Speaker notes carry the script.** Every slide in Lecture 0 has a full paragraph in `<!-- -->` that walks through each click ("Click: ..."), defines terms and gives sources. The presenter can teach from the notes alone.
12. **One running example** reused for every number in the lecture (Lecture 0 uses one model on one GPU and one chat throughout).
13. **Do not reuse figures from other talks** in a lecture deck; make new ones.

---

## 6. Performance and self-QA

### Low RAM (the presenter runs a video call and the deck on one laptop)

- `defaults: preload: false` in the headmatter: only the slide on screen is mounted.
- Turn off what a lecture does not need: `monaco: false`, `record: false`, `browserExporter: false`, `contextMenu: false`, `drawings: enabled: false`.
- Figure animations use only `transform`, `opacity`, `offset-distance` and `stroke-dashoffset`, in CSS. No JS timers, no `requestAnimationFrame`, no animated filters or blurs.
- About 600 SVG elements per slide at most. Small images (compress photos).
- Pause all animations 15 s after the last slide change or click (in `global-bottom.vue`):

```ts
const ANIMATE_MS = 15000
function wake() {
  document.documentElement.classList.remove('anim-idle')
  clearTimeout(timer)
  timer = setTimeout(() => document.documentElement.classList.add('anim-idle'), ANIMATE_MS)
}
watch([currentPage, clicks], wake, { immediate: true })
```
```css
.anim-idle .slidev-page *, .anim-idle .slidev-page *::before, .anim-idle .slidev-page *::after { animation-play-state: paused !important; }
```

- Measure: open the deck in Playwright, step through every click, and read mounted slides, DOM nodes, JS heap and
  renderer memory. Compare with a blank Chrome tab. The course's script, condensed:

```js
// node deckmem.cjs   (PW = path to playwright, URL = deck URL)
const { chromium } = require(process.env.PW || 'playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const cdp = await p.context().newCDPSession(p); await cdp.send('Performance.enable');
  const report = async (tag) => {
    const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
    const mounted = await p.evaluate(() => document.querySelectorAll('#slideshow .slidev-page').length);
    console.log(`${tag}: mounted slides ${mounted}, DOM nodes ${m.Nodes}, JS heap ${Math.round(m.JSHeapUsedSize / 1e6)} MB`);
  };
  await p.goto(process.env.URL + '#/1', { waitUntil: 'networkidle' }); await p.waitForTimeout(5000);
  await report('slide 1');
  for (let i = 0; i < 120; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(120); }
  await p.waitForTimeout(2000); await report('after 120 clicks');
  await b.close();
})();
```

  "Mounted slides" should stay at 1 or 2 with `preload: false`.

### Self-QA checklist (run before you present or share)

- [ ] Every slide at its final click (`#/N?clicks=99`) screenshotted at 16:9 (1440 × 810) and 16:10 (1440 × 900), and checked by eye.
- [ ] Overflow scan: no element whose `scrollHeight` exceeds its `clientHeight`, nothing past the slide edge (a Playwright loop over all slides).
- [ ] Every click stepped through once: each element appears on its own click, in reading order, and `clicks:` matches the last step.
- [ ] Moving dots sit exactly on their drawn line (same path data in `offset-path`), above the line and below the boxes and labels.
- [ ] Text never overflows a card or box, including in SVG (SVG text does not wrap; split long labels into two `<text>` lines).
- [ ] No class names that are also UnoCSS utilities (`h1`, `h2`, `p4`, `pt`, `w4`, `m2` ...): Slidev turns them into height or padding rules and clips your cards. Use names like `.hd`, `.kick`, `.d-map`.
- [ ] The "go to slide" list is hidden (`.fixed.-top-20 .autocomplete-list { display: none; }`).
- [ ] No code, no analogies, no dates, no "Lecture N of M", every term defined, every number derived.
- [ ] Looks right with the OS in dark mode (it should stay white).
- [ ] RAM check done; animations pause when idle.
- [ ] After deploy, open the live URL in a fresh tab and click through the first few slides.

---

## 7. Starter template

A complete small deck: title slide, section slide, a content slide whose figure builds in three steps with a
looping dot, a merged slide with a click offset, a summary slide and a closing slide. Replace the topic text, the
figure contents and the logo. The example topic is "How a CPU cache works".

Files:

```text
my-lecture/
  package.json          (section 1)
  slides.md
  style.css
  global-bottom.vue
  setup/main.ts
  components/FigPipeline.vue
  components/TitleArt.vue
  public/logo.svg       (any square SVG)
```

### `slides.md`

```md
---
theme: default
title: "How a CPU cache works"
fonts:
  sans: Plus Jakarta Sans
  mono: JetBrains Mono
  weights: "400,500,600,700,800"
  italic: false
aspectRatio: 16/9
canvasWidth: 1180
routerMode: hash
colorSchema: light
favicon: /logo.svg
layout: full
defaults:
  preload: false
monaco: false
record: false
browserExporter: false
contextMenu: false
drawings:
  enabled: false
hideFooter: true
---
<div class="ttl">
  <div class="l">
    <img class="logo" src="/logo.svg" alt="" />
    <div class="lec">Lecture 1</div>
    <h1>How a CPU<br /><span>cache works</span></h1>
    <p class="sub">Why reading the same data twice can be a hundred times faster the second time.</p>
    <div class="meta"><div><b>Your Name</b>Your role, your organisation</div></div>
  </div>
  <div class="r"><div class="grid"></div><TitleArt /></div>
</div>

<!--
Welcome. Today we look at the small, fast memory that sits next to every CPU core, and why it decides how fast most programs run. The picture on the right: data flowing from main memory into the cache and on to the core.
-->
---
layout: full
title: "Part 1"
---
<div class="sec">
  <div class="band">01</div>
  <div class="tx">
    <div class="p">Part 1</div>
    <h1>Where the data comes from</h1>
    <p>The path a value takes from main memory to the core, and how long each hop takes.</p>
    <div class="steps">
      <div class="on">Where the data comes from</div><div>Hits and misses</div><div>Writing code that uses the cache</div>
    </div>
  </div>
</div>

<!--
Part 1. Before we can talk about speed we need the path a value travels.
-->
---
layout: full
title: "The memory path"
clicks: 4
---
<div class="s">
  <div class="kick">the memory path</div>
  <h2 class="hd">Every value the core uses travels <em>from memory, through the cache</em></h2>
  <div class="fig"><FigPipeline /></div>
</div>

<!--
Walk left to right, one box per click. Main memory (RAM) holds everything, about 16 GB on a laptop, and one read takes about 100 nanoseconds. Click: the cache, a small memory on the CPU chip, a few megabytes, about 1 nanosecond per read. Click: the core, which does the arithmetic. Click: the dot shows a value travelling along the path. Click: the definition. A cache is a small, fast copy of recently used data, kept close to the core.
-->
---
layout: full
title: "Hits and misses"
clicks: 6
---
<div class="s" v-click-hide="2">
  <div class="kick teal">hits and misses</div>
  <h2 class="hd">A read is either a <em>hit</em> or a <em>miss</em></h2>
  <div class="stats" style="margin-top: 28px">
    <div v-click="1" class="stat teal"><b>~1 ns</b><span>a hit: the value is already in the cache</span></div>
    <div v-click="1" class="stat rose"><b>~100 ns</b><span>a miss: the value must come from main memory</span></div>
  </div>
</div>
<div class="s" v-click="2">
  <div class="kick amber">one miss, step by step</div>
  <h2 class="hd">On a miss, the value makes <em>the whole trip</em> from memory</h2>
  <div class="fig"><FigPipeline :off="2" /></div>
</div>

<!--
Two outcomes for every read, both shown on click 1. A hit costs about 1 nanosecond, a miss about 100: 100 times slower. Click: now the path again, built step by step with the figure from the previous slide; its four steps are clicks 3 to 6 of this slide.
-->
---
layout: full
title: "Today in one slide"
clicks: 3
---
<div class="s">
  <div class="kick">today in one slide</div>
  <h2 class="hd">Three ideas to <em>keep from today</em></h2>
  <div class="d-map">
    <div class="hdr"><span>The idea</span><span>The number</span><span>Why it matters</span></div>
    <div v-click="1" class="row"><span class="pb">Every value passes through the cache</span><b class="fx1 i">a few MB</b><i class="w i">Small, so it cannot hold everything</i></div>
    <div v-click="2" class="row"><span class="pb">A miss is far slower than a hit</span><b class="fx1 r">~100×</b><i class="w r">Misses dominate run time</i></div>
    <div v-click="3" class="row"><span class="pb">Neighbours come along on a miss</span><b class="fx1 t">64 bytes</b><i class="w t">Reading in order is fast</i></div>
  </div>
</div>

<!--
The three ideas, one per click.
-->
---
layout: full
title: "Next lecture"
clicks: 2
hideFooter: true
---
<div class="d-next">
  <div class="l">
    <div class="kick">next lecture</div>
    <div class="lec">Lecture 2</div>
    <h1>Cache-friendly<br /><span>code</span></h1>
    <div class="items">
      <div v-click="1"><b>Reading in order</b>Why walking an array row by row beats column by column.</div>
      <div v-click="2"><b>Measuring misses</b>How to count cache misses on your own machine.</div>
    </div>
  </div>
  <div class="r"><div class="grid"></div><div class="art"><TitleArt /></div></div>
</div>

<!--
Point forward to the next lecture, one item per click.
-->
```

### `style.css`

```css
:root {
  --ink: #0f172a; --ink2: #475569; --mute: #94a3b8; --line: #e2e8f0; --wash: #f6f7fb;
  --indigo: #4f46e5; --indigo-l: #e0e7ff;
  --teal: #0d9488; --teal-l: #ccfbf1;
  --amber: #f59e0b; --amber-l: #fef3c7;
  --rose: #e11d48; --rose-l: #ffe4e6;
  color-scheme: light;
}

/* keep: hides Slidev's closed slide list, which otherwise leaks slide titles onto every slide */
.fixed.-top-20 .autocomplete-list { display: none; }

.slidev-layout { background: #fff !important; color: var(--ink); font-family: "Plus Jakarta Sans", Inter, sans-serif; padding: 0 !important; }

/* content slide */
.s { position: absolute; inset: 0; padding: 40px 56px 44px; display: flex; flex-direction: column; }
.kick { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--indigo); }
.kick::before { content: ""; width: 22px; height: 6px; border-radius: 3px; background: currentColor; }
.kick.teal { color: var(--teal); } .kick.rose { color: var(--rose); } .kick.amber { color: #b45309; }
h2.hd { margin: 10px 0 0; font-size: 33px; line-height: 1.15; font-weight: 800; letter-spacing: -.02em; color: var(--ink); max-width: 900px; }
h2.hd em { font-style: normal; color: var(--indigo); }
.s > * { flex-shrink: 0; }
.s > .fig { flex-shrink: 1; }
.fig { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 0; margin-top: 8px; }
.fig svg { width: 100%; height: 100%; }

/* big numbers */
.stats { display: flex; gap: 14px; }
.stat { flex: 1; background: var(--wash); border-radius: 16px; padding: 14px 18px; }
.stat b { display: block; font-size: 30px; font-weight: 800; letter-spacing: -.02em; line-height: 1.05; }
.stat span { font-size: 14px; color: var(--ink2); line-height: 1.35; }
.stat.indigo b { color: var(--indigo); } .stat.teal b { color: var(--teal); } .stat.rose b { color: var(--rose); } .stat.amber b { color: #b45309; }

/* footer */
.footer2 { position: absolute; left: 56px; right: 56px; bottom: 16px; display: flex; justify-content: space-between; font-size: 11px; color: var(--mute); font-weight: 600; letter-spacing: .02em; }

/* title slide */
.ttl { position: absolute; inset: 0; display: grid; grid-template-columns: 1.25fr 1fr; }
.ttl .l { padding: 56px 0 48px 64px; display: flex; flex-direction: column; }
.ttl .logo { width: 56px; height: 56px; }
.ttl .lec { margin-top: auto; font-size: 18px; font-weight: 700; color: var(--indigo); }
.ttl h1 { margin: 8px 0 0; font-size: 54px; line-height: 1.02; font-weight: 800; letter-spacing: -.035em; color: var(--ink); }
.ttl h1 span { color: var(--indigo); }
.ttl .sub { margin-top: 18px; font-size: 19px; line-height: 1.4; color: var(--ink2); max-width: 520px; }
.ttl .meta { margin-top: auto; display: flex; gap: 28px; font-size: 14px; color: var(--ink2); }
.ttl .meta b { display: block; color: var(--ink); font-size: 15px; }
.ttl .r, .d-next .r { position: relative; overflow: hidden; background: linear-gradient(160deg, #eef2ff 0%, #e0e7ff 45%, #ccfbf1 100%); border-radius: 0 0 0 48px; }
.ttl .r .grid, .d-next .r .grid { position: absolute; inset: 0; background-image: linear-gradient(#4f46e512 1px, transparent 1px), linear-gradient(90deg, #4f46e512 1px, transparent 1px); background-size: 28px 28px; }
.ttl .r svg { position: absolute; inset: 40px 28px; width: calc(100% - 56px); height: calc(100% - 80px); }

/* section divider */
.sec { position: absolute; inset: 0; display: grid; grid-template-columns: 420px 1fr; }
.sec .band { background: var(--indigo); color: #fff; display: flex; align-items: flex-end; padding: 48px; font-size: 220px; font-weight: 800; letter-spacing: -.06em; line-height: .8; }
.sec .tx { padding: 0 64px; display: flex; flex-direction: column; justify-content: center; }
.sec .tx .p { font-size: 16px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--indigo); }
.sec .tx h1 { margin: 12px 0 0; font-size: 54px; line-height: 1.05; font-weight: 800; letter-spacing: -.03em; }
.sec .tx p { margin-top: 18px; font-size: 20px; line-height: 1.45; color: var(--ink2); max-width: 520px; }
.sec .steps { margin-top: 36px; display: flex; flex-direction: column; gap: 8px; font-size: 15px; color: var(--mute); font-weight: 600; }
.sec .steps .on { color: var(--ink); }
.sec .steps .on::before { content: "→ "; color: var(--indigo); }

/* figure text classes, shared by every figure component */
.fx text { font-family: "Plus Jakarta Sans", Inter, sans-serif; }
.fx .t-lbl { font-size: 15px; font-weight: 700; fill: var(--ink); }
.fx .t-sm { font-size: 13px; font-weight: 500; fill: var(--ink2); }
.fx .t-xs { font-size: 11px; font-weight: 600; fill: var(--mute); letter-spacing: .04em; }
.fx .t-big { font-size: 34px; font-weight: 800; letter-spacing: -.02em; fill: var(--ink); }
.fx .t-w { fill: #fff; }
.fx .dim { opacity: .18; transition: opacity .35s; }
.fx .show { opacity: 1; transition: opacity .35s; }
.fx .hide { opacity: 0; transition: opacity .35s; }

/* summary table */
.d-map { margin-top: 16px; display: flex; flex-direction: column; gap: 7px; }
.d-map .hdr, .d-map .row { display: grid; grid-template-columns: 1.35fr 1.05fr .95fr; gap: 14px; align-items: center; }
.d-map .hdr { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--mute); padding: 0 16px; }
.d-map .row { background: var(--wash); border-radius: 14px; padding: 9px 16px; font-size: 15.5px; line-height: 1.3; }
.d-map .pb { color: var(--ink); font-weight: 500; }
.d-map .fx1 { font-weight: 800; letter-spacing: -.01em; }
.d-map .fx1::before { content: "→ "; color: var(--mute); font-weight: 600; }
.d-map .w { font-style: normal; font-weight: 700; font-size: 14px; justify-self: start; padding: 5px 12px; border-radius: 999px; }
.d-map .fx1.i { color: var(--indigo); } .d-map .w.i { background: var(--indigo-l); color: #3730a3; }
.d-map .fx1.t { color: var(--teal); } .d-map .w.t { background: var(--teal-l); color: #115e59; }
.d-map .fx1.r { color: var(--rose); } .d-map .w.r { background: var(--rose-l); color: #9f1239; }

/* closing slide */
.d-next { position: absolute; inset: 0; display: grid; grid-template-columns: 1.3fr 1fr; }
.d-next .l { padding: 48px 0 44px 64px; display: flex; flex-direction: column; }
.d-next .lec { margin-top: 22px; font-size: 18px; font-weight: 700; color: var(--indigo); }
.d-next h1 { margin: 6px 0 0; font-size: 52px; line-height: 1.03; font-weight: 800; letter-spacing: -.035em; color: var(--ink); }
.d-next h1 span { color: var(--indigo); }
.d-next .items { margin-top: 22px; display: flex; flex-direction: column; gap: 10px; padding-right: 36px; }
.d-next .items div { font-size: 14.5px; line-height: 1.4; color: var(--ink2); padding-left: 14px; border-left: 4px solid var(--indigo); }
.d-next .items div:nth-child(2) { border-color: var(--teal); }
.d-next .items div:nth-child(3) { border-color: var(--amber); }
.d-next .items b { display: block; font-size: 16px; color: var(--ink); }
.d-next .r .art { position: absolute; inset: 60px 28px 50px; }
.d-next .r .art svg { width: 100%; height: 100%; }
```

### `components/FigPipeline.vue` (a figure with step reveals, a looping dot and an `off` prop)

```vue
<script setup lang="ts">
// Memory → cache → core, one box per click, then a value travels along the path, then a definition card.
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
const { $clicks } = useSlideContext()
// off: clicks used by an earlier half of a merged slide (0 when the figure has the slide to itself)
const props = withDefaults(defineProps<{ off?: number }>(), { off: 0 })
const ck = computed(() => $clicks.value - props.off)
const s = (n: number) => ck.value >= n

const boxes = [
  { at: 0, x: 60,  title: 'Main memory', sub: '16 GB · ~100 ns a read', fill: '#e0e7ff', ink: '#3730a3' },
  { at: 1, x: 400, title: 'Cache',       sub: 'a few MB · ~1 ns a read', fill: '#ccfbf1', ink: '#115e59' },
  { at: 2, x: 740, title: 'Core',        sub: 'does the arithmetic',     fill: '#0f172a', ink: '#ffffff' },
]
const BW = 200, BY = 110, BH = 96
// one path for both the drawn line and the moving dot, so the dot always sits on the line
const track = `M ${60 + BW} ${BY + BH / 2} L ${740} ${BY + BH / 2}`
</script>

<template>
  <svg class="fx" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="fp-sh" x="-20%" y="-30%" width="140%" height="170%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0f172a" flood-opacity=".16"/>
      </filter>
    </defs>

    <!-- order: line, then the dot that rides it, then the boxes on top -->
    <path :d="track" :class="s(1) ? 'show' : 'hide'" stroke="#a5b4fc" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round" fill="none"/>
    <circle v-if="s(3)" r="7" fill="#4f46e5" class="fp-dot" :style="{ offsetPath: `path('${track}')` }"/>

    <g v-for="b in boxes" :key="b.title" :class="s(b.at) ? 'show' : 'hide'">
      <g filter="url(#fp-sh)"><rect :x="b.x" :y="BY" :width="BW" :height="BH" rx="18" :fill="b.fill"/></g>
      <text :x="b.x + BW / 2" :y="BY + 44" text-anchor="middle" class="t-lbl" :style="{ fill: b.ink, fontSize: '19px' }">{{ b.title }}</text>
      <text :x="b.x + BW / 2" :y="BY + 68" text-anchor="middle" class="t-sm" :style="{ fill: b.at === 2 ? '#c7d2fe' : '#475569' }">{{ b.sub }}</text>
    </g>

    <!-- definition card on the last click -->
    <g :class="s(4) ? 'show' : 'hide'">
      <rect x="60" y="270" width="880" height="84" rx="16" fill="#fffbeb"/>
      <text x="84" y="302" class="t-lbl" style="fill:#b45309">Cache</text>
      <text x="84" y="328" class="t-sm">A small, fast copy of recently used data, kept on the CPU chip next to the core.</text>
    </g>
  </svg>
</template>

<style scoped>
.fp-dot { animation: fp-flow 2.4s linear infinite; }
@keyframes fp-flow {
  0%   { offset-distance: 0%;   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0; }
}
</style>
```

On "The memory path" slide (`clicks: 4`) it builds: memory at the start, cache on click 1, core on click 2, the dot
on click 3, the definition on click 4. On the merged "Hits and misses" slide it gets `:off="2"`, so its four steps run on
slide clicks 3 to 6, and that slide declares `clicks: 6` (2 for the first half + 4 for the figure).

### `components/TitleArt.vue` (calm looping art for the title and closing slides)

```vue
<script setup lang="ts">
// Three stacked boxes with a value flowing down through them, on a loop.
const boxes = [
  { y: 60,  t: 'Main memory', c: '#4f46e5' },
  { y: 200, t: 'Cache',       c: '#0d9488' },
  { y: 340, t: 'Core',        c: '#0f172a' },
]
const track = 'M 200 90 L 200 370'
</script>

<template>
  <svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg">
    <path :d="track" stroke="#a5b4fc" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round" fill="none"/>
    <circle r="6" fill="#4f46e5" class="ta-dot"/>
    <g v-for="b in boxes" :key="b.t">
      <rect x="70" :y="b.y" width="260" height="60" rx="16" :fill="b.c"/>
      <text x="200" :y="b.y + 36" text-anchor="middle" class="ta-t">{{ b.t }}</text>
    </g>
  </svg>
</template>

<style scoped>
.ta-t { font-family: "Plus Jakarta Sans", sans-serif; font-size: 17px; font-weight: 800; fill: #fff; }
/* the dot rides the dotted track and passes behind the boxes */
.ta-dot { offset-path: path('M 200 90 L 200 370'); offset-rotate: 0deg; animation: ta-flow 3s linear infinite; }
@keyframes ta-flow { to { offset-distance: 100%; } }
</style>
```

### `global-bottom.vue`

```vue
<script setup lang="ts">
// Figure animations play for a while after each slide change or click, then pause so an idle slide costs no CPU.
import { watch, onBeforeUnmount, computed } from 'vue'
import { useNav } from '@slidev/client'

const ANIMATE_MS = 15000
const { currentPage, clicks, currentSlideRoute } = useNav()
// Slides with `hideFooter: true` in their frontmatter show no footer.
const showFooter = computed(() => !currentSlideRoute.value?.meta?.slide?.frontmatter?.hideFooter)
let timer: ReturnType<typeof setTimeout> | undefined

function wake() {
  document.documentElement.classList.remove('anim-idle')
  clearTimeout(timer)
  timer = setTimeout(() => document.documentElement.classList.add('anim-idle'), ANIMATE_MS)
}

watch([currentPage, clicks], wake, { immediate: true })
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="footer2" v-if="showFooter">
    <span>Lecture 1 · How a CPU cache works</span>
    <span>{{ currentPage }}</span>
  </div>
</template>

<style>
.anim-idle .slidev-page *, .anim-idle .slidev-page *::before, .anim-idle .slidev-page *::after { animation-play-state: paused !important; }
</style>
```

Note: the headmatter's `hideFooter: true` applies to the first slide only; add `hideFooter: true` to any other
slide that should have no footer.

### `setup/main.ts`

```ts
// Fit the slide canvas to the window so the deck fills the full screen width (no side bars).
// Slidev reads configs.aspectRatio inside computed(); a getter backed by a ref makes it follow window resizes.
import { defineAppSetup } from '@slidev/types'
import configs from '#slidev/configs'
import { ref } from 'vue'

const MIN_ASPECT = 1.5 // narrower windows letterbox instead of stretching the layouts too tall
const MAX_ASPECT = 2.0 // ultra-wide windows letterbox instead of squashing the layouts

const clamp = (v: number) => Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, v))
const windowAspect = () => clamp(window.innerWidth / Math.max(1, window.innerHeight))

// After a redeploy, an open tab still asks for the previous build's files, which no longer exist.
// Reload once to pick up the new build; the hash URL keeps the current slide and click.
const RELOAD_KEY = 'deck-chunk-reload-at'
const RELOAD_GAP_MS = 10000 // never reload more than once in 10 s, so a real outage cannot loop

function reloadForNewBuild() {
  let last = 0
  try { last = Number(sessionStorage.getItem(RELOAD_KEY) || 0) } catch {}
  if (Date.now() - last < RELOAD_GAP_MS) return false
  try { sessionStorage.setItem(RELOAD_KEY, String(Date.now())) } catch {}
  window.location.reload()
  return true
}

const isChunkError = (msg: string) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(msg)

export default defineAppSetup(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewBuild()) event.preventDefault()
  })
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.message ?? event.reason ?? '')
    if (isChunkError(msg) && reloadForNewBuild()) event.preventDefault()
  })
  const aspect = ref(windowAspect())
  Object.defineProperty(configs, 'aspectRatio', { get: () => aspect.value, configurable: true })
  window.addEventListener('resize', () => { aspect.value = windowAspect() }, { passive: true })
})
```

### Run it

```bash
mkdir my-lecture && cd my-lecture      # no spaces in the path
# create the files above, plus public/logo.svg
npm install
npx slidev --port 8781
```

Then open `http://localhost:8781`, press the right arrow to step through clicks, and press `p` for presenter
mode with the speaker notes.

---

## Files in this repository

- `starter/`: the template deck from section 7, ready to run (`cd starter && npm install && npm run dev`).
- `reference-theme/`: the exact CSS, footer and canvas setup from the original Lecture 0 deck, for reference.
- `skills/slidev-lecture-deck/SKILL.md`: a skill file so a coding agent (Claude Code or similar) can build decks in this style for you.
- `docs/starter-preview.png`: what the starter deck looks like.

The original Lecture 0 slides and figures are not part of this repository.
