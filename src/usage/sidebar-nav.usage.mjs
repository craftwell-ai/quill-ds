export const usage = {
  name: 'sidebar-nav',
  kind: 'pattern',
  summary: 'A collapsible icon-sidebar app shell with grouped menus, badges, a breadcrumb header, and a card grid main area.',
  useWhen: [
    'You need a collapsible icon-sidebar app shell with grouped menus and a content area.',
  ],
  alternatives: [
    { name: 'dashboard', when: 'you need a simpler, fixed-width text sidebar without the icon-collapse behavior.' },
    { name: 'mail-shell', when: 'the main content area is a two-pane message list/reading layout, not a card grid.' },
  ],
  rules: [
    {
      id: 'group-related-items',
      do: 'Group sidebar items under labeled sections (e.g. "Workspace", "Studio"), as this block already does, rather than one long flat list.',
      dont: 'List every nav item at the same level with no grouping once the count grows past a handful.',
      visual: true,
    },
  ],
  a11y: [
    'SidebarTrigger toggles the collapsed state and lives next to a vertical Separator, giving keyboard users an explicit, focusable control instead of relying on a hover-only affordance.',
    'Each SidebarMenuButton carries a tooltip prop that also serves as its accessible label when the sidebar collapses to icons-only.',
  ],
  tokens: ['--sidebar', '--sidebar-foreground', '--sidebar-ring', '--border'],
}
