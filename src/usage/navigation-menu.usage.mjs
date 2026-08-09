export const usage = {
  name: 'navigation-menu',
  kind: 'component',
  summary: 'Top-level site navigation with mega-dropdown panels — for public/marketing navigation, not desktop application chrome.',
  useWhen: [
    'You need a horizontal row of site-level navigation, some entries opening a dropdown panel of links, others going straight to a page.',
  ],
  alternatives: [
    { name: 'menubar', when: 'the row represents desktop application commands rather than public site or marketing navigation.' },
  ],
  rules: [
    {
      id: 'trigger-only-for-dropdowns',
      do: 'Use NavigationMenuTrigger + NavigationMenuContent only for entries that open a dropdown panel of choices.',
      dont: 'Wrap a single destination link in Trigger + Content just to reuse the chevron affordance — a plain NavigationMenuLink is simpler and correct.',
      visual: false,
    },
    {
      id: 'apply-trigger-style-to-plain-links',
      do: 'Apply navigationMenuTriggerStyle() to a plain NavigationMenuLink so it matches the visual weight of the dropdown triggers next to it.',
      dont: 'Leave a plain NavigationMenuLink unstyled next to NavigationMenuTrigger buttons — it reads smaller and less clickable, breaking the row\'s visual rhythm.',
      visual: true,
    },
  ],
  a11y: [
    'NavigationMenuTrigger renders a real button with an aria-hidden chevron that rotates when its panel opens.',
    'Arrow keys move focus along the top-level row; the open dropdown panel keeps its own Tab order separate from the row behind it.',
    'Escape closes an open dropdown panel and returns focus to its trigger.',
  ],
  tokens: ['--popover', '--border', '--radius-lg'],
}
