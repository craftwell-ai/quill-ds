/**
 * The anatomy of a page in the Paper file, as plain node objects `serialize` (convert.mjs)
 * turns into HTML. The measurements are the ones the owner's "Mantis Design System" file
 * uses, read from it: a 1440px artboard with 80px padding and 56px between its children;
 * a header (eyebrow, name, one-line summary at 720px); then sections, each a 14px title
 * with its content 16px below. The type is Quill's own: Fraunces for the name, Raleway for
 * the rest, every value a token.
 */

export const ARTBOARD = { width: 1440, padding: 80, gap: 56 }

export const artboardStyles = () => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: `${ARTBOARD.width}px`,
  height: 'fit-content',
  padding: `${ARTBOARD.padding}px`,
  gap: `${ARTBOARD.gap}px`,
  backgroundColor: 'var(--color-background)',
})

const sans = { 'font-family': 'var(--font-sans)' }
const TYPE = {
  eyebrow: { ...sans, 'font-size': 'var(--text-xs)', 'line-height': 'var(--leading-text-xs)', 'font-weight': 'var(--font-weight-semibold)', 'letter-spacing': 'var(--tracking-label)', 'text-transform': 'uppercase', color: 'var(--color-muted-foreground)' },
  title: { 'font-family': 'var(--font-heading)', 'font-size': 'var(--text-3xl)', 'line-height': 'var(--leading-display)', 'letter-spacing': 'var(--tracking-display)', 'font-variation-settings': '"opsz" 144, "SOFT" 50, "WONK" 0', color: 'var(--color-foreground)' },
  summary: { ...sans, 'font-size': 'var(--text-base)', 'line-height': 'var(--leading-text-base)', color: 'var(--color-muted-foreground)', width: '720px' },
  section: { ...sans, 'font-size': 'var(--text-sm)', 'line-height': 'var(--leading-text-sm)', 'font-weight': 'var(--font-weight-semibold)', color: 'var(--color-foreground)' },
  label: { 'font-family': 'var(--font-mono)', 'font-size': 'var(--text-xs)', 'line-height': 'var(--leading-text-xs)', color: 'var(--color-muted-foreground)' },
  body: { ...sans, 'font-size': 'var(--text-sm)', 'line-height': 'var(--leading-text-sm)', color: 'var(--color-foreground)' },
}

export const text = (role, content, extra = {}) => ({ tag: 'span', text: content, style: { ...TYPE[role], ...extra }, children: [] })
export const frame = (name, style, children = []) => ({ tag: 'div', name, style: { display: 'flex', ...style }, children })

export const header = (eyebrow, title, summary) => frame('Header', { 'flex-direction': 'column', gap: 'var(--spacing-3)' }, [
  text('eyebrow', eyebrow),
  text('title', title),
  text('summary', summary),
])

/** A titled section. `children` sit 16px under the title; pass none to fill it later. */
export const section = (title, children = [], style = {}) => frame(title, { 'flex-direction': 'column', 'align-items': 'flex-start', gap: 'var(--spacing-4)', ...style }, [text('section', title), ...children])
