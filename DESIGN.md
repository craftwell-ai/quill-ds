# Quill — Design System Spec

A single-file reference for the **Quill** brand and its flagship app.
Everything an agent or developer needs to design on-brand: voice, color, type,
spacing, effects, components, iconography, and assets. Distilled from the live
token files and component sources in this project.

> **Brand in one line:** a naturalist's sketchbook — pressed cream digital paper,
> soft sepia ink, hand-drawn portraits, and a small cast of botanical pigments used
> sparingly. **No pure white, no pure black (Classic themes excepted — §3), no
> emoji, no decorative gradients.**

**Related files**
- `styles.css` — the single entry point consumers link (imports every token + font).
- `tokens/*.css` — the source of truth for all values below.
- `readme.md` — the long-form design guide (context, content & visual foundations).
- `design.shadcn.md` — this spec re-mapped onto shadcn/ui's variable contract.
- `components/**` — the React primitives (with `.d.ts` + `.prompt.md` each).
- `ui_kits/marketplace/` — a full interactive recreation of the marketplace app.

---

## 1. Brand & product context

**Quill** is the design system for digital products. The brand feels printed, collected, and kept. The voice is
that of a letterpress shop that sells apps — warm, unhurried, quietly confident.

Source of truth for all token values: `src/tokens/quill.tokens.mjs` — edit
there, then `npm run build:tokens` regenerates the CSS token blocks, the Figma
token JSON, and the generated exports.

---

## 2. Color

No true white or black in the brand themes — everything sits on digital paper.
The values below are **Dawn**, the default theme. Three **digital papers**
(grounds), three **inks** (text), four **pigments** (accents, used like a single
colored pencil on a graphite page). The Classic themes (§3) deliberately swap
this palette for pure neutrals.

### Digital papers — surfaces / grounds
| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F5EDDD` | base page — pressed cream |
| `--paper-warm` | `#EFE4CE` | cards, raised surfaces |
| `--paper-deep` | `#E8DCC0` | wells, insets, muted chips |

### Inks — text / strokes
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#2A2622` | primary text, near-black sepia |
| `--ink-soft` | `#5C524A` | secondary text, body at ease |
| `--ink-muted` | `#675F58` | captions, meta, disabled |

### Pigments — accents (each has a `-deep` press/hover shade)
| Token | Hex | Deep | Use |
|---|---|---|---|
| `--terracotta` | `#C4684B` | `#944A33` | **the signature** — the one italic word, CTAs, accent |
| `--moss` | `#7A8C5C` | `#5E6E43` | "signed" tier, success, growth |
| `--indigo` | `#5B6B8A` | `#44516D` | "featured" tier, links, info |
| `--gold` | `#B89968` | `#9A7D4E` | highlight, warning |

### Hairlines — ink at low alpha over digital paper
`--line-faint` (ink 8%) · `--line-soft` (12%) · `--line` (15%) · `--line-strong` (20%).
Borders are always ink-at-alpha, never a solid grey.

### Semantic aliases (reach for these in components)
- **Surfaces:** `--surface-page` (paper) · `--surface-card` (paper-warm) · `--surface-well` (paper-deep)
- **Text:** `--text-strong` (ink) · `--text-body` (ink-soft) · `--text-muted` (ink-muted) · `--text-on-ink` (paper) · `--text-accent` (terracotta)
- **Interactive:** `--accent` (terracotta) · `--accent-pressed` (terracotta-deep) · `--link` (indigo)
- **Borders:** `--border-card` (line-soft) · `--border-field` (line) · `--border-divider` (line-faint)
- **Feedback:** `--success` (moss-deep) · `--warning` (gold-deep) · `--danger` (terracotta-deep) · `--info` (indigo)

### Tier pigments (the collection ladder)
| Tier | Bg | Fg | Meaning |
|---|---|---|---|
| Everyday | `--paper-deep` | `--ink-soft` | free staples |
| Featured | indigo @22% | `--indigo-deep` | editor's picks, rotated |
| Signed | moss @22% | `--moss-deep` | attributed, dated, crafted |
| Heirloom | terracotta @16% | `--terracotta-deep` | limited, numbered |

---

## 3. Dusk — the dark theme

The sketchbook, closed at dusk and opened again under a desk lamp — hence the
name. **Dusk** is an added theme, not the default (**Dawn**) — grounds become
**dark walnut** (deep, warm, low-chroma browns, like oiled wood and aged leather)
and the sepia ink inverts to a warm **cream** that sits on the wood the way chalk
or gouache would. The warmth of Dawn is preserved, just turned down for the
evening. **Still no pure black, no pure white, no cold greys.** Source of truth:
`src/tokens/quill.tokens.mjs` (`npm run build:tokens` regenerates
`registry/themes/quill.css` and `src/app/globals.css`).

### Activation
Themes are **token remaps under `data-theme`** on a parent (usually `<html>`):
no attribute = **Dawn** (default), `data-theme="dark"` = **Dusk**, plus
`data-theme="classic-light"` / `data-theme="classic-dark"`. Set the attribute and
the whole token layer flips, **no JS required**. In apps, the `ThemeSelector`
block (`registry/blocks/theme-selector.tsx`) owns the attribute: after hydration
it reads the stored choice from `localStorage` (`quill-theme`, plus `quill-accent`
for the accent pigment) and stamps `<html>` — prerendered markup is always
Dawn/moss.

> **Implementation contract.** Values live once in a `--dk-*` set on `:root`
> (inert in Dawn — nothing reads them). A single `[data-theme="dark"]`
> selector remaps the real semantic tokens to them, so there is **one source of
> truth** per dark color and every component inherits Dusk for free — author
> against the semantic tokens (`--paper`, `--ink`, `--terracotta`…), never the
> `--dk-*` values directly. The Classic themes follow the same pattern with
> `--cl-*` / `--cd-*` sets.

### Walnut grounds — surfaces
| Token | Dawn | Dusk | Use |
|---|---|---|---|
| `--paper` | `#F5EDDD` | `#20180E` | base page — deep oiled walnut |
| `--paper-warm` | `#EFE4CE` | `#2A2014` | cards, raised surfaces |
| `--paper-deep` | `#E8DCC0` | `#352A1A` | wells, muted chips, image backdrops |

### Cream ink — text / strokes
| Token | Dawn | Dusk | Use |
|---|---|---|---|
| `--ink` | `#2A2622` | `#F1E7D3` | primary text — warm chalk cream |
| `--ink-soft` | `#5C524A` | `#C8B9A0` | secondary text, body at ease |
| `--ink-muted` | `#675F58` | `#A89880` | captions, meta, disabled |

### Lifted pigments
Brightened and slightly desaturated so they read like colored pencil on a dark
page instead of disappearing into it. **In Dusk, the `-deep` variant is the
*brighter* one** — it does the work of legible accent text on tinted fills,
feedback colors, and hover-lighten states, where a darker pressed tone would
vanish on walnut.

| Token | Dawn | Dusk | `-deep` (Dawn → Dusk) |
|---|---|---|---|
| `--terracotta` | `#C4684B` | `#DB8568` | `#944A33` → `#E89A80` |
| `--moss` | `#7A8C5C` | `#A2B57E` | `#5E6E43` → `#B6C896` |
| `--indigo` | `#5B6B8A` | `#92A2C2` | `#44516D` → `#AAB8D4` |
| `--gold` | `#B89968` | `#D6BA86` | `#9A7D4E` → `#E2CA9E` |

### Hairlines — warm cream at low alpha over walnut
`--line-faint` cream 7% · `--line-soft` 11% · `--line` 15% · `--line-strong` 22%.
Same principle as light (ink-at-alpha), inverted to cream-at-alpha.

### Tier tints (lifted pigment over walnut)
| Tier | Bg | Fg |
|---|---|---|
| Everyday | `--paper-deep` (`#352A1A`) | `--ink-soft` |
| Featured | indigo @18% | `--indigo-deep` (lifted) |
| Signed | moss @18% | `--moss-deep` (lifted) |
| Heirloom | terracotta @15% | `--terracotta-deep` (lifted) |

### Elevation — deeper, warmer near-black
Shadows rebuild on warm near-black `rgba(8,5,3,…)` at higher alpha than Dawn
(walnut needs more contrast to lift a surface): `--shadow-xs` 0.40 →
`--shadow-pop` up to 0.72, plus `--shadow-btn-hover`. Same layered, negative-spread
structure as light — never a hard black drop.

### Texture & focus
- **Grain inverts.** The Dawn `multiply` grain would vanish on walnut, so Dusk
  swaps `.paper-grain` to a **light fractal under `mix-blend-mode: screen`**
  (opacity ~0.22) — the tooth reads as a faint highlight instead of a shadow.
  `.paper-specks` drops to ~0.10.
- **Focus stays neutral:** `--focus-ring` cream 14% (never terracotta).
  `--focus-ring-danger` lifted-terracotta 22%. `--scrim` warm near-black 62%.
- `color-scheme: dark` is set so native form controls and scrollbars follow.

### Do / Don't (Dusk)
**Do** — author against semantic tokens so Dusk is free; trust the lifted `-deep`
pigments for accent text on tints; keep focus rings cream-neutral; let the screen-
blend grain carry the digital paper tooth. **Don't** — reference `--dk-*` directly
in components; reintroduce pure `#000`/`#FFF`; darken pigments for Dusk (they
lift); keep the multiply grain (it disappears).

### Classic themes — the sanctioned exception
`classic-light` and `classic-dark` trade the sketchbook palette for conventional
neutrals: pure `#FFFFFF` / `#000000` grounds, neutral greys, and no digital paper
grain (both texture overlays are disabled). Use them where the brand look isn't
wanted; the no-pure-white/black rule applies only to Dawn & Dusk. Values live in
the `--cl-*` / `--cd-*` sets.

---

## 4. Typography

Two voices. **Fraunces** (variable display serif) is the brand voice; **Raleway**
handles body and UI.

### Families
- `--font-display`: `'Fraunces', Georgia, serif` — headings, wordmark, captions.
- `--font-body`: `'Raleway', -apple-system, sans-serif` — body, UI, labels.
- `--font-mono`: `ui-monospace, 'SF Mono', Menlo, monospace` — token/code specimens.

Loaded from Google Fonts in `tokens/fonts.css`. Weights used: **400 / 500 / 600**.

### Fraunces variable axes (the expressive work)
- `opsz` 9–144 — match optical size to render size.
- `SOFT` 0–100 — rounder terminals as size grows.
- `WONK` 0 | 1 — the playful off-kilter glyphs; **accents only**.

Presets: `--fraunces-display` (`SOFT 50, opsz 144, WONK 0`) ·
`--fraunces-accent` (`SOFT 100, opsz 144, WONK 1` — the italic emphasis) ·
`--fraunces-text` (`SOFT 50, opsz 24`) · `--fraunces-caption` (`SOFT 100, opsz 14`).

### Type scale
| Token | Size | Use |
|---|---|---|
| `--text-2xs` | 11.2px | micro labels, tier badges |
| `--text-xs` | 12px | meta, eyebrows |
| `--text-sm` | 13.6px | captions, fine print |
| `--text-base` | 15.2px | UI text, buttons |
| `--text-md` | 16px | comfortable body |
| `--text-lg` | 18.4px | lead paragraphs |
| `--text-xl` | 24px | card titles, wordmark |
| `--text-2xl` | 32px | sub-headings |
| `--text-3xl` | 48px | section titles |
| `--text-4xl` | 64px | page heads |
| `--text-5xl` | 88px | hero display |

### Line height & tracking
- Leading: `--leading-tight` 1.05 (display) · `--leading-snug` 1.2 · `--leading-normal` 1.5 · `--leading-relaxed` 1.7 (body).
- Tracking: `--tracking-display` −0.03em · `--tracking-tight` −0.02em · `--tracking-wide` 0.1em · `--tracking-wider` 0.15em (eyebrows) · `--tracking-widest` 0.2em (section labels).

### Rules
- **Headings** → Fraunces, **light (400)**, tight tracking, large; use `--fraunces-display`.
- **The one accent word.** Italicize exactly **one** word per headline, color it terracotta, `--fraunces-accent`. Never two.
- **Body / UI** → Raleway 400/500/600, `--leading-relaxed` for reading copy.
- **Eyebrows / labels** → Raleway, **UPPERCASE**, `--text-xs`, `--tracking-wider`, ink-muted; the terracotta variant carries a short leading dash.
- **Captions** → small **Fraunces italic** in ink-muted.
- Casing: sentence case in prose & headings; UPPERCASE only for tiny eyebrows.

---

## 5. Spacing & layout

A **4px base step** (`--space-1` = 0.25rem). Editorial rhythm — sections breathe.

`--space-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 20 · `-6` 24 · `-8` 32 · `-10` 40 · `-12` 48 · `-16` 64 · `-20` 80 · `-24` 96 (px).

Components sit on `--space-4`/`--space-6`; sections breathe with `--space-24`.

**Layout:** `--container` 1400px (marketing max-width) · `--container-prose` 800px
(manifesto / reading column) · `--gutter` 48px (desktop side padding) ·
`--gutter-mobile` 24px. Recurring section header pattern: eyebrow → headline →
right-aligned italic caption.

---

## 6. Effects — radii, elevation, motion, texture

### Corner radii
`--radius-xs` 2px · `--radius-sm` 4px (buttons, inputs, badges) · `--radius` 8px
(the default card) · `--radius-lg` 16px (large panels) · `--radius-pill` 999px
(tier badges, avatars).

### Elevation — warm, ink-tinted, layered (never a hard black drop)
Shadows are built from sepia ink `rgba(42,38,34,…)` at low alpha with negative spread.
- `--shadow-xs` — hairline lift.
- `--shadow-sm` — resting cards.
- `--shadow` — raised cards / popovers.
- `--shadow-lg` — dialogs, modals, hover-lifted cards.
- `--shadow-pop` — strongest hover/lifted state.

### Motion — restrained and tactile
- House easing `--ease-out` `cubic-bezier(0.4,0,0.2,1)`; soft `--ease-soft` `cubic-bezier(0.22,1,0.36,1)`.
- Durations `--dur-fast` 0.2s · `--dur` 0.3s · `--dur-slow` 0.5s.
- `--lift` `translateY(-4px)` (card hover) · `--lift-sm` `translateY(-2px)` (button hover).
- No bounces, no infinite loops, no parallax. Arrows slide `+4px` on hover.

### Texture — the tooth of the page
Two fixed, pointer-events-none overlays give surfaces digital paper grain:
- `.paper-grain` — fractal-noise SVG (`--grain-noise`), opacity ~0.4, `mix-blend-mode: multiply`.
- `.paper-specks` — faint radial-dot speck layer, opacity ~0.15.
Place both as fixed siblings in the app shell (skip on dense dashboards).

### States (the interaction language)
- **Hover:** primary button warms ink → terracotta; secondary fills ink; ghost/links turn terracotta; cards lift −4px and deepen shadow; portraits scale 1.02.
- **Press / active:** transform returns to 0, shadow drops (a gentle "set down").
- **Focus:** **neutral ink** — 2px ink outline (buttons) or ink border + soft ink ring (inputs). **Never terracotta** (that reads as error).
- **Invalid:** terracotta-deep border + terracotta ring + helper text in terracotta-deep.
- **Disabled:** ~45% opacity, `not-allowed`.

### Cards (the recurring object)
`--paper-warm` stock, 1px hairline border (ink ~12%), `--radius` (8px), soft
layered shadow. Interactive cards lift −4px on hover and deepen the shadow.

---

## 7. Components (React primitives)

Consume from the compiled bundle: `const { Button, … } = window.QuillDesignSystem_a37217`.
Each lives in `components/<group>/` with a `.d.ts` (props) and `.prompt.md` (usage).

### Button — `components/forms/Button.jsx`
Variants: `primary` (solid ink → warms to terracotta on hover), `secondary`
(ink outline, fills ink on hover), `ghost` (text, terracotta on hover), `accent`
(terracotta, for the one hero CTA), `link` (underlined inline text, no chrome).
Sizes `sm`/`md`/`lg`. Props: `withArrow` (sliding "→"), `href` (renders as link),
`disabled`. `rounded-sm`, Raleway medium.
```jsx
<Button variant="primary" withArrow>Start your collection</Button>
<Button variant="accent">Save me a deck</Button>
<Button variant="link" href="#journal">Read the journal</Button>
```

### Input — `components/forms/Input.jsx`
Text field / textarea on paper-warm. **Ink** focus ring (neutral), terracotta
**invalid** state. Props: `label`, `hint`, `invalid`, `multiline`, plus native
input attributes. `box-sizing: border-box` is built in.
```jsx
<Input label="Email" type="email" placeholder="your@email.com" />
<Input label="Notes" multiline placeholder="What's this deck for?" />
<Input label="Email" invalid hint="That doesn't look right" />
```

### Badge — `components/display/Badge.jsx`
The tier pill — uppercase capsule. `tier`: `everyday` / `featured` / `signed` /
`heirloom` / `neutral`; label defaults to the tier name, override with children.
```jsx
<Badge tier="heirloom" />
```

### Eyebrow — `components/display/Eyebrow.jsx`
Uppercase tracked kicker above a heading. Default terracotta with a leading dash;
`muted` for plain ink-muted section labels.
```jsx
<Eyebrow>Issue №001 · Spring Collection</Eyebrow>
<Eyebrow muted>The First Drawing</Eyebrow>
```

### Avatar — `components/display/Avatar.jsx`
Round portrait (`src`) or italic Fraunces `initials` fallback on paper-deep.
Sizes `sm` (32) / `md` (44) / `lg` (64).
```jsx
<Avatar src="assets/portraits/critique-companion.jpg" size="lg" />
<Avatar initials="RP" size="sm" />
```

### Card — `components/surfaces/Card.jsx`
Base digital paper surface. `interactive` adds the hover-lift; `flush` removes padding and
clips children for full-bleed media.
```jsx
<Card interactive>…</Card>
```

### ProductCard — `components/surfaces/ProductCard.jsx`
A collectible portrait card — hand-drawn item card with number, title, blurb,
category, and tier (composes Badge). Lifts on hover; portrait scales 1.02.
```jsx
<ProductCard title="Critique Companion" description="…" portrait="…"
  number="001" category="Design" tier="heirloom" />
```

---

## 8. Iconography

Deliberately **icon-light** — visual interest comes from hand-drawn portraits and
type, not an icon set.
- **Typographic marks as icons:** arrow `→` (CTAs, slides on hover), pilcrow `¶`
  (the manifesto mark), numero `№` (catalog numbers), middot `·` (separator).
  Use real Unicode glyphs in the brand fonts — prefer over SVG icons.
- **Tier initials:** a single italic Fraunces letter (E / F / S / H) in a
  pigment-tinted circle.
- **No icon font, no emoji** in the source.
- **UI icons: Material Symbols (Outlined, weight 200)** — the actual Google
  symbols, rendered as inline SVG through the source-owned `<Icon>` component
  (`src/components/ui/icon.tsx`), generated from the official `@material-symbols/svg-200`
  package. The thin 200 weight matches the editorial feel; the typographic marks
  above are still preferred where they read naturally.

---

## 9. Imagery & assets

**Hand-drawn portrait illustrations** — graphite linework with soft watercolor
washes on cream, warm and naturalist, **never photographic**. Each card has one.
- `assets/portraits/critique-companion.jpg`
- `assets/portraits/spec-sharpener.jpg`
- `assets/portraits/research-synthesist.jpg`

When mocking new surfaces, reuse these — don't invent new portraits. For a needed
placeholder, use a paper-deep block, not a stock photo.

---

## 10. Voice & content

Warm, unhurried, a little romantic about craft. **"We"** for the studio, **"you"**
for the reader. Metaphors of drawing / printing / collecting / keeping. Short
declaratives, the occasional fragment for rhythm (*"No spam. Just drawings."*).
- **Casing:** sentence case; UPPERCASE only for tiny eyebrows.
- **One emphasized word**, italic + terracotta, per headline.
- **Numbering:** the numero glyph `№` (e.g. `№ 001`), not "No." or "#".
- **No emoji, no hype punctuation.** The pilcrow `¶` is a quiet brand mark.
- **Tiers as vocabulary:** Everyday / Featured / Signed / Heirloom — never Free/Pro/Enterprise.

Sample microcopy: headline *"Tools, made by **hand**."* · CTA *"Save me a deck"*
· note *"No spam. Just drawings."*

---

## 11. Do / Don't

**Do** — sit everything on digital paper; reserve terracotta for the one accent word, the
primary CTA's hover, and the hero `accent` button; use **ink** for primary actions
and focus; warm layered shadows; Fraunces light + tight for headings; hand-drawn
portraits; typographic glyphs over icons.

**Don't** — pure white (`#FFF`) or pure black (`#000`) in Dawn & Dusk (the
Classic themes use them by design); terracotta focus rings
(reads as error); terracotta on every hover; blue-purple gradients; emoji; heavy
or bold Fraunces; tight body leading; bouncy or looping motion; stock photography.
