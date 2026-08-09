export const usage = {
  name: 'menubar',
  kind: 'component',
  summary: 'A desktop application-style menu strip — a row of always-visible top-level menus, each opening its own dropdown on click.',
  useWhen: [
    'You need a persistent horizontal row of top-level menus — editor toolbars, desktop-app chrome — not a single button-triggered menu.',
  ],
  alternatives: [
    { name: 'dropdown-menu', when: 'you only need one menu button, not a horizontal strip of them.' },
    { name: 'navigation-menu', when: 'the row is public site or marketing navigation rather than desktop application commands.' },
  ],
  rules: [
    {
      id: 'app-chrome-not-site-nav',
      do: 'Reach for Menubar only for desktop application-style command strips — editor toolbars, app chrome.',
      dont: 'Use Menubar for public site navigation — it reads as an unfamiliar desktop-app metaphor for visitors; use NavigationMenu instead.',
      visual: false,
    },
    {
      id: 'group-with-separators',
      do: 'Group related commands with MenubarSeparator inside each menu, the way File separates New/Open from Save/Export.',
      dont: 'Run every command together with no separator — a long flat list gives users no visual grouping to scan.',
      visual: true,
    },
  ],
  a11y: [
    'The strip itself is a menu bar container; arrow keys move focus horizontally between top-level triggers, matching desktop app menu conventions.',
    'Each MenubarMenu reuses the DropdownMenu primitive underneath — same role="menu" popup, same roving keyboard focus, same Escape-to-close behavior.',
    'Escape closes the open menu and returns focus to its trigger; the horizontal strip itself keeps focus rather than losing it.',
  ],
  tokens: ['--popover', '--shadow-md', '--border'],
}
