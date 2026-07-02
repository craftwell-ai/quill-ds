import * as React from 'react'
// Storybook gallery ONLY: the full icon-data map (dev-only, gitignored). Rendering from
// this map lets us show the whole library at once with no per-icon lazy loads. Apps use
// the lazy `<Icon>` path instead — this file never reaches an app bundle.
import { allIcons } from '@/components/ui/icons.all.generated.mjs'

// Alphabetical, but with number-prefixed names (10k, 360, 3d_rotation…) moved to the
// END — after the last letter-named icon — instead of sorting to the front.
const startsWithDigit = (n: string) => n.charCodeAt(0) >= 48 && n.charCodeAt(0) <= 57
const NAMES = Object.keys(allIcons).sort((a, b) => {
  const da = startsWithDigit(a)
  const db = startsWithDigit(b)
  if (da !== db) return da ? 1 : -1
  return a < b ? -1 : a > b ? 1 : 0
})

// Inline glyph straight from the data map (instant, no lazy import).
function Glyph({ name, size = 24 }: { name: string; size?: number }) {
  const g = (allIcons as Record<string, { viewBox: string; paths: string[] }>)[name]
  if (!g) return null
  return (
    <svg
      viewBox={g.viewBox}
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden
      className="inline-block shrink-0"
    >
      {g.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

function IconDetail({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <aside className="sticky top-4 h-fit w-64 shrink-0 rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Icon detail</span>
        <button
          type="button"
          aria-label="Close detail"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <Glyph name="close" size={18} />
        </button>
      </div>
      <div className="mb-4 flex items-center justify-center rounded-lg bg-muted py-8 text-foreground">
        <Glyph name={name} size={48} />
      </div>
      <p className="mb-1 text-xs text-muted-foreground">Name</p>
      <code className="mb-4 block text-sm text-foreground">{name}</code>
      <p className="mb-1 text-xs text-muted-foreground">Sizes</p>
      <div className="mb-4 flex items-end gap-3 text-foreground">
        {[16, 20, 24, 32].map((s) => (
          <Glyph key={s} name={name} size={s} />
        ))}
      </div>
      <p className="mb-1 text-xs text-muted-foreground">Usage</p>
      <code className="block rounded-md bg-muted px-2 py-1.5 text-xs text-foreground">{`<Icon name="${name}" />`}</code>
    </aside>
  )
}

const PAGE = 150 // icons rendered per "page"; more load as you scroll

export function IconGallery() {
  const [query, setQuery] = React.useState('')
  const [selected, setSelected] = React.useState<string | null>(null)
  const [count, setCount] = React.useState(PAGE)
  const q = query.trim().toLowerCase()
  const results = React.useMemo(() => (q ? NAMES.filter((n) => n.includes(q)) : NAMES), [q])
  const visible = results.slice(0, count)
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  // Reset how many are shown whenever the search changes.
  React.useEffect(() => {
    setCount(PAGE)
  }, [q])

  // Load the next page as the sentinel scrolls near the viewport (lazy on scroll).
  React.useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setCount((c) => Math.min(c + PAGE, results.length))
      },
      { rootMargin: '800px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [results.length])

  return (
    <div className="flex gap-6 text-ink not-prose">
      <div className="min-w-0 flex-1">
        <input
          type="search"
          aria-label="Search icons"
          placeholder={`Search ${NAMES.length.toLocaleString()} icons…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-3 w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="mb-3 text-xs text-muted-foreground">
          {q
            ? `${results.length} result${results.length === 1 ? '' : 's'} for “${q}”`
            : `All ${NAMES.length.toLocaleString()} icons`}
        </p>
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No icons match “{q}”.</p>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2">
              {visible.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSelected(n)}
                  aria-pressed={selected === n}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors hover:bg-accent ${
                    selected === n ? 'border-ring bg-accent' : 'border-transparent'
                  }`}
                >
                  <span className="text-foreground">
                    <Glyph name={n} size={24} />
                  </span>
                  <span className="w-full truncate text-[10px] text-foreground">{n}</span>
                </button>
              ))}
            </div>
            {visible.length < results.length && (
              <div ref={sentinelRef} aria-hidden className="h-10" />
            )}
          </>
        )}
      </div>
      {selected && <IconDetail name={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
