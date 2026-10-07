/**
 * Per-piece exceptions to the rules in ./pieces.mjs. Keep it small: a piece with no entry
 * follows the rule (canonical story + every story without a play function, at most 8).
 *
 *   include   story ids to show although the rule would not (a state reached by a play function)
 *   exclude   story ids to leave out although the rule would show them
 *   max       a different cap on stories for this page
 *   open      for a piece that is closed until used (a dialog, a menu): how to open it when no
 *             story renders it open. `{ click | hover | focus | context: '<CSS selector>' }`, or
 *             `{ key: 'k', modifiers: ['Meta'] }`; the selector is looked up inside the story. Add
 *             `stories: [ids]` when only some of the piece's stories need opening.
 *   declined  a reason: the piece gets no page. Only for pieces with nothing to draw.
 *   summary   the header line, for a piece with no usage module
 */
export const MAX_STORIES = 8

/** Names that title case gets wrong. */
export const NAMES = {}

const trigger = (slug) => ({ click: `[data-slot="${slug}-trigger"]` })

export const CONFIG = {
  // ---- closed until used: no story renders these open, so the sync opens them before it reads them
  'alert-dialog': { open: trigger('alert-dialog') },
  combobox: { open: { click: '[data-slot="input-group-control"]' } },
  command: { open: { click: '[data-slot="button"]', stories: ['components-command--as-dialog'] } },
  'context-menu': { open: { context: '[data-slot="context-menu-trigger"]' } },
  dialog: { open: trigger('dialog') },
  drawer: { open: trigger('drawer') },
  'dropdown-menu': { open: trigger('dropdown-menu') },
  'hover-card': { open: { hover: '[data-slot="hover-card-trigger"]' } },
  menubar: { open: trigger('menubar') },
  'navigation-menu': { open: trigger('navigation-menu') },
  popover: { open: trigger('popover') },
  select: { open: trigger('select') },
  sheet: { open: trigger('sheet') },
  sonner: { open: { click: '[data-slot="button"]' } },
  tooltip: { open: { hover: '[data-slot="tooltip-trigger"]' } },

  // ---- the five pieces of the first spike keep their hand-picked stories where the rule differs
  // every other story of these four asserts something with a play function; these are the states worth drawing
  'approval-card': { include: ['components-approvalcard--destructive', 'components-approvalcard--not-editable'] },
  'usage-meter': { include: ['components-usagemeter--bar', 'components-usagemeter--running-low-card', 'components-usagemeter--compact', 'components-usagemeter--compact-low'] },
  'conversation-history': { include: ['patterns-ai-conversation-history--groups-by-date', 'patterns-ai-conversation-history--empty'] },
  // All Variants and All Sizes already show each single-variant story side by side
  button: { exclude: ['components-button--outline', 'components-button--secondary', 'components-button--ghost', 'components-button--destructive', 'components-button--link'] },
  'tone-badge': { exclude: ['components-tonebadge--caution', 'components-tonebadge--attention', 'components-tonebadge--informational', 'components-tonebadge--muted'] },
}
