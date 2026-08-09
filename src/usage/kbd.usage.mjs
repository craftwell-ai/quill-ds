export const usage = {
  name: 'kbd',
  kind: 'component',
  summary: 'A keyboard key badge — a single label rendered as Kbd, or a compound shortcut via KbdGroup — for hotkeys in tooltips, menus, and shortcut references.',
  useWhen: [
    'You need to reference a keyboard key or shortcut inline in text, a menu item, or a tooltip (e.g. "Press ⌘K to search").',
  ],
  alternatives: [],
  rules: [
    {
      id: 'kbdgroup-for-combos',
      do: "Wrap a compound shortcut's individual keys in KbdGroup (e.g. ⌘ + K) so they render as one tight sequence.",
      dont: 'Render each key of a combo as a standalone Kbd in a normal-gap row — they read as unrelated hints instead of one shortcut.',
      visual: true,
    },
    {
      id: 'label-matches-the-key',
      do: 'Label each Kbd with the actual key glyph or short name your app uses (⌘, Esc, Tab), matching how the OS labels it.',
      dont: 'Spell out a full instruction inside a Kbd ("press command", "hit escape") — Kbd is sized and styled for a single short key label, not a sentence.',
      visual: false,
    },
  ],
  a11y: [
    'Kbd renders a real `<kbd>` element, the semantic tag for keyboard input, so assistive tech and browser text tooling recognize it as a key reference rather than plain text.',
    'Kbd is `pointer-events-none` and purely typographic — it carries no interactive semantics of its own, so it should only ever label a real control (a button, a shortcut list) rather than act as the control itself.',
  ],
  tokens: ['--muted', '--muted-foreground', '--radius-sm'],
}
