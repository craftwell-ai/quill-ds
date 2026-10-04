# citations (component)

Shows where an AI answer came from — a small chip after each claim, named for its source, that previews it, and an "N sources" list under the answer.

### When to use
- An AI answer draws on files, pages or records people may want to check.

### Reach for instead
- **hover-card** — when you need a preview on an ordinary link that is not an AI source.
- **badge** — when you are labelling a category, not pointing to where a claim came from.

### Rules
- **Do:** Put the chip right after the sentence it backs, named for its source. **Don't:** Collect sources only in a footer — people cannot tell which source backs which claim.
- **Do:** Leave the chips and list in neutral ink. **Don't:** Colour citations with the AI gradient or a status colour — they are references, not AI and not status.

### Accessibility
- Each chip is a link (or a button when there is no address) named "Source: Q3 board deck.pdf" with the full title, even when the chip shows a short label; keyboard focus opens the same preview as hover.
- Chips are 20px tall, larger than a superscript mark, so they are easy to hit.
- The sources pill is a disclosure button with aria-expanded controlling the list.

### Design tokens
`--muted` · `--ink-soft` · `--foreground` · `--background` · `--border` · `--muted-foreground` · `--popover`

