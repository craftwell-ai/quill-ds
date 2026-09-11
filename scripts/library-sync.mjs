/**
 * Quill library sync — pushes a released design-system update out to the apps.
 *
 * The registry model copies code INTO each app at install time (that is what
 * makes apps immune to upstream changes at load time) — which means a release
 * changes nothing anywhere until every app re-pulls the items it uses. This
 * script is that re-pull, mechanised: when a release publishes, it finds every
 * Quill-styled app the same way the pattern scan does, rewrites the items each
 * app already has from the released registry output, and opens one PR per app
 * that merges itself once that app's own checks pass.
 *
 * Design decisions, each load-bearing:
 * - Files come from the COMMITTED `public/r/*.json` of the released commit,
 *   never from the live site. CI's generated-files gate guarantees they match
 *   source, and reading them locally removes the race with the production
 *   deploy that is still running when the release event fires.
 * - Files are written directly rather than via `npx shadcn add`. Items ship
 *   complete file contents, an app already holds every npm dependency of the
 *   items it installed, and a deterministic write beats a network install in
 *   CI. The one thing a direct write cannot deliver — an item that GAINED an
 *   npm dependency — is named in the PR body, and the app's own CI fails the
 *   PR if the gap is real.
 * - Only items the app already has are touched. The sync updates; it never
 *   installs anything new into an app.
 * - Merging defers to each app: `--auto` where the repo's protection supports
 *   it, a watch-then-merge when it doesn't, a direct merge when the app
 *   declares no checks at all, and an OPEN PR plus a loud summary line when a
 *   check fails. Green merges, red waits for a human — the same rule as
 *   everywhere else in this repo.
 *
 * Exit code: non-zero when the SYNC is broken — no token, the token lists no
 * repositories, a clone or push refused. An app left un-merged is reported,
 * never fatal: that is the safety net doing its job, not a sync failure. That
 * covers a red check AND the case where no merge route exists at all — an app
 * that requires no checks gives GitHub nothing to wait for, so `--auto` is
 * refused, and fine-grained PATs can no longer be granted `Checks: read`
 * (verified 2026-09-09) so the poll cannot read CheckRun results either. The
 * update is still written, pushed and proposed; only the merge waits for a
 * human. Failing the run for that turned every release red for two apps, which
 * is precisely the recurring false alarm scripts/DRIFT-AUDIT.md exists to
 * prevent.
 *
 * Local dry run (clones read-only, writes nothing, opens nothing):
 *   DRY_RUN=1 SYNC_TOKEN="$(gh auth token)" node scripts/library-sync.mjs
 */
import { execFileSync } from 'node:child_process'
import {
  readFileSync,
  writeFileSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  appendFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { hasQuillMarker } from './pattern-scan.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const API = 'https://api.github.com'
const SELF_NAME = 'quill-ds'

// --- Planning (pure, tested) ---

/**
 * Every installable item with its released file contents, read from the built
 * registry output. The index (registry.json) names the items; the built
 * `public/r/<name>.json` files carry `target` + `content` per file, which is
 * everything a write needs.
 */
export function readRegistryItems(repoRoot) {
  const index = JSON.parse(readFileSync(join(repoRoot, 'registry.json'), 'utf8'))
  return (index.items ?? []).map((i) =>
    JSON.parse(readFileSync(join(repoRoot, 'public/r', `${i.name}.json`), 'utf8')),
  )
}

/**
 * What to write in one app. `appPaths` is the app's committed file list.
 *
 * An item counts as installed when any of its declared targets exists — at the
 * plain path or under `src/`, because shadcn roots its writes in `src/` when
 * the app has one. Every file of an installed item is rewritten, so an item
 * that gains a file in a release still arrives complete; a new file follows
 * the root its siblings already use. Items the app never installed are left
 * alone entirely.
 */
export function planSync(items, appPaths) {
  const present = new Set(appPaths)
  const resolve = (t) => (present.has(`src/${t}`) ? `src/${t}` : present.has(t) ? t : null)
  const writes = []
  const itemNames = []
  const npmDeps = []
  for (const item of items) {
    const files = (item.files ?? []).filter(
      (f) => typeof f.target === 'string' && typeof f.content === 'string',
    )
    const anchors = files.map((f) => resolve(f.target)).filter(Boolean)
    if (anchors.length === 0) continue
    itemNames.push(item.name)
    for (const dep of item.dependencies ?? []) if (!npmDeps.includes(dep)) npmDeps.push(dep)
    const useSrc = anchors[0].startsWith('src/')
    for (const f of files) {
      writes.push({
        path: resolve(f.target) ?? (useSrc ? `src/${f.target}` : f.target),
        content: f.content,
      })
    }
  }
  return { writes, itemNames, npmDeps }
}

/**
 * Perform (or, dry, just measure) the planned writes. A file whose content
 * already matches is skipped, so "changed" is a real diff, not a touch — an
 * app already in sync produces no branch, no PR, no noise.
 */
export function applyPlan(appDir, writes, { dryRun = false } = {}) {
  const changed = []
  for (const w of writes) {
    const abs = join(appDir, w.path)
    let current = null
    try {
      current = readFileSync(abs, 'utf8')
    } catch {
      /* new file */
    }
    if (current === w.content) continue
    if (!dryRun) {
      mkdirSync(dirname(abs), { recursive: true })
      writeFileSync(abs, w.content)
    }
    changed.push(w.path)
  }
  return changed
}

/**
 * One verdict over a PR's status-check rollup. GitHub reports two shapes —
 * check runs (status/conclusion) and status contexts (state) — and the merge
 * decision needs one word: does anything block, is anything still running,
 * or is everything green? "none" is its own verdict because a repo with no
 * checks at all is green-by-absence, not pending-forever.
 */
export function checkVerdict(rollup) {
  if (!rollup || rollup.length === 0) return 'none'
  let pending = false
  for (const c of rollup) {
    const state = String(c.conclusion || c.state || c.status || '').toUpperCase()
    if (
      ['FAILURE', 'ERROR', 'TIMED_OUT', 'CANCELLED', 'ACTION_REQUIRED', 'STARTUP_FAILURE'].includes(
        state,
      )
    )
      return 'fail'
    if (!['SUCCESS', 'NEUTRAL', 'SKIPPED'].includes(state)) pending = true
  }
  return pending ? 'pending' : 'pass'
}

// --- I/O shell ---

export function run(cmd, args, opts = {}) {
  try {
    return execFileSync(cmd, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...opts,
    })
  } catch (err) {
    // execFileSync's message is only the command line — the REASON lives in
    // stderr, which was being dropped. A push rejected for "stale info" and a
    // push rejected for "permission denied" looked identical in the summary,
    // which cost a debugging cycle on 2026-09-09. Attach stderr, trimmed.
    const stderr = String(err?.stderr ?? '').trim()
    if (stderr) err.message = `${err.message}\n${stderr.split('\n').slice(0, 4).join('\n')}`
    throw err
  }
}

async function gh(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}`)
  return res.json()
}

/**
 * Which of the owner's repos are Quill-styled — the same rule and the same
 * loud denominator as the pattern scan: `/user/repos` (the authenticated
 * account's own repos, the only listing that includes private ones), one
 * cheap tree call per repo, the marker file decides, and a repo whose tree
 * cannot be read is NAMED, never silently skipped.
 */
async function discoverApps(token) {
  const repos = await gh('/user/repos?per_page=100&affiliation=owner', token)
  if (!Array.isArray(repos) || repos.length === 0) {
    throw new Error('the token listed no repositories — check it belongs to the account owning the apps')
  }
  const apps = []
  const seen = { listed: repos.length, considered: 0, unreadable: [] }
  for (const repo of repos) {
    if (repo.name === SELF_NAME || repo.archived) continue
    seen.considered++
    let paths = []
    try {
      const tree = await gh(
        `/repos/${repo.owner.login}/${repo.name}/git/trees/${repo.default_branch}?recursive=1`,
        token,
      )
      paths = (tree.tree ?? []).map((t) => t.path)
    } catch (err) {
      seen.unreadable.push({ name: repo.name, reason: err.message })
      continue
    }
    const marker = hasQuillMarker(paths)
    if (marker) {
      apps.push({
        full: `${repo.owner.login}/${repo.name}`,
        name: repo.name,
        defaultBranch: repo.default_branch,
        cloneUrl: repo.clone_url,
        marker,
      })
    }
  }
  return { apps, seen }
}

function cloneShallow(app, token, into) {
  const dest = join(into, app.name)
  const url = app.cloneUrl.replace('https://', `https://x-access-token:${token}@`)
  run('git', ['clone', '--depth', '1', '--quiet', url, dest])
  return dest
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Merge the sync PR the way the app wants it merged. `--auto` first — that is
 * GitHub's own "once required checks pass" and respects the app's protection
 * rules. A repo without protection refuses `--auto`, so fall back to watching
 * the rollup ourselves: no checks at all (after a grace period for late
 * registration) merges now, all green merges, anything red leaves the PR open
 * for a human. Returns one word for the summary.
 */
async function mergeWhenGreen(repo, branch) {
  try {
    run('gh', ['pr', 'merge', branch, '--repo', repo, '--auto', '--merge'])
    return 'auto-merge armed'
  } catch {
    // Refused for one of two reasons, neither fatal: the repo has auto-merge
    // disabled, or nothing is blocking the PR so GitHub has nothing to wait
    // for. Fall through and watch the checks ourselves.
  }
  const started = Date.now()
  const deadline = started + 15 * 60_000
  const grace = started + 90_000
  while (Date.now() < deadline) {
    let rollup
    try {
      rollup = JSON.parse(
        run('gh', ['pr', 'view', branch, '--repo', repo, '--json', 'statusCheckRollup']),
      ).statusCheckRollup
    } catch {
      // Neither merge route is open: `--auto` was refused and the check rollup
      // cannot be read. That is NOT a failed sync — the update was written,
      // pushed and proposed; only the merge is left to a human. Treating it as
      // fatal turned every release red for the two apps that require no checks,
      // which is the recurring false alarm scripts/DRIFT-AUDIT.md exists to
      // prevent: a maintenance bot you learn to ignore is worse than none.
      //
      // Two causes, and the distinction is worth keeping in the summary:
      //   - the app requires no checks, so GitHub refuses to arm auto-merge
      //     (nothing is blocking the PR). Enable a required check to fix.
      //   - fine-grained PATs can no longer be granted `Checks: read` at all
      //     (verified 2026-09-09), so the poll cannot see CheckRun results.
      // Either way the PR is open and correct; say so and move on.
      return 'PR open — no auto-merge available and check status unreadable, left for review'
    }
    const verdict = checkVerdict(rollup)
    if (verdict === 'fail') return 'checks failed — PR left open'
    if (verdict === 'pass' || (verdict === 'none' && Date.now() > grace)) {
      run('gh', ['pr', 'merge', branch, '--repo', repo, '--merge'])
      return verdict === 'pass' ? 'merged (checks green)' : 'merged (app declares no checks)'
    }
    await sleep(20_000)
  }
  return 'checks still pending after 15m — PR left open'
}

// Exported for testing. One app's failure must never abort the fleet: each app
// is attempted independently, failures are collected, and the caller decides the
// exit code. This existed as a bare loop inside the outer try until 2026-09-09,
// so the first throw unwound everything — when LIBRARY_SYNC_TOKEN lost
// Checks: read, app #1 threw and apps #2-4 were never touched. 29 consecutive
// releases failed that way, each reporting "4 repos examined" and zero results.
/**
 * How far behind is an app, from its own sync-PR history?
 *
 * No state file and no commit-back: the app's `quill-sync/*` pull requests ARE
 * the record of what it has taken. Give it that list (newest first) and it
 * returns the last version that actually merged, plus how many releases since
 * were delivered and did not.
 *
 * Why this exists: tech-careers took no Quill release for six consecutive
 * versions (v0.8.30 -> v0.9.4). Every run reported "auto-merge armed" and every
 * PR was closed by the next release as superseded. The bot was behaving exactly
 * as designed — green merges, red waits for a human — but the only place that
 * showed was a PR nobody opens, so nobody looked for seventeen days.
 *
 * One missed release is normal: the PR is in flight, or its checks are still
 * running. Two consecutive is a pattern, and that is what gets shouted about.
 */
export function staleness(prs, currentVersion) {
  // Must anchor on the branch prefix: a bare `.replace()` returns an unrelated
  // ref unchanged, which is truthy, so `feature/whatever` would be counted as a
  // missed release. Caught by test, not by reading.
  const versionOf = (pr) => (pr.head?.ref ?? '').match(/^quill-sync\/v?(.+)$/)?.[1] ?? null
  const sorted = [...prs].filter((pr) => versionOf(pr))
  const mergedIdx = sorted.findIndex((pr) => pr.merged_at)
  const lastMerged = mergedIdx === -1 ? null : versionOf(sorted[mergedIdx])
  // Everything newer than the last merged one was delivered and not taken —
  // excluding the release happening right now, which has not had its chance yet.
  const missed = (mergedIdx === -1 ? sorted : sorted.slice(0, mergedIdx))
    .map(versionOf)
    .filter((v) => v !== currentVersion)
  return { lastMerged, missed }
}

const STALE_AFTER = 2 // consecutive missed releases before this turns loud

export async function appStaleness(app, token, currentVersion) {
  const prs = await gh(
    `/repos/${app.full_name}/pulls?state=all&per_page=30&sort=created&direction=desc`,
    token,
  )
  return staleness(Array.isArray(prs) ? prs : [], currentVersion)
}

export async function syncApps(apps, syncOne, say = () => {}) {
  const failed = []
  for (const app of apps) {
    try {
      await syncOne(app)
    } catch (err) {
      failed.push(app.name)
      // Keep the stderr run() attaches — truncating to line 1 hid the real
      // reason, which is why a "stale info" rejection read as a bare failure.
      const why = String(err?.message ?? err).split('\n').map((l) => l.trim()).filter(Boolean).join(' · ')
      say(`- \`${app.name}\` — SYNC FAILED: ${why.slice(0, 400)}`)
    }
  }
  return failed
}

export async function main() {
  const token = process.env.SYNC_TOKEN
  const dryRun = Boolean(process.env.DRY_RUN)
  if (!token) {
    console.error(
      'library sync failed: no SYNC_TOKEN — set the LIBRARY_SYNC_TOKEN secret ' +
        '(fine-grained PAT, All repositories, Contents + Pull requests read/write). ' +
        'AUTOMATION_TOKEN cannot substitute: it is scoped to quill-ds only.',
    )
    process.exitCode = 1
    return
  }
  const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
  const branch = `quill-sync/v${version}`
  const items = readRegistryItems(root)
  const lines = [`# Quill library sync — v${version}`, '']
  const say = (s = '') => {
    lines.push(s)
    console.log(s)
  }

  let tmp = null
  try {
    const { apps, seen } = await discoverApps(token)
    // The denominator, always: "0 synced of 8 examined" and "0 of 1" mean
    // completely different things, and only one of them is a token problem.
    say(
      `_${apps.length} Quill-styled of ${seen.considered} repo(s) examined ` +
        `(${seen.listed} visible to the token, minus ${SELF_NAME} itself)._`,
    )
    for (const u of seen.unreadable) say(`- could not read \`${u.name}\` — ${u.reason}`)
    if (apps.length === 0 && seen.considered <= 1) {
      say()
      say('> The token can reach almost nothing — check its repository access.')
    }
    say()

    tmp = mkdtempSync(join(tmpdir(), 'library-sync-'))
    // One app must never abort the fleet. The per-app body used to sit bare
    // inside the outer try, so the first failure unwound the whole loop: when
    // LIBRARY_SYNC_TOKEN lost Checks: read, app #1 threw and apps #2-4 were
    // never touched — 29 consecutive failed releases reported "4 repos",
    // "0 results". Failures are collected and reported together instead.
    // Delivered but not merged is a normal terminal state, not a failure —
    // tracked separately so it stays visible without turning the run red.
    const needsReview = []
    const failed = await syncApps(
      apps,
      async (app) => {
        const dir = cloneShallow(app, token, tmp)
        const appPaths = run('git', ['-C', dir, 'ls-files']).split('\n').filter(Boolean)
        const plan = planSync(items, appPaths)
        const changed = applyPlan(dir, plan.writes, { dryRun })
        if (changed.length === 0) {
          say(`- \`${app.name}\` — already in sync (${plan.itemNames.length} items checked)`)
          return
        }
        if (dryRun) {
          say(`- \`${app.name}\` — WOULD update ${changed.length} file(s): ${changed.join(', ')}`)
          return
        }

        run('git', ['-C', dir, 'config', 'user.name', 'github-actions[bot]'])
        run('git', [
          '-C',
          dir,
          'config',
          'user.email',
          '41898282+github-actions[bot]@users.noreply.github.com',
        ])
        run('git', ['-C', dir, 'checkout', '-B', branch])
        run('git', ['-C', dir, 'add', '--', ...changed])
        run('git', ['-C', dir, 'commit', '-m', `chore(quill): sync design system to v${version}`])
        // `--force-with-lease` needs to know what we last saw upstream. The clone
        // is `--depth 1` of the default branch only, so when the sync branch
        // ALREADY exists upstream — a re-run, or a previous release whose PR is
        // still open — there is nothing to compare against and git rejects the
        // push with "stale info" without looking at anything.
        //
        // Fetching the branch into a tracking ref is NOT enough on its own: the
        // bare `--force-with-lease` still rejects, because it wants a reflog it
        // considers authoritative and a shallow explicit-refspec fetch does not
        // give it one. Verified against a real clone on 2026-09-09. So lease
        // against the exact object we fetched instead, which is deterministic.
        let lease = null
        try {
          run('git', ['-C', dir, 'fetch', '--depth', '1', 'origin', `${branch}:refs/remotes/origin/${branch}`])
          lease = run('git', ['-C', dir, 'rev-parse', `refs/remotes/origin/${branch}`]).trim()
        } catch {
          /* branch is new upstream — the bare form is correct, it creates it */
        }
        run('git', [
          '-C', dir, 'push',
          lease ? `--force-with-lease=${branch}:${lease}` : '--force-with-lease',
          'origin', branch,
        ])

        // A stale sync PR from an EARLIER release is superseded, not stacked:
        // close it so the app never holds two competing updates.
        const open = JSON.parse(
          run('gh', ['pr', 'list', '--repo', app.full, '--state', 'open', '--json', 'number,headRefName']),
        )
        for (const pr of open) {
          if (pr.headRefName.startsWith('quill-sync/') && pr.headRefName !== branch) {
            run('gh', [
              'pr',
              'close',
              String(pr.number),
              '--repo',
              app.full,
              '--comment',
              `Superseded by the v${version} sync.`,
              '--delete-branch',
            ])
          }
        }

        if (!open.some((pr) => pr.headRefName === branch)) {
          const deps = plan.npmDeps.length
            ? `\n\n> [!NOTE]\n> The updated items declare these npm packages: ${plan.npmDeps
                .map((d) => `\`${d}\``)
                .join(', ')}. An already-installed app has them; if this PR's build fails on a missing module, add the package.\n`
            : ''
          const body =
            `Re-pulls the Quill items this app already uses, updated in ` +
            `[quill-ds v${version}](https://github.com/craftwell-ai/${SELF_NAME}/releases/tag/v${version}).\n\n` +
            `Items: ${plan.itemNames.map((n) => `\`${n}\``).join(', ')}\n` +
            `Files: ${changed.map((c) => `\`${c}\``).join(', ')}${deps}\n\n` +
            `Opened by \`library-sync.yml\` in ${SELF_NAME}. Merges itself once this repo's checks pass; ` +
            `a red check leaves it open for a human.`
          run('gh', [
            'pr',
            'create',
            '--repo',
            app.full,
            '--base',
            app.defaultBranch,
            '--head',
            branch,
            '--title',
            `chore(quill): sync design system to v${version}`,
            '--body',
            body,
          ])
        }

        const outcome = await mergeWhenGreen(app.full, branch)
        if (outcome.startsWith('PR open') || outcome.startsWith('checks failed')) needsReview.push(app.name)
        say(`- \`${app.name}\` — ${changed.length} file(s) updated → ${outcome}`)
      },
      say,
    )
    if (needsReview.length) {
      say()
      say(`${needsReview.length} app(s) delivered but waiting on a human: ${needsReview.join(', ')}`)
    }

    // The alarm. Delivering is not the same as landing, and until now the only
    // record of the difference was a PR in someone else's repo. An app that has
    // skipped STALE_AFTER releases gets shouted about in the run summary, where
    // a human actually looks. Still never fatal: a red check is the safety net
    // working, and failing the run for it turned every release red for two apps
    // (see scripts/DRIFT-AUDIT.md on recurring false alarms).
    const behind = []
    for (const app of apps) {
      try {
        const { lastMerged, missed } = await appStaleness(app, token, version)
        if (missed.length >= STALE_AFTER) behind.push({ app: app.name, lastMerged, missed })
      } catch (err) {
        say(`- could not read \`${app.name}\`'s sync history — ${String(err?.message ?? err).slice(0, 120)}`)
      }
    }
    if (behind.length) {
      say()
      say('> [!WARNING]')
      say('> **Apps are falling behind.** These were delivered a release and did not take it,')
      say(`> for at least ${STALE_AFTER} consecutive versions. Each sync closes the last PR as`)
      say('> superseded, so the backlog is invisible unless someone opens that repo:')
      say('>')
      for (const b of behind) {
        say(
          `> - \`${b.app}\` — last took **v${b.lastMerged ?? '(never)'}**, ` +
            `missed ${b.missed.length}: ${b.missed.map((v) => `v${v}`).join(', ')}`,
        )
      }
      say('>')
      say("> Check that app's own CI on the open `quill-sync/*` PR — the sync itself is fine.")
    }
    if (failed.length) {
      say()
      say(`${failed.length} of ${apps.length} app(s) failed to sync: ${failed.join(', ')}`)
      process.exitCode = 1
    }
  } catch (err) {
    // Non-zero means the SYNC is broken, never "an app's checks are red".
    say(`library sync failed: ${err.message}`)
    process.exitCode = 1
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true })
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
