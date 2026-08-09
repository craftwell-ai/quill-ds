export const usage = {
  name: 'sidebar',
  kind: 'component',
  summary: 'The persistent side-rail navigation primitive — expands, collapses to icons, or slides in as an off-canvas sheet on mobile. `sidebar-nav` is this primitive already assembled into a full app shell with grouped menus and a breadcrumb header.',
  useWhen: [
    'You\'re assembling an app-shell nav rail yourself from SidebarGroup/SidebarMenu parts and need collapse-to-icon or off-canvas mobile behavior — reach for the `sidebar-nav` pattern directly if you just need the finished, pre-composed shell.',
  ],
  alternatives: [
    { name: 'sidebar-nav', when: 'you need the complete collapsible icon-sidebar app shell — grouped menus, a breadcrumb header, a content area — already assembled, not just the underlying primitive to compose yourself.' },
    { name: 'navbar', when: 'primary navigation belongs in a top bar for a marketing or simple site, not a persistent side rail.' },
  ],
  rules: [
    {
      id: 'always-wrap-in-provider',
      do: 'Always wrap Sidebar (and the page content beside it) in SidebarProvider — it holds the open/collapsed state every other Sidebar part reads from.',
      dont: 'Render Sidebar outside a SidebarProvider — every subcomponent calls useSidebar() internally and throws if no provider is found.',
      visual: false,
    },
    {
      id: 'use-menubadge-for-counts',
      do: 'Use SidebarMenuBadge to show a count on a menu item, as the Community item does in these stories — it positions itself correctly whether the sidebar is expanded or collapsed to icons.',
      dont: 'Append a count directly into the visible label text (e.g. "Community (3)") instead of SidebarMenuBadge — it doesn\'t adapt to collapsed icon mode and gets cut off along with the rest of the label.',
      visual: true,
    },
  ],
  a11y: [
    'SidebarProvider adds a Cmd/Ctrl+B keyboard shortcut that calls the same toggle as SidebarTrigger, giving keyboard users a global way to collapse the rail without tabbing to the trigger button.',
    'SidebarTrigger is a real button with a visually-hidden "Toggle Sidebar" label (`sr-only` span) — the icon alone carries no accessible name.',
    'SidebarMenuButton\'s `tooltip` prop renders through TooltipContent and stays `hidden` unless the sidebar is actually collapsed to icons and not on mobile — it only appears once the visible text label is genuinely gone, becoming the item\'s accessible label in that state.',
    'On mobile (detected via `useIsMobile`), Sidebar swaps its entire rendering to a Sheet (an off-canvas dialog), inheriting Sheet\'s own focus-trap and Escape-to-close behavior instead of the desktop collapse animation.',
  ],
  tokens: ['--sidebar', '--sidebar-foreground', '--sidebar-accent', '--sidebar-accent-foreground', '--sidebar-border', '--sidebar-ring'],
}
