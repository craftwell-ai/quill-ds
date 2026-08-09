export const usage = {
  name: 'item',
  kind: 'component',
  summary: 'A general-purpose list row — compose ItemMedia (icon or avatar), ItemContent (title + description), and ItemActions (trailing button) into a consistent row for lists, search results, and settings.',
  useWhen: [
    'You need a repeatable list row with an optional leading icon or avatar, a title and description, and a trailing action — a course row, a search result, a settings line.',
  ],
  alternatives: [
    { name: 'card', when: 'the content is a standalone bounded surface rather than one row in a list — reach for Card instead of a single Item.' },
    { name: 'table', when: 'the content is genuinely tabular (aligned columns to scan down) rather than a list of self-contained rows.' },
  ],
  rules: [
    {
      id: 'compose-the-slots',
      do: 'Compose Item from its slots — ItemMedia for the leading icon/avatar, ItemContent for title + description, ItemActions for the trailing control — as every story here does.',
      dont: "Drop an icon, text, and a button as loose siblings inside Item with no slot wrappers — the built-in gap and alignment rules key off those slot classes and stop working.",
      visual: true,
    },
    {
      id: 'wrap-rows-in-itemgroup',
      do: 'Wrap a list of Items in ItemGroup — it renders `role="group"` and supplies the vertical gap between rows for every size.',
      dont: 'Stack bare Item elements in a plain `<div>` — you lose the group semantics and have to hand-roll the vertical gap.',
      visual: false,
    },
    {
      id: 'link-row-via-render',
      do: 'When the whole row navigates somewhere, pass `render={<a href=... />}` to Item (as the AsLink story does) so the row is one real link.',
      dont: "Nest an `<a>` inside Item's content instead of using `render` — only part of the row becomes clickable and focusable, not the whole row.",
      visual: false,
    },
  ],
  a11y: [
    'ItemGroup renders `role="group"`, grouping its Items for assistive tech without implying list or listbox semantics.',
    "Item renders a plain `<div>` by default; pass `render={<a href=... />}` (as the AsLink story does) to make the whole row a real, keyboard-focusable link via Base UI's useRender.",
    "ItemTitle and ItemDescription are styled `<div>`/`<p>` elements, not headings — add real heading markup inside ItemTitle if the row needs to appear in the page's heading outline.",
  ],
  tokens: ['--border', '--muted', '--ring'],
}
