// scripts/build-icons.mjs
//
// Icon delivery: sync core + lazy long-tail (see
// docs/superpowers/specs/2026-07-02-icon-delivery-optimization-design.md).
//
// Emits four artifacts from @material-symbols/svg-200 (outlined):
//   1. src/components/ui/icons.core.mjs        — SYNC map of the CORE set (committed).
//        Core = icons actually used in src (`<Icon name=…>` / `icon: '…'`) ∪ a small
//        curated common list. Small (~40–80) so <Icon> ships instant, no-flash icons.
//   2. src/components/ui/icons/<name>.mjs      — one tiny module per LAZY icon
//        (`export default { viewBox, paths }`), dynamic-imported on demand. Gitignored.
//   3. src/components/ui/icons.tail.mjs        — GROUPED map of every outlined icon NOT
//        in the per-icon set (~5700+). Lazy-loaded as a single fallback chunk. Gitignored.
//   4. src/components/ui/icons.generated.d.ts  — `IconName` union over the FULL outlined
//        library (core ∪ per-icon ∪ tail) so any real Material Symbol name type-checks.
//        Committed.
//
// Idempotent: the per-icon dir is wiped and rebuilt each run.
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  rmSync,
  existsSync,
} from 'node:fs'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { MANIFEST } from './icons.manifest.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'node_modules/@material-symbols/svg-200/outlined')
const UI = join(root, 'src/components/ui')
const ICONS_DIR = join(UI, 'icons')
const META_PATH = process.env.MS_META || '/tmp/ms-meta.json'

// Size of the per-icon LAZY set (top-N Material Symbols by Google popularity).
// Pragmatic cap: comprehensive coverage of the common library without emitting
// the full ~7.8k per-icon chunks (which stresses the bundler). Widen if needed.
const LAZY_COUNT = 2000

const has = (n) => existsSync(join(SRC, `${n}.svg`))

// Curated common UI icons — union'd into the sync core so typical app chrome
// (nav, status, actions) renders instantly even if a component doesn't use it yet.
const CURATED_CORE = [
  'home', 'menu', 'more_vert', 'arrow_back', 'arrow_upward', 'arrow_downward',
  'expand_more', 'expand_less', 'keyboard_arrow_left', 'keyboard_arrow_right',
  'done', 'error', 'help', 'help_outline', 'visibility', 'visibility_off',
  'favorite', 'favorite_border', 'share', 'download', 'upload', 'refresh',
  'filter_list', 'sort', 'calendar_today', 'schedule', 'notifications',
  'mail', 'person', 'logout', 'login', 'lock', 'open_in_new', 'link',
  'check_box', 'check_box_outline_blank', 'radio_button_checked',
  'radio_button_unchecked', 'cancel', 'add_circle', 'remove_circle',
  'chevron_right', 'chevron_left', 'star_border', 'delete_outline',
]

function parseSvg(name) {
  const svg = readFileSync(join(SRC, `${name}.svg`), 'utf8')
  const vb = svg.match(/viewBox="([^"]+)"/)
  if (!vb) throw new Error(`${name}: no viewBox`)
  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
  if (!paths.length) throw new Error(`${name}: no <path> found`)
  return { viewBox: vb[1], paths }
}

// Icons referenced in the codebase — `<Icon name="…">` and `icon: '…'` literals.
export function usedInSrc() {
  const srcText = execSync(
    'git grep -h -E "name=\\"[a-z][a-z0-9_]+\\"|icon: ?[\\x27\\x22][a-z][a-z0-9_]+[\\x27\\x22]" -- src',
    { cwd: root, encoding: 'utf8' }
  )
  return [
    ...new Set([
      ...[...srcText.matchAll(/name="([a-z][a-z0-9_]+)"/g)].map((m) => m[1]),
      ...[...srcText.matchAll(/icon: ?['"]([a-z][a-z0-9_]+)['"]/g)].map((m) => m[1]),
    ]),
  ].filter(has)
}

// The sync CORE set = usage-derived ∪ curated common.
export function coreNames() {
  return [...new Set([...usedInSrc(), ...CURATED_CORE.filter(has)])].sort()
}

// The LAZY set = top-N by popularity (ms-meta if present, else the manifest).
export function lazyNames() {
  let ranked
  if (existsSync(META_PATH)) {
    const raw = readFileSync(META_PATH, 'utf8').replace(/^\)\]\}'?\n?/, '')
    const data = JSON.parse(raw)
    ranked = [
      ...new Set(
        [...data.icons]
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .map((i) => i.name)
          .filter(has)
      ),
    ]
  } else {
    ranked = MANIFEST.filter(has)
  }
  return ranked.slice(0, LAZY_COUNT)
}

export function build() {
  const core = coreNames()
  // Per-icon set = core ∪ lazy top-N (modules emitted for each, dynamic-imported on demand).
  const full = [...new Set([...core, ...lazyNames()])].sort()

  // All outlined icon names in the package (sorted, .svg stripped).
  // Exclude `-fill` variants — those are the FILLED icons; Quill uses Outlined (Fill 0) only.
  const allOutlined = readdirSync(SRC)
    .filter((f) => f.endsWith('.svg') && !f.endsWith('-fill.svg'))
    .map((f) => f.replace('.svg', ''))
    .sort()

  // Tail = every outlined icon that does NOT have a per-icon module.
  // These are served via a single grouped-tail module (icons.tail.mjs) that the
  // <Icon> component falls back to when the per-icon dynamic import rejects.
  const fullSet = new Set(full)
  const tail = allOutlined.filter((n) => !fullSet.has(n))

  // 1) sync core map
  const coreBody = core
    .map((n) => `  ${JSON.stringify(n)}: ${JSON.stringify(parseSvg(n))},`)
    .join('\n')
  const coreMjs =
    `// GENERATED by scripts/build-icons.mjs — do not edit. Source: @material-symbols/svg-200 (outlined).\n` +
    `// Sync CORE set: usage-derived ∪ curated common. Imported synchronously by <Icon>.\n` +
    `export const icons = {\n${coreBody}\n}\n`

  // 2) per-icon lazy modules (wipe dir for idempotency)
  rmSync(ICONS_DIR, { recursive: true, force: true })
  mkdirSync(ICONS_DIR, { recursive: true })
  for (const n of full) {
    const mod =
      `// GENERATED by scripts/build-icons.mjs — do not edit.\n` +
      `export default ${JSON.stringify(parseSvg(n))}\n`
    writeFileSync(join(ICONS_DIR, `${n}.mjs`), mod)
  }

  // 3) grouped tail module — all remaining outlined icons as a single map.
  // <Icon> dynamic-imports this as a fallback when the per-icon chunk doesn't exist.
  const tailBody = tail
    .map((n) => `  ${JSON.stringify(n)}: ${JSON.stringify(parseSvg(n))},`)
    .join('\n')
  const tailMjs =
    `// GENERATED by scripts/build-icons.mjs — do not edit. Source: @material-symbols/svg-200 (outlined).\n` +
    `// Grouped tail: every outlined icon NOT in the per-icon set. Lazy-loaded as a single fallback chunk.\n` +
    `export const icons = {\n${tailBody}\n}\n`
  writeFileSync(join(UI, 'icons.tail.mjs'), tailMjs)

  // 4) full IconName union — covers core ∪ per-icon ∪ tail = the ENTIRE outlined library.
  const allNames = [...new Set([...full, ...tail])].sort()
  const nameUnion = allNames.map((n) => `'${n}'`).join(' | ')
  const coreUnion = core.map((n) => `'${n}'`).join(' | ')
  const dts =
    `// GENERATED by scripts/build-icons.mjs — do not edit.\n` +
    `// Full outlined library: core (sync) + per-icon (lazy) + tail (lazy grouped fallback).\n` +
    `export type IconName = ${nameUnion}\n` +
    `export type CoreIconName = ${coreUnion}\n` +
    `export declare const icons: Record<CoreIconName, { viewBox: string; paths: string[] }>\n`

  // 5) full name list (for the searchable gallery / docs — dev-only, not shipped by apps).
  const namesMjs =
    `// GENERATED by scripts/build-icons.mjs — do not edit.\n` +
    `// Every outlined icon name (core ∪ per-icon ∪ tail). Used by the Storybook icon gallery search.\n` +
    `export const iconNames = ${JSON.stringify(allNames)}\n`
  writeFileSync(join(UI, 'icon-names.generated.mjs'), namesMjs)

  writeFileSync(join(UI, 'icons.core.mjs'), coreMjs)
  writeFileSync(join(UI, 'icons.generated.d.ts'), dts)

  return { core, lazy: full, tail, coreMjs, tailMjs, dts }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { core, lazy, tail } = build()
  console.log(
    `icons.core.mjs: ${core.length} core | icons/: ${lazy.length} per-icon modules | icons.tail.mjs: ${tail.length} tail icons`
  )
}
