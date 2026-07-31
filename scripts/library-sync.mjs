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
 * repositories, a clone or push refused. An app left un-merged because its
 * checks failed is reported, never fatal: that is the safety net doing its
 * job, not a sync failure.
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

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  })
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
    /* no branch protection — watch the checks ourselves */
  }
  const started = Date.now()
  const deadline = started + 15 * 60_000
  const grace = started + 90_000
  while (Date.now() < deadline) {
    const rollup = JSON.parse(
      run('gh', ['pr', 'view', branch, '--repo', repo, '--json', 'statusCheckRollup']),
    ).statusCheckRollup
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
    for (const app of apps) {
      const dir = cloneShallow(app, token, tmp)
      const appPaths = run('git', ['-C', dir, 'ls-files']).split('\n').filter(Boolean)
      const plan = planSync(items, appPaths)
      const changed = applyPlan(dir, plan.writes, { dryRun })
      if (changed.length === 0) {
        say(`- \`${app.name}\` — already in sync (${plan.itemNames.length} items checked)`)
        continue
      }
      if (dryRun) {
        say(`- \`${app.name}\` — WOULD update ${changed.length} file(s): ${changed.join(', ')}`)
        continue
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
      run('git', ['-C', dir, 'push', '--force-with-lease', 'origin', branch])

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
      say(`- \`${app.name}\` — ${changed.length} file(s) updated → ${outcome}`)
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
