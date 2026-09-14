# Quill — Design System Spec

A single-file reference for the **Quill** design system.
Everything an agent or developer needs to design on-brand: voice, color, type,
spacing, effects, components, iconography, and assets. Distilled from the live
token source and component files in this repo; every path named here exists,
and `scripts/repo-invariants.test.mjs` fails CI when one stops existing.

> **Brand in one line:** A low-contrast, editorial-derived visual language. Warm neutral grounds, ink-toned type, and a narrow accent palette reserved for meaning. No
> emoji, no decorative gradients.

**Related files**
- `src/tokens/quill.tokens.mjs` — the source of truth for every value below;
  `src/tokens/themes.mjs` names the themes and accents.
- `registry/themes/quill.css` — the shipped token layer an app installs (it lands
  as `app/quill-theme.css`); `src/app/globals.css` is the site's cut of the same
  source.
- `registry/blocks` and `registry/lib` — the 51 blocks and the two shipped
  components (`icon`, `tone-badge`).
- `src/components/ui` — the stock shadcn primitives the token layer restyles
  (apps install these from shadcn, not from Quill).
- `public/usage` — one usage page per component and block, generated from
  `src/usage`; `public/llms.txt` is the agent index.
- `PRODUCT.md` — Quill's own product brief; `AGENTS.md` — how to work in this repo.

---

## 1. Brand & product context

**Quill** is the design system for digital products. The brand feels editorial, collected, and curated. The voice is
that of an exclusive, premium and trusted product agency that sells apps — warm, unhurried and quietly confident.

Source of truth for all token values: `src/tokens/quill.tokens.mjs` — edit
there, then `npm run build:tokens` regenerates the CSS token blocks, the Figma
token JSON, and the generated exports.

---

## 2. Color

Everything sits on digital paper.
The values below are **Dawn**, the default theme. Three **digital papers**
(grounds), three **inks** (text), four **pigments** (accents, carefully selected pigments that bring a creative warmth and feel to each page). The Classic themes (§3) deliberately swap
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
| `--ink` | `#2A2622` | primary text, warm near-black |
| `--ink-soft` | `#5C524A` | secondary text, body at ease |
| `--ink-muted` | `#675F58` | captions, meta, disabled |

### Pigments — accents (each has a `-deep` press/hover shade)
| Token | Hex | Deep | Use |
|---|---|---|---|
| `--moss` | `#7A8C5C` | `#5E6E43` | **the signature** — the default accent: the one italic word, CTAs, focus; success |
| `--terracotta` | `#C4684B` | `#944A33` | danger / destructive; the warm pole in diverging charts |
| `--indigo` | `#5B6B8A` | `#44516D` | links, info; the cool pole in diverging charts |
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

## 3. Dusk — the dark theme

The notebook, closed at dusk and opened again under a desk lamp — hence the
name. **Dusk** is an added theme, not the default (**Dawn**) — grounds become
**dark walnut** (deep, warm, low-chroma browns, like oiled wood and aged leather)
and the ink inverts to a warm **cream** that sits on the wood the way chalk
or gouache would. The warmth of Dawn is preserved, just turned down for the
evening. **Still no pure black, no pure white, no cold greys.** Source of truth:
`src/tokens/quill.tokens.mjs` (`npm run build:tokens` regenerates
`registry/themes/quill.css` and `src/app/globals.css`).

### Activation
Themes are **token remaps under `data-theme`** on a parent (usually `<html>`):
no attribute (or `light`) = **Dawn** (default), `data-theme="dark"` = **Dusk**,
`data-theme="classic-light"` / `data-theme="classic-dark"` = the Classic pair, and
`data-theme="intelligent"` = the cockpit theme (near-black grounds, teal working
status, instrument fonts). The canonical list is `ALL_MODES` in
`src/tokens/themes.mjs`; every hand-typed list is checked against it in CI. Set
the attribute and the whole token layer flips, **no JS required**. In apps, the `ThemeSelector`
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
> `--cl-*` / `--cd-*` sets, and Intelligent with `--int-*`.

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
`classic-light` and `classic-dark` trade the notebook palette for conventional
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

Loaded from Google Fonts by the `@import` at the top of `registry/themes/quill.css`
(the token layer apps install); the site loads the same families through Next's
font loader in `src/app/layout.tsx`. Weights used: **400 / 500 / 600**.

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
Shadows are built from ink `rgba(42,38,34,…)` at low alpha with negative spread.
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
Read from the shipped primitives (`src/components/ui/button.tsx`,
`src/components/ui/input.tsx`), not from memory:
- **Hover:** the default (ink) button drops to 80% (`hover:bg-primary/80`);
  `outline` and `ghost` take the muted wash (`hover:bg-muted`); `link` underlines.
  Nothing turns terracotta on hover, and cards do not move.
- **Press / active:** buttons settle 1px down (`active:translate-y-px`).
- **Focus:** a 3px ring in the accent pigment at 50% plus a ring-coloured border
  (`focus-visible:ring-3 focus-visible:ring-ring/50`), the same on buttons and
  inputs. `--ring` follows `data-accent`, so it is moss by default and terracotta
  only when terracotta is the chosen accent. Never hand-set a focus colour.
- **Invalid:** `aria-invalid` sets a destructive (terracotta) border and a 3px
  destructive ring at 20%.
- **Disabled:** 50% opacity with pointer events off (buttons) or `cursor:
  not-allowed` (inputs).

### Cards (the recurring object)
`--card` (paper-warm) stock, a 10% ink hairline ring, `rounded-xl` corners, no
shadow and no hover lift — cards are paper, not buttons. Parts in §7.

---

## 7. Components

Primitives are **stock shadcn** (Base UI + Tailwind) restyled by the token layer —
Quill does not re-ship its own Button, Card or Input. Apps install them with
`npx shadcn@latest add button …`; the site's copies live in `src/components/ui`
and are what the entries below describe. Quill ships two components of its own
through the registry — `icon` (`registry/lib/icon.tsx`) and `tone-badge`
(`registry/lib/tone-badge.tsx`) — plus 51 blocks under `registry/blocks`. The
per-component rules live in `public/usage` (one page per name), written once in
`src/usage`.

### Button — `src/components/ui/button.tsx`
Variants: `default` (solid ink — the primary action), `outline`, `secondary`,
`ghost`, `destructive` (terracotta tint), `link` (underlined inline text). Sizes
`xs` / `sm` / `default` / `lg`, plus the square `icon-xs` / `icon-sm` / `icon` /
`icon-lg`. It renders as a link through Base UI's `render` prop. There is no
`href`, `withArrow` or `accent` prop: an arrow is a trailing glyph in the label,
and the accent pigment is never a button fill.
```jsx
<Button size="lg" render={<a href="/storybook/" />}>Open the Storybook <span aria-hidden>→</span></Button>
<Button variant="outline">Read the foundations</Button>
<Button variant="link">Read the journal</Button>
```

### Input — `src/components/ui/input.tsx`
The stock text field: `--input` border, the accent focus ring, the destructive
invalid state. It takes native `<input>` attributes only — a label is a `Label`
(`src/components/ui/label.tsx`) or the `FieldLabel` / `FieldDescription` /
`FieldError` parts of `src/components/ui/field.tsx`, the invalid state is
`aria-invalid`, and multi-line text is `Textarea` (`src/components/ui/textarea.tsx`).
```jsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="your@email.com" aria-invalid={hasError} />
```

### ToneBadge — registry `tone-badge` → `components/ui/tone-badge.tsx`
The generic uppercase tag pill for app status/tier/label chips — pigment
`tone` (`moss` positive · `gold` caution · `terracotta` attention · `indigo`
informational · `neutral`/`muted` quiet), tinted by default or `solid` for the
strong cue. Two sanctioned sizes, and only these two: `md` (20px, the badge
scale) and `sm` (16px, the count-pill scale). Type stays `--text-2xs` with
`--tracking-wide` 0.1em in BOTH sizes — never tighten tracking to shrink a
pill. Hand-rolling `rounded-full … uppercase` spans is a contract violation;
render every tag pill through ToneBadge.
```jsx
<ToneBadge tone="moss" solid size="sm">current</ToneBadge>
```

### Eyebrow — a recipe, not a component
The uppercase tracked kicker above a heading. In blocks it is a plain `<span>`:
`text-xs font-medium tracking-[0.15em] uppercase text-ink-muted` for the quiet
section label (as in `registry/blocks/faq.tsx`), or
`text-[var(--accent-pigment-text)]` — the AA text cut of the accent — for the
editorial flavour, optionally with a leading dash. There is no `Eyebrow`
component and none is planned.

### Avatar — `src/components/ui/avatar.tsx`
`Avatar` (sizes `sm` 24px / `default` 32px / `lg` 40px) wraps `AvatarImage` and
`AvatarFallback` (initials in `text-sm` on the muted surface); `AvatarBadge`,
`AvatarGroup` and `AvatarGroupCount` handle status dots and stacks. There are no
`src` or `initials` props on the root and no italic Fraunces fallback.
```jsx
<Avatar size="lg">
  <AvatarImage src="/team/rp.jpg" alt="" />
  <AvatarFallback>RP</AvatarFallback>
</Avatar>
```

### Card — `src/components/ui/card.tsx`
`Card` (`size` `default` / `sm`) with `CardHeader`, `CardTitle`, `CardDescription`,
`CardAction`, `CardContent` and `CardFooter`. Paper-warm stock, a 10% ink hairline
ring, `rounded-xl`, no shadow, no hover lift. Full-bleed media needs no prop: an
`<img>` as the first or last child takes the card's corners and drops the padding
on that edge. There are no `interactive` or `flush` props.
```jsx
<Card>
  <CardHeader>
    <CardTitle>Meeting Mapper</CardTitle>
    <CardDescription>…</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>
```

---

## 8. Iconography

Deliberately **icon-light** — visual interest comes from illustration and type,
not an icon set.
- **Typographic marks as icons:** arrow `→` (CTAs, slides on hover) and middot
  `·` (separator). Use real Unicode glyphs in the brand fonts — prefer over SVG
  icons. No decorative or ornamental marks.
- **No icon font, no emoji** in the source.
- **UI icons: Material Symbols (Outlined, weight 400)** — the actual Google
  symbols, rendered as inline SVG through the source-owned `<Icon>` component
  (`src/components/ui/icon.tsx`), generated from the official `@material-symbols/svg-400`
  package. The regular 400 weight gives glyphs solid presence at UI sizes; the
  typographic marks above are still preferred where they read naturally.

---

## 9. Imagery & assets

**Illustrations** — when illustrations are used, source them from
https://getillustrations.com/. Selections always match page-level or content-level
context. Imagery and illustrations are never mixed — it's one or the other.

For a needed placeholder, use a `--paper-deep` block.

---

## 10. Voice & content

Warm, unhurried, and obsessed about the quality of design craft. **"We"** for the agency, **"you"**
for the user and reader. Metaphors of editorial work, collecting, curating, and keeping.
Short, punchy declaratives, with the occasional fragment for rhythm (*"Building for
quality. One customer at a time."*).
- **Casing:** sentence case throughout. Uppercase reserved for eyebrow labels.
- **Emphasis:** at most one emphasized word per headline, italic + moss.
- **Documentation pattern:** state the decision, then the reason for it. No
  hedging, no second-person coaching, no hype or hype punctuation, no emoji.
Sample microcopy: headline *"Products, crafted with **intelligence**."* · CTA *"Our services"*
· note *"Quality design is our specialty."*

---

## 11. Do / Don't

**Do** — sit everything on digital paper; reserve the accent pigment (moss by
default) for the one accent word, eyebrows, links and the focus ring; use **ink**
for primary actions; warm layered shadows; Fraunces light + tight for headings.

**Don't** — pure white (`#FFF`) or pure black (`#000`) in Dawn & Dusk (the
Classic themes use them by design); a hand-set focus colour (the ring follows
`--ring`, which the accent axis owns); terracotta on hover (it is the danger
pigment); blue-purple gradients; emoji; heavy or bold Fraunces; tight body
leading; bouncy or looping motion.
