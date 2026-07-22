/**
 * Controlled intent vocabulary for the Quill registry.
 *
 * Every `registry:block` item in `registry.json` carries a `meta.intent` array
 * whose tags MUST come from this set, plus a `meta.use_when` sentence. Intent
 * describes the *job* a block does — what a designer or an AI agent is trying to
 * accomplish — so the catalog can be searched by meaning, not just by name.
 * `scripts/registry-meta.test.mjs` enforces membership; keep this list tight
 * (a vocabulary that tags everything tags nothing).
 *
 * To add a tag: add it here with a one-line definition, then tag the items that
 * need it. Never let an item reference a tag that isn't defined here.
 */
export const INTENT_TAGS = {
  auth: 'Authentication and account access — sign-in, sign-up, recovery, verification.',
  form: 'Structured data entry and validation.',
  'data-display': 'Presenting records, lists, and metrics for reading.',
  'data-viz': 'Charts and quantitative visuals.',
  navigation: 'Moving around an app — bars, breadcrumbs, tabs, command menus.',
  'app-shell': 'Full-page layout scaffolding for application screens.',
  feedback: 'System status — alerts, notifications, empty and error states.',
  marketing: 'Landing-page and promotional sections.',
  commerce: 'Purchase, checkout, and billing.',
  messaging: 'Conversational and inbox interfaces.',
  scheduling: 'Dates, calendars, and bookings.',
  productivity: 'Task and workflow management.',
  content: 'Editorial and informational blocks.',
  settings: 'Configuration and preferences.',
}

export const INTENT_TAG_NAMES = Object.keys(INTENT_TAGS)
