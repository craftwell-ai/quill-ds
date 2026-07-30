/**
 * Vocabulary for the cross-app pattern scan.
 *
 * STOCK_COMPONENTS are the off-the-shelf shadcn primitives. Quill deliberately
 * does NOT re-ship primitives — it ships the theme, two `registry:ui` components
 * and 51 blocks — so a component in an app whose name matches this list was
 * installed, not hand-built, and is never a candidate. This list changes slowly
 * and needs occasional updating; a name missing from it produces one extra
 * candidate to eyeball, never a wrong promotion, so the failure direction is safe.
 *
 * STRUCTURAL_STOPWORDS are shape words that carry no meaning about what a
 * component IS. Without excluding them, every card-shaped component in every app
 * collapses into one meaningless cluster. Keep this list short: a stopword that
 * is also a real pattern name would erase that pattern from the report.
 */
export const STOCK_COMPONENTS = [
  'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'avatar', 'badge',
  'breadcrumb', 'button', 'calendar', 'card', 'carousel', 'chart', 'checkbox',
  'collapsible', 'combobox', 'command', 'context-menu', 'dialog', 'drawer',
  'dropdown-menu', 'form', 'hover-card', 'input', 'input-otp', 'label',
  'menubar', 'navigation-menu', 'pagination', 'popover', 'progress',
  'radio-group', 'resizable', 'scroll-area', 'select', 'separator', 'sheet',
  'sidebar', 'skeleton', 'slider', 'sonner', 'switch', 'table', 'tabs',
  'textarea', 'toggle', 'toggle-group', 'tooltip', 'typography',
]

export const STRUCTURAL_STOPWORDS = [
  'card', 'panel', 'view', 'row', 'list', 'item', 'wrapper', 'container',
  'section', 'block', 'group', 'box', 'bar', 'ui', 'index',
]
