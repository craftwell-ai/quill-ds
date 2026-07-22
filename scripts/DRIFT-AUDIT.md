# Drift audit

Quill keeps itself honest with a three-tier "watch" system. It is deliberately
**not** an autonomous agent that edits the system — every check either reports
or blocks a merge; fixes always go through the normal PR flow. Each tier is
scoped by what it needs, so the noisy/auth-gated failure modes never occur.

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
