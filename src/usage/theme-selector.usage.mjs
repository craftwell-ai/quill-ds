export const usage = {
  name: 'theme-selector',
  kind: 'pattern',
  summary: 'A dropdown picker for the four Quill themes and four pigment accents — sets data-theme/data-accent and persists both to localStorage.',
  useWhen: [
    "You need to let users switch among Quill's four themes and four accents, persisted to localStorage.",
  ],
  alternatives: [
    { name: 'settings', when: 'theme choice is one field among many in a broader preferences form, not a standalone quick-switch control.' },
  ],
  rules: [
    {
      id: 'read-storage-after-hydration',
      do: 'Read the persisted theme/accent from localStorage in an effect, after mount — never during render, or prerendered markup mismatches the client.',
      dont: 'Read localStorage synchronously during render; that guarantees a hydration mismatch since the server always renders Dawn/moss.',
      visual: false,
    },
    {
      id: 'accent-shows-a-swatch',
      do: 'Show a color swatch next to each accent option in the menu, as this picker does, so people see the actual hue before picking it.',
      dont: 'List accent names as plain text with no swatch, forcing a guess at what "Terracotta" or "Indigo" actually look like.',
      visual: true,
    },
  ],
  a11y: [
    'The trigger button\'s aria-label states the current theme by name (e.g. "Theme: Dusk"), not just an icon with no accessible name.',
    'Both radio groups (Theme, Accent) use DropdownMenuRadioGroup semantics, so the current selection is announced as a checked radio item, not just a visual highlight.',
  ],
  tokens: ['--accent-pigment', '--text-accent-color', '--link', '--border'],
}
