# Cross-app pattern scan — design

**Date:** 2026-07-29
**Status:** approved, not yet built

## The problem

Quill ships 51 blocks, and three apps are styled with it. Nothing currently looks
at those apps. So two things go unnoticed:

1. **Patterns built by hand in more than one app that Quill should probably own.**
   Nobody notices the second time it gets built.
2. **Blocks Quill already ships that got rebuilt from scratch anyway.** Not a gap
   in Quill — a findability problem. The block existed and nobody knew.

Both are invisible today because Quill's drift audit only ever looks inward at
Quill's own health (dependencies, advisories, releases). It has never looked at
what the apps using Quill are doing.

## The rules

Two conditions, both required, before anything is even a candidate:

- **Origination.** It must come from an app already styled with Quill. Quill
  grows only from things that have been built and lived with, never from
  "wouldn't it be nice if."
- **Repetition.** It must have been built independently in **at least two** of
  those apps. Origination proves it belongs stylistically; repetition proves it
  is general rather than one app's domain. Without this second rule, SkillDecks'
  trading-card artwork qualifies — real Quill-styled work that has no business
  in a design system.

## How it works

### 1. Finding the apps

No hard-coded list. The scan asks GitHub for every repo in the `craftwell-ai`
organization, then checks each one for Quill's colors-and-fonts file
(`app/quill-theme.css`, or a `components.json` pointing at the Quill registry
URL). Found → scanned. Not found → skipped entirely.

This makes the origination rule mechanical rather than a convention someone has
to remember. It also handles a real trap: `retail-ds` and `scaffold` both
mention Quill, but only because they were generated from the same template — they
carry no Quill styling, so they are correctly ignored. `design_handoff_portfolio_site`
showcases Quill but renders no product UI, and is likewise ignored.

SkillDecks is currently under the `phillipsry` account and will appear in the
scan automatically once it moves to `craftwell-ai`. No code change needed. Until
then the scan covers Command Deck and Craftwell Command Center, which is already
enough — all four current candidates appear in both.

### 2. Reading an app

Checking for the marker file uses one GitHub contents call per repo — cheap, and
no clone needed to rule a repo out. An app that passes is then cloned shallow
(`--depth 1`) into a temporary directory, because reading every component through
the API would be hundreds of calls. The clone is deleted at the end of the run.

Component files are every `.tsx` under `components/` (all three apps use that
directory), recursively, excluding `node_modules`, `.next`, and any `*.test.tsx`
or `*.stories.tsx`.

### 3. Sorting each component

Every component file in each app lands in one of three buckets:

| Bucket | Meaning |
|---|---|
| Name matches a Quill registry item | Findability problem → "already had it" list |
| Name matches a stock off-the-shelf component | Installed, not built → ignored |
| Neither | Hand-built and unknown to Quill → candidate pool |

The stock list (button, dialog, tooltip, …) is a constant in the script, because
Quill deliberately does not re-ship primitives — it ships the theme, two
components, and 51 blocks. That list changes slowly and needs occasional
updating. A name missing from it produces one extra candidate to eyeball, never a
wrong promotion, so the failure direction is safe.

### 4. Deciding something is a real pattern

Two tiers, reported separately, because the confidence genuinely differs:

- **Confirmed repeats** — the same name in two or more apps, normalising for
  naming style (`AgentAvatar` and `agent-avatar` are one thing).
- **Possible repeats** — different names sharing a distinctive word, so they may
  be the same idea. Read with more suspicion.

Common structural words (`card`, `panel`, `view`, `row`, `list`) are excluded
from matching, or every card-shaped component in every app collapses into one
meaningless cluster.

### 5. What the report contains

Written to the workflow's run summary, to standard output, and to the tracking
issue comment, in this order:

1. **Apps scanned** — and which marker identified each as Quill-styled.
2. **Candidates** — confirmed repeats first, then possible ones. Each entry
   lists the apps it appears in, the file path in each, the line count of each
   version, and what each version is built from.
3. **Already decided** — candidates on the decided list, with the decision and
   why. Listed, never hidden, but kept out of the fresh-candidates section.
4. **Already in Quill but rebuilt** — the findability list, naming the Quill
   block that already covers it.
5. **Couldn't read** — anything skipped, counted by the reader that skipped it,
   never inferred by subtraction.

A week with nothing new still posts, saying so in one line. Silence would be
indistinguishable from a broken scan.

The line counts and import lists in (2) are the point. They are what let a
candidate be judged without opening three repos. Worked example from today's
data: agent avatar appears in all three apps, so it looks like an obvious win —
but the three versions are 44, 78 and 31 lines and are built from
`lucide-react`, `next/image` + `node:fs`, and `next/image` + a preset manifest
respectively. Seeing that side by side is what reveals they share a name and
little else, and that the honest promotion may be a status dot on the existing
avatar rather than a new `AgentAvatar` block.

### 6. How it reaches Ryan

**Every Monday, whether or not anything is new.**

A passing scheduled workflow emails nobody — GitHub only notifies on failure. So
"fail the run to get an email" would mean a red check every week, which trains
everyone to ignore red. Instead the scan posts the report as a **comment on one
long-lived tracking issue**, found by the `pattern-scan` label and created on
first run if absent. Ryan is assigned to that issue, so he is subscribed and
every comment notifies him.

One issue with 52 comments rather than 52 issues: the history stays in one
chronological thread, and there is one notification stream instead of a growing
pile of open issues. It uses the workflow's own default token with
`issues: write` — no new service, no new secret for this part.

**The run exits non-zero only when the scan itself broke** — could not list the
organisation, could not clone an app it had identified, could not write the
comment. Red means "the scan is not working," never "there is news." That keeps
the drift-audit contract intact: a red check is always something to fix.

`scripts/pattern-scan.decided.json` still exists, with a narrower job. Candidates
already ruled on are listed in their own **Already decided** section of the
report rather than in the fresh-candidates list, so the weekly report never
re-litigates the same four patterns — but it also never hides them. The file is
a flat list keyed by the normalised pattern name, carrying the decision and why,
so a year from now the record says what was thought and not just that something
was dismissed:

```json
[
  { "pattern": "agent-avatar", "decision": "declined", "date": "2026-07-29",
    "why": "three implementations share a name and little else; revisit as a status dot on avatar" },
  { "pattern": "autonomy-ladder", "decision": "promoted", "date": "2026-08-03",
    "why": "shipped as block 52" }
]
```

`decision` is `promoted` or `declined`. A declined pattern can be reconsidered by
deleting its entry, which is how it re-enters the report.

### 7. What it never does

Read-only. It opens no pull requests, writes no components, and changes nothing
in Quill or in any scanned app. Promotion is entirely manual. It uses no AI —
plain text matching only — so it cannot be confidently wrong the way
`claude-repair.yml` could, and needs no fencing.

## Files

| Path | Purpose |
|---|---|
| `scripts/pattern-scan.mjs` | The scan. Read-only, deterministic, no AI. |
| `scripts/pattern-scan.test.mjs` | Tests, run by `npm run test:tokens`. |
| `scripts/pattern-scan.decided.json` | Candidates already ruled on. |
| `.github/workflows/pattern-scan.yml` | Weekly schedule + manual trigger. |
| `package.json` | Adds `pattern-scan` script. |

Separate from `drift-audit.yml` on purpose. The drift audit turns red on
actionable security advisories; folding pattern findings into it would either
mute them or pollute that signal.

## Setup this depends on

- **A new read-only access token.** Fine-grained, scoped to the `craftwell-ai`
  organization, `Contents: read` only — strictly less privilege than the existing
  `AUTOMATION_TOKEN`, which needs write access to open PRs. Stored as
  `PATTERN_SCAN_TOKEN`. Without it the scan reports that it could not list the
  organization and exits 0, rather than failing silently or looking like a clean
  result.
- **Nothing else.** No new dependency, no service, no background process on any
  machine.

## Testing

`node --test`, matching the existing script tests:

- Name normalisation: `AgentAvatar`, `agent-avatar`, `agent_avatar` collapse to
  one key.
- The two-app threshold: a pattern in one app is never a candidate.
- Structural stopwords: two unrelated `*Card` components do not cluster.
- Quill cross-reference: a component named after a Quill block lands in the
  findability list, not the candidate list.
- Origination gate: a repo without a Quill marker is never scanned, asserted
  against a fixture that mentions Quill but has no token layer — the
  `retail-ds`/`scaffold` case.
- The decided-list moves a candidate into the "already decided" section rather
  than dropping it, and an empty or missing file is treated as "nothing decided
  yet", never an error.
- Exit code is 0 with candidates present and 0 with none; non-zero only on a
  scan failure (org unlistable, clone failed, comment not written).

## Validation baseline

The hand survey of 2026-07-28 was **semantic** — a person reading files and
recognising that `update-feed` is an activity feed. The scan matches on **names**.
So the scan should reproduce the name-matchable *subset* of the baseline, not all
of it. Claiming otherwise would make a working scan look broken.

**Confirmed by the first real run (2026-07-29):** `agent-avatar` (3 apps),
`autonomy-ladder` (2), `app-sidebar` (2); possible repeats keyed `crew`, `queue`,
`shell`; rebuilt blocks `ActivityFeed`, `EmptyState`, `PageHeader`,
`ThemeSelector`.

**Found by the scan but missed by the hand survey:** `app-sidebar` and the
`app-shell`/`MobileShell` pair. The hand survey had folded `app-sidebar` into
"duplicates `sidebar-nav`", but the names differ, so treating it as a fresh
candidate is the defensible call.

**In the baseline but invisible to name matching**, and stated in every report so
an incomplete list never reads as complete: `update-feed` → `activity-feed`,
`vitals-strip` → `stat-cards`, `OpsCharts` → `analytics-charts`, `auth-form` →
`login`. The rebuilt list is a floor, not a total.

**Two false alarms the first run produced, and how they were closed.** It reported
Craftwell's correctly-installed `components/ui/tone-badge.tsx` and
`components/ui/icon.tsx` as rebuilds. Quill's registry declares where every item
installs — `components/ui/<name>.tsx` for components, `components/quill/<name>.tsx`
for blocks — so a file at its declared target is Quill's own, not a copy of it.
Reading those targets from the registry keeps this honest by construction rather
than by guessing at paths. It also clustered `app-shell` with `AppBar` on the word
`app` and `SignOutButton` with `google-button` on `button`; both are shape words
and are now stopwords, which also stopped `app-shell` appearing in two clusters at
once.

**Candidates (in both Command Deck and Craftwell Command Center):**

| Pattern | Command Deck | Craftwell CC | SkillDecks |
|---|---|---|---|
| agent avatar | `deck/agent-avatar` | `AgentAvatar` | `agents/agent-avatar` |
| autonomy ladder | `deck/autonomy-ladder` | `AutonomyLadder` | — |
| approval / review queue | `approval-card`, `approval-queue` | `QueueCard`, `ReviewActions`, `DecisionActions` | — |
| crew roster | `deck/crew-rail` | `CrewMap` | — |

**Already in Quill but rebuilt:**

| Rebuilt as | Quill already ships |
|---|---|
| `theme-toggle`, `ThemeSelector` | `theme-selector` |
| `EmptyState` | `empty-state` |
| `PageHeader` | `page-header` |
| `ActivityFeed`, `update-feed` | `activity-feed` |
| `auth-form`, `forgot-password-form`, `google-button` | `login`, `forgot-password`, `login-oauth` |
| `OpsCharts` | `analytics-charts` |
| `vitals-strip` | `stat-cards`, `stats-band` |

The SkillDecks column and the last three findability rows only appear once
SkillDecks has moved to `craftwell-ai`.

## Deliberately not in scope

- **Structural comparison.** Parsing each component to compare what it actually
  renders would catch renamed patterns and would show that the three agent
  avatars diverge. It costs a parser dependency and much more code, for a weekly
  report. Revisit only if name matching proves too noisy in practice.
- **AI judgement.** Best at spotting semantic similarity and describing a shared
  core, and exactly the failure mode `DRIFT-AUDIT.md` fences off: a confident
  wrong answer is indistinguishable from a confident right one. Also needs an
  `ANTHROPIC_API_KEY` that is not currently set.
- **Opening PRs for candidates.** Given three same-named agent avatars that share
  almost no implementation, a scaffolded component would encode a judgement the
  scan has not earned.
- **Promoting anything.** A separate manual act, on Ryan's call, following the
  normal branch → PR → CI → merge flow with a version bump and CHANGELOG entry.

## Where a promoted pattern lands

Into Quill core. The registry is 1 base item (the theme), 2 `registry:ui`
components (`icon`, `tone-badge`), and 51 blocks. A promoted component becomes
the third `registry:ui` item; a promoted page-section becomes block 52. Both
paths exist already, so nothing about the registry structure needs to change.
