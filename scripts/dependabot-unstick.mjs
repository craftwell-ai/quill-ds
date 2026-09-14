/**
 * Dependabot unstick — asks Dependabot to recreate a pull request the
 * self-healing loop left stranded.
 *
 * The shape of the stall (CRA-207): a dependency PR fails CI on generated-file
 * drift, `dependabot-regenerate.yml` pushes the rebuilt files, and from that
 * moment Dependabot stops rebasing the branch — another actor has committed to
 * it. `main` keeps moving (every release bumps package.json, the lockfile and
 * llms.txt), so the PR turns BEHIND (protection requires up-to-date branches)
 * or DIRTY (conflicting). GitHub runs no `pull_request` workflow on a
 * conflicting PR, so the required check never reports and auto-merge waits
 * forever. #135 sat that way for days; its recreation #162 was DIRTY again
 * within hours on a busy release day.
 *
 * The fix is Dependabot's own command: `@dependabot recreate` rebuilds the PR
 * from scratch on the current base. CI runs again, the regenerate workflow
 * pushes again if the bump moves generated files, and auto-merge lands it once
 * `main` holds still. Dependabot honours commands only from a user with write
 * access, so the workflow comments with AUTOMATION_TOKEN (a user PAT), never
 * the default GITHUB_TOKEN.
 *
 * Idempotent by construction: a PR that already carries a recreate request
 * newer than its head commit is left alone (Dependabot has not acted yet), and
 * a head commit younger than SETTLE_MS is left alone too (CI or the regenerate
 * workflow may still be running). Never fatal for an app-level reason; the run
 * summary says what was asked and what was skipped.
 *
 * Dry run: DRY_RUN=1 GH_TOKEN="$(gh auth token)" node scripts/dependabot-unstick.mjs
 */
import { appendFileSync } from 'node:fs'

import { run } from './library-sync.mjs'

export const COMMAND = '@dependabot recreate'
export const STUCK = new Set(['DIRTY', 'BEHIND'])
export const SETTLE_MS = 10 * 60_000

const isDependabot = (commit) => (commit?.authors ?? []).some((a) => /dependabot/i.test(a?.login ?? ''))

/**
 * One verdict per open Dependabot PR. `pr` is the `gh pr list --json` shape:
 * mergeStateStatus, commits[{authors,committedDate}], comments[{body,createdAt}].
 */
export function decide(pr, now = Date.now()) {
  if (!STUCK.has(pr.mergeStateStatus)) return { action: 'skip', why: `state is ${pr.mergeStateStatus ?? 'unknown'}` }
  const head = pr.commits?.[pr.commits.length - 1]
  const headAt = head?.committedDate ? Date.parse(head.committedDate) : 0
  if (now - headAt < SETTLE_MS) return { action: 'skip', why: 'the head commit is still settling' }
  const asked = (pr.comments ?? []).some(
    (c) => typeof c.body === 'string' && c.body.includes(COMMAND) && Date.parse(c.createdAt ?? 0) > headAt,
  )
  if (asked) return { action: 'skip', why: 'a recreate was already requested since the last commit' }
  const foreign = head && !isDependabot(head) ? ' after a non-Dependabot push' : ''
  return { action: 'recreate', why: `${pr.mergeStateStatus}${foreign}` }
}

export function main() {
  const dryRun = Boolean(process.env.DRY_RUN)
  const lines = ['# Dependabot unstick', '']
  const say = (s = '') => {
    lines.push(s)
    console.log(s)
  }
  try {
    const prs = JSON.parse(
      run('gh', ['pr', 'list', '--author', 'app/dependabot', '--state', 'open', '--json', 'number,title,mergeStateStatus,commits,comments']),
    )
    if (prs.length === 0) say('No open Dependabot pull requests.')
    for (const pr of prs) {
      const d = decide(pr)
      if (d.action !== 'recreate') {
        say(`- #${pr.number} — left alone (${d.why})`)
        continue
      }
      if (!dryRun) {
        run('gh', [
          'pr', 'comment', String(pr.number), '--body',
          `${COMMAND}\n\n_Asked by dependabot-unstick.yml: the branch is ${pr.mergeStateStatus}, and Dependabot stops rebasing once another commit lands on it._`,
        ])
      }
      say(`- #${pr.number} — ${dryRun ? 'WOULD ask' : 'asked'} Dependabot to recreate (${d.why})`)
    }
  } catch (err) {
    say(`dependabot unstick failed: ${String(err?.message ?? err).split('\n')[0]}`)
    process.exitCode = 1
  } finally {
    if (process.env.GITHUB_STEP_SUMMARY) {
      try {
        appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n')
      } catch {
        /* best-effort */
      }
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main()
