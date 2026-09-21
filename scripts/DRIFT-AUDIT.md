# Drift audit

Quill keeps itself honest with a three-tier "watch" system, and since v0.2.20 it
also **acts** on what it sees. The original rule has not been relaxed, only
automated: *fixes always go through the normal PR flow*. What changed is who
opens the PR and who merges it — a bot, once the required check is green —
rather than whether the check applies. Nothing writes to `main` directly, so an
automated fix that is wrong shows up as a red PR, not a broken `main`.

Each tier is scoped by what it needs, so the noisy/auth-gated failure modes never
occur. The automation layer is described at the end.

## Tier 1 — invariants in CI (deterministic, per-PR, zero noise)

Codified assertions that run on every PR via `npm run test:tokens` and the CI
"Generated files in sync" step. Drift literally cannot merge:

- **Intent metadata** — every registry block has `meta.intent` (from the
  controlled vocabulary) + `meta.use_when`. (`scripts/registry-meta.test.mjs`)
- **Accent copy** — the base theme description names the current default accent,
  tied to `DEFAULT_ACCENT`. (caught the real "terracotta accents" drift)
- **Generated files in sync** — `globals.css`, the DTCG export, the built
  registry (`public/r`), and `llms.txt` must match a fresh regenerate from
  source. (CI `git diff --exit-code`)
- **llms.txt freshness** — committed file equals the generator output.
  (`scripts/build-llms.test.mjs`)
- **Release + reference integrity** — the current version has a CHANGELOG entry;
  every registry item points at files that exist. (`scripts/repo-invariants.test.mjs`)

## Tier 2 — scheduled report (time-based facts, headless, low-noise)

`npm run drift-audit` (`scripts/drift-audit.mjs`) reports what changes on the
calendar rather than per-commit: dependency freshness (`npm outdated`), security
advisories (`npm audit`), and release housekeeping. Read-only.

Runs weekly via `.github/workflows/drift-audit.yml`, writing to the run's step
summary. It **fails (and emails) only on an actionable high/critical advisory** —
one with a real, non-major fix. Routine outdatedness and upstream advisories
whose only "fix" is a breaking major (which we hold deliberately) are reported
but do not fail the run, so there are no weekly false alarms.

**The act arm — `.github/dependabot.yml`.** The audit reports staleness; it does
not fix it. Dependabot opens the PR, on the same Monday 13:00 UTC window, and the
required CI check proves the bump before it can merge. It inherits this file's
no-false-alarms rule: the deliberately held majors (`@types/node`, `eslint`,
`typescript`) are *ignored* rather than retried into a red PR every week, and
lockstep families (all Storybook packages; `next` + `eslint-config-next`) are
grouped so a partial bump — which would simply be broken — cannot be proposed.
Minor and patch bumps now merge themselves once green (see Automation below);
majors are commented on and left for a human.

## Tier 3 — Figma ↔ code parity (scheduled detection + on-demand repair)

**Component parity is scheduled since v0.8.15, with auto-repair since v0.8.16**:
`figma-parity.yml` (daily, 13:00 UTC) runs `scripts/figma-drift.mjs --repair`,
which compares each synced component's live Figma node — via the REST file API,
which works headless on the Pro plan — against the committed baseline in
`figma/sync-state.json`, in both directions:

- **Value-level Figma drift** (a re-bound token, changed text) has a provably
  correct translation, so the workflow repairs it itself — a deterministic
  binding→class rewrite committed to the `auto/figma-pull` branch as an
  auto-merging PR, self-heal style. Baseline updated in the same commit.
- **Structural Figma drift** (children added/removed, strokes, unknown
  variables) needs judgment → the job fails naming the fix: run
  `/figma-pull <name>` in an interactive session.
- **Code moved without a mirror** → run `/figma-push <name>`. This direction is
  never a bot: Figma has no headless node-write API on any plan.

The slash commands rewrite the baseline as their last step, which is also how
an obsolete `auto/figma-pull` PR gets closed (the workflow closes it when drift
disappears). The job skips cleanly until a `FIGMA_TOKEN` repo secret exists
(Figma personal access token, file read scope).

**Every primitive has a declared status** (since v0.9.48): `components` (checked daily),
`candidates` (twin exists, not yet adopted) or `declined` (no twin, reason recorded) —
`scripts/figma-component-coverage.test.mjs` fails on a file in `src/components/ui` with
none of the three, the same shape as the pattern map.

**Coverage grows by adoption, not by hand.** `figma/sync-state.json` lists
`candidates` (twins built before the check existed); the workflow's `adopt`
input reads each over REST, keeps the ones whose bindings already match a class
string in code, reports the rest, and opens a human-merged PR. See
`figma/README.md`, "Adopting existing twins into the daily check".

**Pattern pages are covered for presence, not values** (since v0.9.42). The
block folder had grown to 51 while Figma held pattern pages for 23, and no
check compared the two lists. `figma/sync-state.json` → `patterns` is now the
record — one entry per `registry/blocks` file: `mirrored` (❖ page + pattern
frame ids), `missing` (not built yet) or `declined` (reason recorded).
`scripts/figma-pattern-coverage.test.mjs` (Tier 1, in `test:tokens`) fails
when a block has no entry; the daily run fetches every mirrored page at depth 1
and fails when a page is gone, renamed, or has lost its frame. Token bindings
inside pattern frames are not diffed — they are instances of the atoms above,
which are.

**Pattern content (since v0.9.49).** The daily run also fetches every mirrored
frame at full depth and diffs what a designer sees — visible texts, icon
components, top-level instances — against `figma/pattern-baseline.json`,
naming the page and the change (`text gone`, `icon added`, `instances …`) and
exiting 2 for a human. The code side is `scripts/figma-pattern-expect.mjs`
(each block rendered with react-dom/server); `scripts/figma-pattern-parity.test.mjs`
(Tier 1) requires a stamped page to match its block exactly on strings and
icons. `--snapshot-patterns` rewrites the baseline after a page is synced; the
**Figma parity** workflow's `snapshot` input runs it headlessly and opens a PR
with the new baseline (never self-merging), so no local Figma token is needed.

**Re-stamp guard (Tier 1, since v0.9.46).** Pushing to Figma can never be a bot
(no headless node-write API on any plan), so the only way drift stays at zero is
to make the Figma update part of the PR. Each mirrored pattern records
`codeHash` + `syncedAt` (the block source, comments and whitespace ignored, at
its last sync) or `stale: <reason>`; `foundations.tokensHash` records the token
source at the last foundations sync. `scripts/figma-restamp.test.mjs` fails when
either moves without a re-sync and names the command
(`node scripts/figma-stamp.mjs --block <name>` / `--tokens`). The stale list may
only shrink (CRA-223 rebuilds the July pages). Ledger: CRA-217.

The **variable/style-level** check below still needs interactive Figma MCP auth
(variable definitions are Enterprise-gated over REST), so it stays on-demand —
run it in an interactive session (e.g. ask Claude to "run the Figma parity
check") when doing Figma work. It compares the live Figma variables against the
repo's source of truth:

- `semantic/link`, `semantic/ring`, `semantic/sidebar-ring` alias
  `color/pigment/<DEFAULT_ACCENT>/deep` (the repo default accent);
- `semantic/chart-1..5` alias `color/chart-series-1..5`, and those primitives'
  per-mode values match `tokens.color.chart.series` in `src/tokens/quill.tokens.mjs`.

The repo-side half of this (DTCG export vs. code) is already a Tier 1 check; only
the live-file comparison is manual, and it naturally coincides with Figma edits.

## Automation — the loop that closes itself

Six workflows. All but `claude-repair` are deterministic: each has a provably
correct answer, so a green required check genuinely means "correct".
`claude-repair` is not, and is fenced accordingly.

| Workflow | Does | Merges itself? |
| --- | --- | --- |
| `dependabot-auto-merge.yml` | Enables auto-merge on Dependabot minor/patch PRs; comments on majors and leaves them | yes, once green |
| `dependabot-unstick.yml` | After every push to `main` (and 6-hourly), asks Dependabot to `recreate` any of its PRs left BEHIND or DIRTY once the regenerate step pushed to it | comments only |
| `self-heal.yml` | Rebuilds generated files; opens a PR if the committed output drifted | yes, once green |
| `release.yml` | Tags + publishes a version that has none; opens a bump PR when commits pile up untagged | yes, once green |
| `library-sync.yml` | On every published release, re-pulls the items each Quill-styled app already uses — one PR per app | yes, once **that app's** checks pass |
| `claude-repair.yml` | On a red `main`, has Claude diagnose and open a fix PR | **no** — human merges |

Two properties hold across all six:

- **Nothing writes to a default branch.** Every change arrives as a PR that the
  target repo's checks must pass — here the required `Lint · types · tests ·
  build`, in a synced app whatever that app declares. A wrong automated change
  is a red PR, not a broken `main`. (`library-sync` merges an app PR directly
  only when the app declares no checks at all — green by absence.)
- **Everything terminates.** `self-heal` re-runs after its own PR merges, finds
  no drift, and stops. `release` publishes, then finds nothing unreleased, and
  stops.

### Setup this depends on

- **`AUTOMATION_TOKEN` secret — required, or the loop stalls.** A PR opened with
  the default `GITHUB_TOKEN` does *not* start a workflow run, so CI never reports
  on it, so auto-merge waits forever. `self-heal` and `release` therefore open
  their PRs with a fine-grained PAT (Contents: read/write, Pull requests:
  read/write on this repo). Both workflows fall back to `GITHUB_TOKEN` and write
  a warning into the run summary rather than failing silently. Dependabot's own
  PRs are unaffected — Dependabot is not `GITHUB_TOKEN`, so CI runs on them
  normally and `dependabot-auto-merge.yml` needs no PAT.
- **Repo settings:** allow auto-merge, workflow permissions = read *and write*,
  Dependabot alerts + security updates on.
- **`LIBRARY_SYNC_TOKEN` secret — required by `library-sync.yml` only.** The
  sync pushes branches and merges PRs in the *app* repos, which the
  quill-ds-scoped `AUTOMATION_TOKEN` cannot reach: it needs a fine-grained PAT
  for **All repositories** with Contents: read/write and Pull requests:
  read/write. "All repositories" is deliberate — a future app is covered the
  day it is created. Missing secret → the run fails loudly at the first step.
  The `release` trigger fires only because releases are published with a PAT;
  see the comment in `library-sync.yml`.
- **`claude-repair.yml` is off** until both an `ANTHROPIC_API_KEY` secret and an
  `ENABLE_CLAUDE_AUTOFIX = true` repo variable exist.

### Why the fourth tier is fenced

The first three automate work with a right answer. Claude repair automates
judgement, and judgement fails differently: a confident wrong answer is
indistinguishable from a confident right one at a glance. The session that built
this loop produced a live example — a proposed fix to this very script parsed
`npm audit fix --dry-run --json` as JSON. It is not JSON; it is a plain-text
`add <pkg>` list. The "fix" would have failed every run, and it was caught only
because a result contradicted an earlier measurement and got re-checked. So its
PRs stay human-merged, and its prompt tells it to reproduce before fixing, verify
after, and say plainly when it is unsure.

## Tier 4 — cross-app pattern scan (scheduled, outward-looking)

Tiers 1–3 all watch Quill against itself. This one watches the apps *styled with*
Quill: `npm run pattern-scan` (`scripts/pattern-scan.mjs`), Mondays 14:00 UTC via
`.github/workflows/pattern-scan.yml`.

It reports two things nobody was noticing — a pattern hand-built in two or more
Quill-styled apps that Quill doesn't ship, and a block Quill already ships that
got rebuilt from scratch anyway (a findability problem, not a gap).

Two rules gate every candidate. **Origination:** the app must carry Quill's token
layer, which is how the app list is built in the first place, so an app without
Quill styling is never scanned and nothing from it can ever be suggested. That
also excludes the repos that merely *mention* Quill — `scaffold` carries its
script lineage but no styling, and 3 of 7 naive matches were false
positives. **Repetition:** built independently in at least two apps, or one app's
domain work qualifies (without it, one app's bespoke assets are a
candidate).

Read-only. It opens no PRs and promotes nothing, because name matching cannot
tell whether same-named components are one pattern — the three consumer apps each
have an "agent avatar" and the three are 94/137/46 lines built from entirely
different things. It reports line counts and imports side by side and leaves the
call to a human. Promotion follows the normal branch → PR → CI → merge flow, and
the decision is recorded in `scripts/pattern-scan.decided.json` so the report
moves it to "Already decided" instead of raising it again.

**It states its own limit in every report.** The rebuilt list only catches exact
name matches, so `update-feed` (Quill ships `activity-feed`) and `vitals-strip`
(`stat-cards`) are invisible to it. The list is a floor, not a total — an
incomplete list that reads as complete is worse than no list.

**Delivery is a tracking-issue comment, not a failed run.** A passing scheduled
workflow emails nobody, and failing the run every week to force an email would
train everyone to ignore red. So the report posts to the issue labelled
`pattern-scan` (created on first run, assigned so every comment notifies), and the
run turns red only when the scan itself breaks. Red here means the same thing it
means everywhere else in this file.

**Two tokens, not interchangeable.** `PATTERN_SCAN_TOKEN` is a fine-grained PAT
scoped to the org with `Contents: read` — it reads the other repos and cannot
create an issue. The workflow's own `GITHUB_TOKEN` writes the comment and cannot
read the other repos. The script keeps them as separate variables on purpose.

**The account is a user, not an organisation.** `craftwell-ai` is a personal
account, so discovery uses `/user/repos?affiliation=owner` — the *authenticated*
user's own repos. `/orgs/craftwell-ai/repos` 404s, and `/users/craftwell-ai/repos`
is worse than a 404: it answers 200 with only the public repos (just `quill-ds`),
which would have produced a confident, clean-looking scan of nothing. So
`PATTERN_SCAN_TOKEN` must be owned by the account that owns the apps, and a run
that lists zero repos fails loudly rather than reporting no findings.
