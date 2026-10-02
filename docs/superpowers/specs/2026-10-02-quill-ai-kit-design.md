# Quill AI kit: the AI gradient and 20 AI components

Date: 2026-10-02 · Status: draft for Ryan's review · Sketch: https://claude.ai/artifact/CkM1XHPDLjysEVsJQj7FS2

## Why

Quill has one AI-adjacent block today (`chat`: a one-line input and a send button). Craftwell apps are adding AI features, and every one of them would otherwise re-decide how a prompt box, an AI reply, a citation or an agent approval looks. Research on Mobbin (8 searches, about 85 web screens from 60+ apps) plus ClickUp Brain showed a stable set of AI patterns and a stable way products mark AI with a gradient. This spec adds both to Quill.

## Decisions already made (Ryan, 2026-10-02)

| Decision | Detail |
|---|---|
| AI gets a gradient | One gradient, meaning only AI. Exception to the decorative-gradient ban, not a reversal of it. |
| Palette | **Ember**: gold to terracotta to indigo. |
| Strength | **+50% chroma** over Dawn/Dusk pigments, same lightness and hue. |
| Across themes | Classic Light/Dark already ship pigments at exactly 1.5x Dawn/Dusk chroma, and Intelligent richer still, so those themes use their own pigments with no second boost. Looks equal across all five themes. |
| AI mark | Hand-drawn two-star sparkle (big star + companion upper-right, each with its own gradient), plus a one-star version for 16px and under. Not from Material Symbols, which has no four-point sparkle in 0.47.5. |
| Scope | All 20 pieces from the research, built in phases. |
| Documentation | Every piece gets the full set every existing Quill component has (see "Definition of done"). |

## The gradient: where it goes

Six placements, and nowhere else:

1. **AI mark**: always at full strength.
2. **AI composer edge**: muted at rest, full on focus, sweeping while working.
3. **Panel wash**: one smooth top-to-bottom fade on AI panels and popovers (percent stops only).
4. **Motion while working**: shimmer text, sweeping line, moving edge. Stops when the answer lands; still under reduced motion.
5. **AI home glow**: one per page, only on an AI home page, about a fifth of the colour's strength.
6. **AI feature name**: gradient text on large headings, using the deep text stops.

Never on answer text; Accept, Replace or Send; charts; status colours; anything that is not AI.

### Tokens (baked values, computed from the shipped pigments)

New colour family `color.ai` in `src/tokens/quill.tokens.mjs`, five modes like every other colour. Fixed across accents.

| Token | Dawn | Dusk | Classic Light | Classic Dark | Intelligent |
|---|---|---|---|---|---|
| `ai.from` | #C49544 | #E2B764 | #C49544 | #E2B764 | #E0A340 |
| `ai.via` | #DE501B | #F57345 | #DE501B | #F57345 | #C96F4C |
| `ai.to` | #536A99 | #8AA2D2 | #536A99 | #8AA2D2 | #8B8FD8 |
| `ai.text-from` | #714F07 | #ECC883 | #7C5814 | #ECC883 | #E8BC72 |
| `ai.text-via` | #9D3209 | #FF8B64 | #9D3209 | #FE8D67 | #E08A66 |
| `ai.text-to` | #3D507A | #A3B8E2 | #3D507A | #A3B8E2 | #A6AAE3 |

The lowest text-stop contrast on its theme's paper is 6.23:1 (Dawn), against the 4.5:1 required. Dusk `text-via` is clipped to sRGB. Intelligent `ai.to` is violet-leaning (#8B8FD8); Ryan to judge it against the blue-purple ban during Phase 1 review.

### Shipped CSS

Six AI treatments ship in `registry/themes/quill.css` beside the existing `.fraunces-*` classes: `ai-text`, `ai-edge` (rest/focus/working), `ai-wash`, `ai-glow`, `ai-line`, `ai-shimmer`. Requirement: each works in both delivery channels (the file channel, and the shadcn CLI `cssVars` channel, where plain classes are dropped today). The plan decides how: either the classes plus a CLI-channel fallback, or components that build the gradient from the `--ai-*` variables directly so nothing depends on a class.

### Rule change

DESIGN.md, PRODUCT.md and `src/usage/foundations.mjs` (which generates DESIGN.md's spans, llms.txt and the agent rules) change "no decorative gradients" to keep the ban and add the AI exception, with the six placements and the never-list above. "Blue-purple gradients" stays banned by name.

## The 20 pieces, in four phases

Each phase is its own PR with its own minor version. Kind: **ui** = a `registry:ui` component apps install and compose; **block** = a `registry:block` page piece, like the existing 51.

### Phase 1: foundation and the composer

| Piece | Kind | Notes |
|---|---|---|
| AI gradient tokens + shipped treatments + rule change | foundation | As above. |
| `ai-mark` | ui | Two-star and one-star glyphs, per-instance gradient ids, decorative by default with an optional label. Joins the icon pipeline as Quill's first non-Material glyph. |
| `prompt-composer` | ui | Sizes `lg` (front door) and `sm` (thread and panel). Slots: mode tabs (tab shares the gradient edge), + menu, model picker, mic or send, Stop. States: idle, typing, attachments, working, disabled, error. `/` and `@` menus built on the existing command primitive. Optional `notebook` style (study G). |
| `ai-button` | ui | Stock Button plus the mark. The label stays ink. |
| `ai-badge` | ui | "AI draft", "Suggested". Built on Badge with the mark. |
| `ai-home` | block | AI start page: glow, greeting, composer `lg`, suggested prompts. |

### Phase 2: the conversation

| Piece | Kind | Notes |
|---|---|---|
| `ai-message` | ui | AI reply: mark on avatar, plain answer text, action row (copy, retry, thumbs up/down). |
| `ai-thinking` | ui | Shimmer label, sweeping line, streaming text, collapsed "Thought for 8 s" disclosure. |
| `citations` | ui | Numbered inline markers plus a sources list. |
| `suggested-prompts` | ui | Chips, cards or list; empty-state starters and follow-ups. |
| `model-picker` | ui | Grouped list with descriptions and a checkmark; shared by the composer and settings. |
| `ai-notice` | ui | "AI can make mistakes" line under a composer. |
| `ai-chat` | block | A full AI thread from the pieces above. |

### Phase 3: agents

| Piece | Kind | Notes |
|---|---|---|
| `agent-steps` | ui | Done, in progress, waiting; each step expands. Progress ticks stay moss. |
| `approval-card` | ui | "The agent wants to send this email": Approve, Edit, Deny. Plain buttons. |
| `question-card` | ui | Agent asks the user to choose; recommended option marked. |
| `ai-popover` | ui | Inline rewrite or suggestion with wash; Accept and Replace stay plain. |
| `ai-side-panel` | block | Docked assistant with wash and "Looking at" scope chip, on the existing Sheet. |

### Phase 4: housekeeping

| Piece | Kind | Notes |
|---|---|---|
| `ai-feedback` | ui | After a thumbs-down: quick reasons plus a note. |
| `conversation-history` | block | Past chats by day, rename and delete, on sidebar-nav. |
| `usage-meter` | ui | "1.5k credits left", on Progress. |

The AI feature name (placement 6) ships as the `ai-text` treatment in Phase 1, not as a component.

## Definition of done, for every piece

The same set every existing component has (enumerated from where `chat` and `tone-badge` appear in the repo):

1. **Source**: `registry/lib/<name>.tsx` (ui) or `registry/blocks/<name>.tsx` (block), using only tokens consumers receive.
2. **Registry item** in `registry.json`, with dependencies and targets.
3. **Usage module** `src/usage/<name>.usage.mjs` (summary, useWhen, alternatives, rules, not_for), registered in `src/usage/index.mjs` and `modules.d.ts`; plus role entries in `src/usage/roles.mjs` where the piece introduces a role.
4. **Storybook**: a story per state and size, a usage Docs page, and the Do/Don't visual pairs (e.g. gradient on the mark vs gradient on Replace).
5. **Generated outputs** rebuilt in the AGENTS.md order: `public/usage/<name>.md`, `public/r/<name>.json`, `public/llms.txt`, the agent-rules file, and the `quill-components` skill reference page. The MCP `find_component` picks it up from the usage module.
6. **Agent eval**: new cases in `scripts/agent-selection-cases.mjs` so agents pick the right AI piece for a job.
7. **Figma twin**: component with variants in the Quill library, bound to variables; an entry in `figma/components/README.md`, `figma/sync-state.json` and, for blocks, `figma/pattern-baseline.json` and `figma/visual-baseline.json`.
8. **Tests green**: `test:tokens` (incl. consumer reachability, theme enumeration, AA contrast for the new text stops), `test-storybook` with axe, the theme run, lint, `tsc`.
9. **Release**: version bump + CHANGELOG entry + `build:check`, `build:registry`, `build:llms`.

## Figma

- `color.ai` becomes six colour variables with five modes each, through the existing tokens-to-Figma sync.
- The gradient becomes paint styles whose stops bind those variables, if the Plugin API supports binding gradient stops. If not, five per-theme styles generated from the tokens. The plan verifies which.
- The mark becomes a component with two-star and one-star variants. Every piece above gets its twin via `/figma-push`.
- Needs Ryan: the Figma MCP is not connected in this session (sign-in), and publishing the library stays Ryan's action.

## Where Ryan's eye is needed

| When | What |
|---|---|
| Now | This spec. |
| Before Phase 2, 3, 4 builds | Sketches of what has not been sketched: citations, the full reply and streaming states, approval card, question card, feedback form, history, usage meter, AI notice. Added to the studies page. |
| End of each phase | The phase in Storybook, all five themes, before the PR merges. Phase 1 also: Intelligent's violet-leaning `ai.to`. |
| Figma | Sign in once; publish the library after each phase. |
| Releases | Merging each phase PR (it triggers a release that reaches tech-careers via library-sync). |

## Risks

- **The shipped theme is public API.** New `--ai-*` variables and treatments reach tech-careers on release. Additive only: nothing existing changes, so apps see no difference until they use an AI piece.
- **Two delivery channels.** Plain classes are dropped in the CLI channel today; the plan must make the AI treatments survive both.
- **The first non-Material icon.** The icon pipeline and its tests assume one source; the plan extends them rather than special-casing the mark.
- **Volume.** About 20 pieces with full documentation is large; phasing keeps each PR reviewable, and each phase is useful alone.

## Out of scope

Voice input behaviour (the mic is a slot only), real model calls or streaming transport (components render states; apps wire data), retiring or changing the existing `chat` block (person-to-person messaging stays as it is).
