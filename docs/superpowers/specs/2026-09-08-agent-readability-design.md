# Agent Readability — Design Spec

**Date:** 2026-09-08
**Status:** Draft v2. Independently verified line by line (see §7). Pending the owner's decisions D1–D7.
**Goal:** Every agent that touches Quill, through any channel shadcn defines, receives the usage rules, intent, theming rules, foundations, and composition guidance it needs to build on-brand without guessing.

**Constraint (the owner):** Work *with* the shadcn framework. Do not create a parallel or conflicting pathway for agents. Every deliverable below rides a channel shadcn already documents.

---

## 1. Verified findings this spec responds to

Verified 2026-09-08 by two independent passes (author, then a fresh verifier agent) against the repo at `00b8d13`, the shadcn 4.21.0 source (the version consumer apps run via `npx shadcn@latest mcp`), and shadcn's published docs.

| # | Finding | Evidence |
|---|---|---|
| F1 | The shadcn MCP `view_items_in_registries` tool prints only name, description, type, file count, dependencies. Never `docs`, `meta`, or file content (its own tool description promises "files content"; the formatter does not print it). | 4.21.0 `dist/chunk-TWAHNSYO.js`, formatter `E(n)` |
| F2 | MCP `search`/`list` fuzzy-match only `["name","title","description"]`; `meta` is stripped before search. | 4.21.0 `dist/chunk-B2MD6U5O.js`, fn `Oh` |
| F3 | MCP `get_item_examples_from_registries` runs the same search with **no type filter** and prints matched items' file contents. Quill ships no `registry:example` items, but any block whose name matches a query (e.g. "login") is already returned as an "example". | same chunk; `registry.json` types = base 1, ui 2, block 51 |
| F4 | CLI `add` prints `docs` once for the whole resolved install tree, no type filter. `view <url>` prints raw JSON including `docs`. **`--dry-run` prints no docs.** `scripts/library-sync.mjs` writes files directly and never prints docs. | 4.21.0 `chunk-B2MD6U5O.js` (`s.docs&&E.info(s.docs)`, printer `Fa`); ran `view` against `/r/tone-badge.json` |
| F5 | `quill` (base) and `icon` (ui) are the only items without `docs`. All 54 have `description`. | `registry.json` |
| F6 | `public/llms.txt:9` renders `` `intelligent` → undefined ``. `THEME_NAMES` at `scripts/build-llms.mjs:25` lacks the `intelligent` key that `MODES` at `scripts/build-tokens.mjs:14-19` defines. `build-llms.mjs:38` also hard-codes "four-theme". | files |
| F7 | `scripts/build-usage.test.mjs:28` pins `item.description === u.summary`. Readers of `item.description` are exactly: `build-llms.mjs:38` (quill only), `:75` (`meta.use_when ?? description`), `build-usage.mjs:61` (writer), `registry-meta.test.mjs:47-58` (quill only). | grep of `scripts/ src/ .storybook/` |
| F8 | Nothing links `public/llms.txt`: not README.md, `src/app/**`, CLAUDE.md, AGENTS.md, nor either consumer app's CLAUDE.md. | grep |
| F9 | DESIGN.md (427 lines) and PRODUCT.md are not inputs to any agent-facing output. `build-llms.mjs:15-22` imports only tokens, `MODES`/`DEFAULT_ACCENT`, `INTENT_TAGS`, `ALL_USAGE`, `package.json`, `registry.json`. | file |
| F10 | Consumer apps `god-sent` and `tech-careers`: `components.json` has `@quill`, `.mcp.json` runs `npx shadcn@latest mcp`, DESIGN.md mentions `data-accent` 0× and `chart` 0×, neither has `.claude/rules/`. | files |
| F11 | Storybook components manifest: 0 of 105 entries carry a description, 45 have `error`, 12 have prop tables. | `public/storybook/manifests/components.json` |
| F12 | `Icon` renders an empty `<svg viewBox="0 0 24 24">` silently for a name outside the 89-name core set. | `registry/lib/icon.tsx:29-45` |
| F13 | Stale: `registry/themes/quill.css:2` install URL is `quill-ds.vercel.app`; DESIGN.md §7 references **seven** `.jsx` paths that do not exist (`components/forms/Button.jsx`, `Input.jsx`, `components/display/Badge.jsx`, `Eyebrow.jsx`, `Avatar.jsx`, `components/surfaces/Card.jsx`, `ProductCard.jsx`); DESIGN.md §3 Activation omits `intelligent`; DESIGN.md §4:194 cites `tokens/fonts.css`, which does not exist; README.md is create-next-app boilerplate; `~/.claude/commands/quill-setup.md` and `quill-app.md` load Inter (theme uses Raleway) and the old URL, and **are auto-loaded as skills in every Claude Code session**, so agents can still reach them. | files, grep, session skill list |
| F14 | Claude Code 2.1.265 loads `.claude/rules/*.md` as checked-in project instruction files; a file with `paths` frontmatter loads only when matching files are touched. | binary strings |
| F15 | shadcn registry-index requirements are all met today: public repo, flat `/r/` (55 files), no `content`/`include` in `public/r/registry.json`. | `gh repo view`, files, live `/r/registry.json` |
| F16 | **Token truth gap.** Usage modules cite 34 token references (7 distinct) that are not defined in `registry/themes/quill.css`: `--radius-sm/md/lg/xl/4xl`, `--shadow-md` (Tailwind/shadcn-init defaults in consumer apps, not Quill's), and `--text-2xs` (exists only in quill-ds `globals.css`, so consumers lack it). DESIGN.md §4–§6 is worse: `--font-display/body/mono`, the `--text-*` scale, `--leading-*`, `--tracking-*`, `--container`, `--container-prose`, `--gutter*`, `--radius-xs/sm/lg/pill`, `.paper-grain`/`--grain-noise` are all absent from the shipped theme (only `--radius` and `--space-*` exist), and §4/§6 say hover and accent italics are terracotta while `quill.css:124` sets `--ring` from the accent pigment. | grep of `src/usage/*.mjs`, DESIGN.md, `quill.css`, `globals.css` |
| F17 | `scripts/library-sync.mjs` `planSync` (:82-104) matches `files[].target` literally against the app's file list, so a `~/`-prefixed target never matches its installed path and the release bot would never re-sync it. | file |
| F18 | Re-running `shadcn add` on a changed file prompts (default No) in a terminal and silently skips when non-interactive; `--yes` does **not** suppress the prompt, only `--overwrite` writes. `tech-careers/CLAUDE.md:58` already tells agents to update the theme with `add @quill/quill --yes`, which hits this. | 4.21.0 `updateFiles`/`Lr`, `Ma` defaults |
| F19 | **Root cause of F16.** The token source `src/tokens/quill.tokens.mjs` already defines `font`, `radius` (xs–4xl), `text` (2xs–3xl), `shadow`, `motion`. `scripts/build-tokens.mjs` renders them into an `@theme inline` block, but `globalsBlock()` (:260, written to `src/app/globals.css`) includes that block and `registryBlock()` (:165, written to `registry/themes/quill.css`) emits only `:root` + mode blocks. So the site has the full scale and apps never receive it. `container`/`gutter` are absent from the source entirely. | `scripts/build-tokens.mjs:165,260-268`; grep of both CSS files |
| F20 | Both consumer apps import the theme from `app/layout.tsx` (`import './quill-theme.css'`), not from the Tailwind entry stylesheet. shadcn's native token delivery is `cssVars` (`{theme, light, dark}` records) plus `css` (arbitrary rules), which the CLI merges into the app's main stylesheet where Tailwind reads them. Whether an `@theme inline` block inside a layout-imported file feeds Tailwind utilities is UNVERIFIED. | `god-sent/app/layout.tsx:3`, `tech-careers/app/layout.tsx:5`; 4.21.0 schema `n`, `u` |
| F21 | **Fonts.** The theme sets `font-family: "Raleway"` / `"Fraunces"` by literal name (`quill.css:727,734`). `next/font` registers faces under private generated names and exposes them via a CSS variable, so the copy the setup skill bundles is never matched by the theme; pages render from the theme's Google `@import` (`quill.css:7`). Inferred from those two verified facts, not observed in a browser. | files |
| F22 | shadcn 4.21.0 has first-class `registry:font` items (`font: {family, provider: 'google', import, variable, weight?, subsets?, selector?, dependency?}`); items may carry `fonts: []`; on `add` the CLI edits `app/layout.tsx` to add `next/font/google` loading and sets `cssVars.theme[variable]`. Its options builder passes only `subsets`, `weight`, `variable`: **no `style` (italic) and no `axes`**. Next's font data lists Fraunces axes `SOFT, WONK, opsz, wght` and styles `normal, italic`. | docs `### font`; 4.21.0 `ih()`, `nh()`, `sh()`; `next/dist/compiled/@next/font/dist/google/font-data.json` |

## 2. The channels shadcn defines (and what shadcn says about them)

Quoted from `ui.shadcn.com/docs` markdown pages fetched 2026-09-08.

| Channel | shadcn's words | Reaches which agent |
|---|---|---|
| `description` | "It is recommended to add a proper name and description to your registry item. This helps LLMs understand the component and its purpose." | MCP search/list/view; CLI; llms.txt |
| `docs` | "Use `docs` to show custom documentation or message when installing your registry item via the CLI." | CLI `add` (printed once per install tree), CLI `view`, raw JSON |
| `categories` | "Use `categories` to organize your registry item." Schema: `z.array(z.string()).optional()`. | Schema-level taxonomy; not read by 4.21.0 CLI/MCP code |
| `meta` | "any key/value pair that you want to be available to the registry item." | Raw JSON only (MCP strips it) |
| `registry:example` | In the 4.21.0 schema type enum and used by ui.shadcn.com (`button-demo`), but **absent from the documented type table** (registry-item-json.md:104-119). Only the MCP tool text documents it: "Find usage examples and demos with their complete code." | MCP examples tool (prints full source) |
| `registry:file` + `target` | "Use for miscellaneous files." `target` required; doc example targets `~/.env`; "`~/` … project root." MCP docs example prompt: **"Install the Cursor rules from the acme registry."** | CLI `add` writes the file into the app |
| `llms.txt` | shadcn publishes its own at `ui.shadcn.com/llms.txt`. | Any agent with web access |
| Content negotiation | "From a single URL, you can serve … Markdown to AI agents and LLMs." CLI sends `User-Agent: shadcn`, `Accept: application/vnd.shadcn.v1+json, application/json;q=0.9`. | Any agent with web access |
| Registry index | "submit your namespace to the official registry index. This lets users add your namespace by name." | CLI/MCP discovery without a URL |

Rules-files-via-registry is a shadcn-anticipated pattern, not a side door.

## 3. Work items

Each item: **What** · **Why** (finding) · **Mechanism** (the shadcn channel) · **Files** · **Verify** · **Decision** (only where the owner must choose). Items marked *(v2)* changed after verification.

### Channel A — Registry item fields

**W1. Put the use-when sentence in `description`.** *(v2)*
- What: for every item with a usage module, `description = summary + ' Use when: ' + useWhen[0]`. Keep `meta.use_when` unchanged (llms.txt and tests read it).
- Why: F1, F2. Description is the only prose field the MCP searches and prints. shadcn's own guidance puts "purpose" in description.
- Mechanism: `description`.
- Files: `scripts/build-usage.mjs` (`injectRegistryDocs`, `:61`); `scripts/build-usage.test.mjs:28` (assert the new derivation); regenerate `registry.json`, `public/r/*.json`, `public/llms.txt`.
- Note: MCP `list_items_in_registries` prints every description, so listing output grows to about two sentences × 54 items. Acceptable.
- Verify: `npm run build:usage && npm run build:registry && npm run build:llms && npm run test:tokens`; `npx shadcn@latest view https://www.quilldesignsystem.com/r/login.json` shows the sentence in `description`.

**W2. Give the base `quill` item a generated `docs` field.** *(v2)*
- What: install-time text covering: the five `data-theme` values with their names; the four `data-accent` values and the default; the chart-token rule (fixed order, no raw pigments); fonts (Raleway body, Fraunces display) and that `quill.css:7` already `@import`s them (see D6); **the runtime theming contract** (ThemeSelector owns the attribute; storage keys `quill-theme` / `quill-accent`; prerender default is Dawn + moss, per DESIGN.md:96-104); the update rule (`add … --overwrite`, F18); the llms.txt URL; and "install `@quill/agent-rules` for AI agents" (W10).
- Why: F4, F5, F10, F18. This is the one item every app installs, and the CLI prints `docs` for it on first install.
- Mechanism: `docs`.
- Files: new `src/usage/theme-docs.mjs` exporting `renderThemeDocs()` built from `MODES` (with new `label`, W6), `DEFAULT_ACCENT` (`scripts/build-tokens.mjs:24`); `scripts/build-usage.mjs` adds a `name === 'quill'` branch before the `if (!u) continue` at `:59`; `scripts/build-usage.test.mjs` asserts the docs string names every mode attr and the default accent.
- Verify: `npx shadcn@latest view https://www.quilldesignsystem.com/r/quill.json` contains the docs text. (`--dry-run` does not print docs; F4.)

**W3. Document `icon`: usage module plus the core name list.** *(v2)*
- What: `src/usage/icon.usage.mjs` (summary, useWhen, alternatives, rules incl. "names outside the core set render nothing", a11y: `aria-label` for meaningful icons, tokens); register it in the hand-maintained `src/usage/index.mjs` (schema test fails otherwise); `src/stories/icon.stories.tsx` (coverage test requires a story per usage module; there is no usage-without-story allowlist, and `IconGallery.tsx` is a component, not a story). Append the core names inside `renderUsageDocs` in `src/usage/render.mjs` when `u.name === 'icon'`, so the usage page, the registry `docs`, Storybook, and the stale-output test (`build-usage.test.mjs:17`) all agree.
- Name source: the committed `src/components/ui/icons.core.mjs` (89 keys; CI regenerates and diffs it at `ci.yml:33-37`), or `coreNames()` from `scripts/build-icons.mjs:87`. **Not** `scripts/icons.manifest.mjs`, which is the 1003-name lazy list.
- Why: F5, F12.
- Verify: `npm run test:tokens`; `public/usage/icon.md` lists 89 names.
- Decision D5: add a development-only `console.warn` in `registry/lib/icon.tsx` when `data` is undefined.

**W4. Populate `categories` from the intent tags.**
- What: `item.categories = meta.intent` for blocks, in `build-usage.mjs`. `meta.intent` stays the source.
- Why: `categories` is shadcn's schema-level taxonomy (`z.array(z.string()).optional()`, preserved by `shadcn build`). Costs nothing; future shadcn tooling reads schema fields, not custom `meta`.
- Files: `scripts/build-usage.mjs`; `scripts/registry-meta.test.mjs` (assert `categories` deep-equals `meta.intent`).
- Verify: `npm run test:tokens`.

### Channel B — Example items (the MCP examples tool)

**W5. Ship `registry:example` items for Quill-specific components and for page composition.** *(v2)*
- What:
  - `icon-demo`, `tone-badge-demo`, `theme-selector-demo`: one file each under `registry/examples/`, description "An example showing how to use …" (wording from shadcn's registry-index docs).
  - Three page examples encoding composition: `example-app-page` (sidebar-nav shell → page-header → stat-cards → data-table), `example-marketing-page` (navbar → hero → feature-section → pricing → testimonial → footer), `example-auth-page` (login-split-panel). Each carries `docs` **generated from the same marked DESIGN.md §5 span that W7 and W10 use** (no hand-written copy), and only after W13 has corrected §5 so it names tokens that exist (today it cites `--container`, `--container-prose`, `--gutter*`, none of which are in the shipped theme; only `--space-*` is).
  - `registryDependencies` must use `@quill/<name>` or full URLs. Bare names resolve to shadcn's own registry, never to siblings.
  - Give every example an explicit `target` (e.g. `components/examples/example-app-page.tsx`); the CLI maps unknown types to the components dir otherwise.
  - No usage modules and no stories for examples. The coverage and llms tests only fire on usage modules, so leaving examples out of `src/usage` is the clean path. (Adding `kind: 'pattern'` modules would force stories and llms links.)
- Why: F3. This is shadcn's designated path for "how do I compose these." Page composition is otherwise absent from every agent channel. Fuzzysort with the CLI's keys matches "app page" → `example-app-page`, `example-marketing-page`; "dashboard" → `example-app-page`; "icon demo" → `icon-demo`.
- Mechanism: `registry:example` + `docs` (partially documented; see §2).
- Verify: `npm run build:registry`; MCP `get_item_examples_from_registries` with query "app page" returns the source; `shadcn add @quill/example-app-page --dry-run` resolves dependencies.
- Decision D4: confirm the three pages.

### Channel C — llms.txt

**W6. Fix the Intelligent theme rendering as "undefined".** *(v2)*
- What: add `label` to each `MODES` entry in `scripts/build-tokens.mjs` (`'Dusk (dark)'`, `'Classic Light'`, `'Classic Dark'`, `'Intelligent (dark cockpit)'`), export `LIGHT_LABEL = 'Dawn (light, default)'`, delete `THEME_NAMES` from `build-llms.mjs:25`, read labels from `MODES`, and derive the theme count at `build-llms.mjs:38` instead of the literal "four-theme".
- Why: F6.
- Files: `scripts/build-tokens.mjs`, `scripts/build-llms.mjs:25-27,38`, `scripts/build-llms.test.mjs` (add `assert.doesNotMatch(committed, /undefined/)` and assert every mode attr appears).
- Verify: `npm run build:llms && npm run test:tokens`.

**W7. Add Foundations and Principles sections, sourced from DESIGN.md and PRODUCT.md.** *(v2, now depends on W13 and W17)*
- What: wrap DESIGN.md §3 Do/Don't (Dusk, :169), §4 Typography (:185), §5 Spacing & layout (:235), §6 Effects (:250) in `<!-- llms:foundations:start -->` … `end` markers, and PRODUCT.md Anti-references (:36) + Design Principles (:43) in `<!-- llms:principles:start -->` … `end`. `build-llms.mjs` embeds the marked spans verbatim under `## Foundations` and `## Principles`. A test fails if a marker is missing or the span is empty.
- **Precondition:** W13 must correct the spans first. Embedded verbatim today they would mislead agents (F16): nonexistent `tokens/fonts.css`, an unshipped type scale and radius scale, undefined layout tokens, and "terracotta" hover/focus that contradicts the accent system.
- **Guard:** W17's token-truth test runs over the embedded spans.
- Why: F9.
- Files: `DESIGN.md`, `PRODUCT.md` (markers), `scripts/build-llms.mjs`, `scripts/build-llms.test.mjs`.
- Decision D2: recommended PRODUCT.md sections are Anti-references + Design Principles only.

**W8. Add an "Agent quick start" and link the machine-readable artifacts.**
- What: at the top of llms.txt: install the theme, install `@quill/agent-rules`, update with `--overwrite`, where usage pages live, the per-item JSON URL pattern, and the verification commands an agent can run in a consumer app (`npx tsc --noEmit`, `npm run lint`). In `## Links`: the usage index and `public/storybook/manifests/components.json`.
- Why: F8, F18.
- Files: `scripts/build-llms.mjs`.

**W9. Make llms.txt discoverable and enable root hosting.** *(v2)*
- What: rewrite README.md (F13) with the registry URL, llms.txt URL, Storybook URL; add a footer link on the homepage (`src/app/page.tsx`) to `/llms.txt`; in `next.config.ts` switch `rewrites()` to the object form, move the existing `/storybook/` rewrite into `afterFiles` (array form equals `afterFiles`, so behavior is preserved), add `beforeFiles` rewrites on `/` for `User-Agent: shadcn` and `Accept` matching `application/vnd.shadcn.v1+json` → `/r/registry.json`; add `Vary: Accept, User-Agent` via `headers()` (not `rewrites()`). `trailingSlash: true` is compatible; `/` already ends in a slash.
- Why: F8; shadcn-documented root hosting.
- Verify: `curl -H 'User-Agent: shadcn' https://www.quilldesignsystem.com/` returns JSON; a browser still gets the homepage. UNVERIFIED until tried: that `npx shadcn add https://www.quilldesignsystem.com` then resolves individual items.

### Channel D — Install-time delivery into the app

**W10. Ship `@quill/agent-rules`, a `registry:file` item targeting `~/.claude/rules/quill.md`.** *(v2)*
- What: one generated markdown file containing: theming rules and runtime contract (W2's renderer), Foundations + Principles (W7 spans, post-W13), the chart rule, the icon core list (W3), composition rhythm (the W5 span), the update rule (`--overwrite`), and the per-component rules index as links to `/usage/<name>.md`. Generated by `scripts/build-agent-rules.mjs` into `registry/agent-rules/quill.md`, run **before** `build:registry` in the chain (the build reads the file from disk; `repo-invariants.test.mjs:22-32` also requires it). Item entry: `{ name: 'agent-rules', type: 'registry:file', title: 'Quill agent rules', description: 'Claude Code project rules so AI agents build on-brand with Quill.', docs: 'Installed to .claude/rules/quill.md. Re-run with --overwrite to update.', files: [{ path: 'registry/agent-rules/quill.md', type: 'registry:file', target: '~/.claude/rules/quill.md' }] }`.
- **Library-sync fix (F17):** `scripts/library-sync.mjs` `planSync` must strip a leading `~/` from `files[].target` before matching, with a case in `library-sync.test.mjs`. Without it the release bot never re-syncs the rules file and every app goes stale after first install.
- Why: F1, F2, F10, F14. The MCP drops docs and meta; this lands the full rule set through shadcn's own install path, exactly the "Cursor rules from the acme registry" pattern.
- Mechanism: `registry:file` + `target`. `~/` resolves to `path.join(cwd, …)` before any `src/` relocation; `.claude/rules/quill.md` passes the path-safety check.
- Files: `scripts/build-agent-rules.mjs`, `scripts/build-agent-rules.test.mjs` (stale-output check, same pattern as `build-usage.test.mjs`), `scripts/library-sync.mjs` + test, `registry.json`, `package.json` (`prebuild-storybook`: tokens → usage → agent-rules → registry → llms → icons).
- Verify: in a scratch app with `@quill` configured, `npx shadcn@latest add @quill/agent-rules` writes `.claude/rules/quill.md`; re-running with unchanged content is a no-op; changed content prompts unless `--overwrite`.
- Decision D1: separate item (recommended: explicit install, no surprise dotfile on theme updates; once F17 is fixed the bot keeps it current) vs. appending the file to the `quill` base item's `files[]` (arrives with the theme; every theme update touches the rules file).
- Decision D7: add `~/.cursor/rules/quill.mdc` to the same item for non-Claude agents. Not needed today (both consumers use Claude Code).

**W11. Wire consumers.** *(v2)*
- What: in `~/.claude/skills/web-app-setup/SKILL.md` Phase 2, add step 6 after `:86` (`npx shadcn@latest add @quill/agent-rules --yes`) and a CLAUDE.md line "Design system rules: `.claude/rules/quill.md`; full reference `https://www.quilldesignsystem.com/llms.txt`; update Quill items with `npx shadcn@latest add @quill/<name> --overwrite`." Fix step 4's stale claim that the theme "will fall back" without `next/font` (the theme already imports the fonts; see D6). Apply the same to `god-sent` and `tech-careers`, and correct `tech-careers/CLAUDE.md:58` (`--yes` → `--overwrite`). Delete `~/.claude/commands/quill-setup.md` and `quill-app.md`.
- Why: F8, F10, F13, F18.
- Decision D3: delete the two old commands (recommended; they are auto-loaded into every session and give wrong font and URL) vs. fix them.

### Channel E — Storybook's own agent export (separate from shadcn, not conflicting)

**W12. Repair the Storybook components manifest.** *(v2)*
- What: fix the 45 detection errors: 20 × "No component definition found" are react-docgen's resolver failing on `class-variance-authority`'s `exports` map in components that import `VariantProps` (message: `"." is not exported under no conditions from package …/class-variance-authority`); 25 × "We could not detect the component from your story file" need `component:` in the story `meta`. Then descriptions and prop tables export. Link the manifest from llms.txt (W8).
- Why: F11. Lowest priority.
- Files: `src/stories/*.stories.tsx` (`component:` in meta), `.storybook/main.ts` (docgen resolver/conditions).
- Verify: `npm run build-storybook`; count of `error` entries in the manifest is 0.

### Housekeeping and guards

**W13. Correct DESIGN.md and other stale docs.** *(v2, widened; now a precondition for W5 and W7)*
- DESIGN.md: seven §7 component paths → current `src/components/ui/*` and `registry/lib/*` paths; §3 Activation adds `intelligent`; §4:194 `tokens/fonts.css` → `registry/themes/quill.css` `@import`; §4/§6 hover, focus, and accent-italic colors → "the active accent (`--ring`, `--link`)", not terracotta; §4 type scale, `--leading-*`, `--tracking-*`, §5 `--container*`/`--gutter*`, §6 `--radius-xs/sm/lg/pill` and grain classes → either ship them in `quill.css` or rewrite the prose to the tokens that exist (`--radius`, `--space-*`). Decision D8.
- `registry/themes/quill.css:2` → `https://www.quilldesignsystem.com/r/quill.json`.
- README.md (W9). `build-llms.mjs:38` "four-theme" (W6).

**W14. CI enforcement (extend `scripts/registry-meta.test.mjs`).** *(v2)*
Every item has a non-empty `docs` (the `agent-rules` item carries one, W10); every item with a usage module has a `description` containing `u.useWhen[0]` (assert against the usage module, not `meta.use_when`, which only blocks carry); `categories` equals `meta.intent` for blocks (W4); `public/llms.txt` contains no `undefined` and has `## Foundations`, `## Principles` (W6, W7); `registry/agent-rules/quill.md` is fresh (W10).

**W15. Release hygiene.** Each PR bumps `package.json` and adds a `## [x.y.z] — date` CHANGELOG entry (`repo-invariants.test.mjs:11-20` enforces it); merge `main` first (bots move it).

**W16. Submit `@quill` to the shadcn registry index (optional).** *(v2)* F15 shows requirements are met. Before submitting, check the "matching registry name" setup signal: `registry.json.name` is `quill-ds` while the namespace is `@quill`; shadcn's health doc does not define "matching". Health scores reliability, schema, installability, setup only, never docs.

**W17. Token-truth test (new).**
- What: a test in `scripts/` that extracts every `--token` name from `src/usage/*.usage.mjs`, the W7 spans, the W5 example docs, and `registry/agent-rules/quill.md`, and asserts each is defined in `registry/themes/quill.css`. Today it would fail on 7 distinct names in usage modules (F16); fix those modules in the same PR (replace Tailwind-default radius/shadow names with Quill's, and either ship `--text-2xs` in the theme or drop the reference).
- Why: F16. Agents copy token names literally; an undefined token silently renders nothing.
- Files: `scripts/token-truth.test.mjs`, affected `src/usage/*.usage.mjs`, possibly `registry/themes/quill.css`.

**W18. Fonts: one canonical source (new, v3).**
- Why: F21, F22. Today two copies load and only the theme's Google `@import` copy is used.
- Option A, shadcn `registry:font` on the `quill` base item: most on-framework; the CLI wires `next/font` into the app automatically and self-hosts. Requires changing `quill.css:727,734` to `font-family: var(--font-sans)` / `var(--font-display)`, and **loses Fraunces italics and the `opsz`/`SOFT`/`WONK` axes** until shadcn passes `style`/`axes` (F22). Silently does nothing in apps without `app/layout.tsx`.
- Option B, keep the theme's `@import` as the single source and delete web-app-setup step 4 (`SKILL.md:78-82`): zero-config on any framework, full axes and italics, one line to maintain. Cost: a render-blocking request to Google per page, no self-hosting.
- Decision D6 (revised): recommended **Option B now**; revisit A when shadcn supports font axes.

**W19. Deliver the full token set the shadcn way (new, v3; supersedes the "publish the real ones" reading of D8).**
- Why: F19, F20. The site and apps diverge because `registryBlock()` omits the `@theme inline` block and the theme is a layout-imported file Tailwind may not read.
- What: convert the `quill` base item from a single CSS file to shadcn's native delivery: `cssVars.theme` (fonts, color maps, radii, type scale, shadows, from `renderCss(tokens).theme`), `cssVars.light` (`:root`), and `css` for the four `[data-theme=…]` blocks and the `@layer base` typography rules. The CLI merges these into the app's main stylesheet, where Tailwind reads them, so `rounded-lg`, `text-2xs`, `font-display` resolve to Quill values in apps exactly as on the site. Add `container`, `containerProse`, `gutter`, `gutterMobile` to `src/tokens/quill.tokens.mjs` so they flow to CSS and Figma through the existing pipeline. Generate DESIGN.md §4–§6 foundations from the token source plus a small structured foundations module (same pattern as `src/usage`), replacing hand-written prose, so W7 embeds generated text and W17 becomes a guard rather than the fix.
- Cost: reworks the base item, `scripts/build-tokens.mjs` (emit `cssVars`/`css` JSON instead of, or alongside, the file), `library-sync.mjs` (syncs files today, not cssVars), the "never hand-edit `app/quill-theme.css`" rule in consumer CLAUDE.md files, and W13's DESIGN.md edits become generation instead of hand fixes. Needs a migration note for the two existing apps.
- Cheaper but UNVERIFIED alternative: keep the file, make `registryBlock()` emit the `@theme inline` block too, and tell apps to `@import "./quill-theme.css"` from `globals.css` instead of importing it in `layout.tsx`. Requires a spike to confirm Tailwind picks up the block. Not recommended as the long-term answer.
- Decision D8 (revised): **cssVars delivery (recommended, fixes it for good)** vs. the file-plus-`@import` spike vs. trim DESIGN.md to what ships today (bandaid).

## 4. Phasing

| PR | Items | Size | Outcome |
|---|---|---|---|
| A | W6, W1, W2, W4, W14 (parts), W15 | small, mechanical | MCP search/view see purpose; theme install prints the rules; llms.txt bug fixed |
| B | W19 (if D8 = cssVars), W18, W17, W13 | medium-large, the structural fix | Site and apps receive the identical token set; DESIGN.md foundations generated from the source; one font source |
| C | W7, W8, W9 | small once B lands | Foundations + principles reach agents through llms.txt; llms.txt discoverable |
| D | W10 (incl. library-sync fix), W11 | medium | Full rule set lands in every consumer app via `shadcn add` and stays current via the bot |
| E | W3, W5, W12, W16 | larger, needs content | Icon names; page composition examples; Storybook manifest; directory listing |

B precedes C and D because both embed the generated foundations. If D8 chooses the bandaid, B shrinks to W13 + W17 + W18.

## 5. Explicitly not doing

- No custom Quill MCP server. shadcn's MCP is the browsing channel; W1/W2/W10 fix what it drops.
- No second documentation site or format. Usage pages, llms.txt, and the registry stay the outputs of the one usage source.
- No restating shadcn primitive APIs (props, variants). Agents already have `ui.shadcn.com/docs/components/*.md`.
- No hand-written copies of rules anywhere. Every new artifact is generated from `src/usage`, `scripts/build-tokens.mjs`, or marked spans in DESIGN.md/PRODUCT.md.

## 6. Decisions for the owner

- **D1** Rules file as a separate item (recommended) or attached to the theme item.
- **D2** Which PRODUCT.md sections go to agents (recommended: Anti-references + Design Principles).
- **D3** Delete `quill-setup` / `quill-app` commands (recommended) or repair them.
- **D4** The three page examples: app dashboard, marketing landing, auth. Confirm or swap.
- **D5** Development-only warning when `Icon` gets an unknown name.
- **D6** Fonts (revised, see W18): keep the theme's Google `@import` as the single source and drop the skill's `next/font` step (recommended now), or move to shadcn `registry:font` and accept losing Fraunces italics and optical-size axes until shadcn supports them.
- **D7** Also ship Cursor rules in the same item. Not needed today.
- **D8** Tokens (revised, see W19): deliver the full token set via shadcn `cssVars` + `css` and generate DESIGN.md foundations from the token source (recommended, fixes it for good), or spike the file-plus-`@import` route, or trim DESIGN.md to what ships today (bandaid).

Answered 2026-09-08: **D1** separate item. **D3** delete the old commands. **D6** theme's Google `@import` stays; drop the skill's `next/font` step. **D8** shadcn `cssVars` + `css` delivery with generated foundations (W19).

## 7. Verification log

- 2026-09-08, pass 1 (author): F1–F15, W1–W16 drafted.
- 2026-09-08, pass 2 (independent agent, no shared context): F1–F15 confirmed, F13 corrected (seven paths, commands auto-loaded); F16–F18 added; W3 source and placement corrected; W5 dependency syntax, target, tests, and content corrected; W7 blocked on DESIGN.md accuracy; W9 `Vary` placement and rewrite shape corrected; W10 library-sync gap and `--yes` semantics added; W12 cause corrected; W14 assertion target corrected; W17, W18 added; D6–D8 added.
- 2026-09-08, pass 3 (author, after the owner asked "what fixes it for good"): root causes traced. F19 (`registryBlock()` omits the `@theme inline` block the site gets), F20 (layout-imported theme vs shadcn `cssVars` delivery), F21 (theme's literal font names make the `next/font` copy dead weight), F22 (shadcn `registry:font` lacks `style`/`axes`). W18 rewritten with options A/B; W19 added (cssVars delivery + generated foundations); D6 and D8 revised; phasing re-cut into A–E. D1 and D3 answered by the owner.
