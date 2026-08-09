export const usage = {
  name: 'page-header',
  kind: 'pattern',
  summary: 'A page header with a breadcrumb trail, title and description, and duplicate/new action buttons.',
  useWhen: [
    'You need a screen header with breadcrumbs, title, description, and primary actions.',
  ],
  alternatives: [
    { name: 'sidebar-nav', when: "you need the breadcrumb as part of a full app shell's top bar, not a standalone header block." },
    { name: 'hero', when: "this is a marketing page's opening statement, not a utility screen's title bar." },
  ],
  rules: [
    {
      id: 'current-page-is-not-a-link',
      do: "Render the current page as BreadcrumbPage (plain text), not a link — you can't navigate to where you already are.",
      dont: 'Make every breadcrumb crumb, including the current page, a clickable link.',
      visual: true,
    },
  ],
  a11y: [
    'The breadcrumb trail uses real <nav>/<ol> semantics (via the Breadcrumb primitive), not a row of plain text separated by slashes.',
    'Duplicate and New are two distinct, separately labeled buttons, not one ambiguous combined action.',
  ],
  tokens: ['--muted-foreground', '--primary', '--border'],
}
