import { renderSpacingSection } from './foundations.mjs'

/**
 * The page compositions Quill ships as registry examples — shadcn's channel for
 * "how do these fit together" (agent-readability spec W5; the three pages are
 * the spec's own D4 proposal). One source for each registry entry's title,
 * description, dependencies and docs, for the Storybook stories, and for the
 * example lists in llms.txt and the agent-rules file.
 *
 * `blocks` is the composition order, top to bottom. Every name must be a
 * shipped block — `registry-meta.test.mjs` fails on one that is not.
 */
export const EXAMPLES = [
  {
    name: 'example-app-page',
    title: 'Example: app page',
    blocks: ['sidebar-nav', 'page-header', 'stat-cards', 'data-table'],
    description:
      'An example showing how to compose an app page: the sidebar-nav shell wrapping a page-header, then stat-cards, then a data-table — the page leads with what it is about, and the numbers sit inside it.',
  },
  {
    name: 'example-marketing-page',
    title: 'Example: marketing page',
    blocks: ['navbar', 'hero', 'feature-section', 'pricing', 'testimonial', 'footer'],
    description:
      'An example showing how to compose a marketing page: navbar, hero, feature-section, pricing, testimonial and footer — one idea per section, breathing at the 96px rhythm.',
  },
  {
    name: 'example-auth-page',
    title: 'Example: auth page',
    blocks: ['login-split-panel'],
    description:
      'An example showing how to compose an auth page: login-split-panel alone at full viewport — one task, nothing competing with it.',
  },
]

export const exampleByName = (name) => EXAMPLES.find((e) => e.name === name)

/** Install-time docs: the composition order, then the spacing, layout and composition rules every page follows. */
export function renderExampleDocs(example) {
  return [
    `Composition, top to bottom: ${example.blocks.join(' → ')}. Install it, then replace the blocks' sample content with your own; keep the order and the spacing.`,
    renderSpacingSection(),
  ].join('\n\n')
}
