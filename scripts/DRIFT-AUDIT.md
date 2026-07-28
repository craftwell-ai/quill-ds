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

## Tier 3 — Figma ↔ code parity (on-demand, interactive)

The one check that needs interactive Figma MCP auth, so it is never scheduled —
run it in an interactive session (e.g. ask Claude to "run the Figma parity
check") when doing Figma work. It compares the live Figma variables against the
repo's source of truth:

- `status/link`, `shadcn/ring`, `shadcn/sidebar-ring` alias
  `color/pigment/<DEFAULT_ACCENT>/deep` (the repo default accent);
- `shadcn/chart-1..5` alias `color/chart/series/1..5`, and those primitives'
  per-mode values match `tokens.color.chart.series` in `src/tokens/quill.tokens.mjs`.

The repo-side half of this (DTCG export vs. code) is already a Tier 1 check; only
the live-file comparison is manual, and it naturally coincides with Figma edits.

## Automation — the loop that closes itself

Four workflows. The first three are deterministic: each has a provably correct
answer, so a green required check genuinely means "correct". The fourth is not,
and is fenced accordingly.

| Workflow | Does | Merges itself? |
| --- | --- | --- |
| `dependabot-auto-merge.yml` | Enables auto-merge on Dependabot minor/patch PRs; comments on majors and leaves them | yes, once green |
| `self-heal.yml` | Rebuilds generated files; opens a PR if the committed output drifted | yes, once green |
| `release.yml` | Tags + publishes a version that has none; opens a bump PR when commits pile up untagged | yes, once green |
| `claude-repair.yml` | On a red `main`, has Claude diagnose and open a fix PR | **no** — human merges |

Two properties hold across all four:

- **Nothing writes to `main`.** Every change arrives as a PR that the required
  `Lint · types · tests · build` check must pass. A wrong automated fix is a red
  PR, not a broken `main`.
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
