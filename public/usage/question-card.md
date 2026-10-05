# question-card (component)

An AI agent asks the person to choose — the question, options as full rows with the recommended one first, a free-text row for anything else, and Continue that waits for an answer.

### When to use
- An AI agent cannot go on without a choice only the person can make, and there are a few sensible answers.

### Reach for instead
- **radio-group** — when an ordinary form asks the question; no AI agent is waiting on it.
- **approval-card** — when the agent already knows what it wants to do and needs a yes or a no.

### Rules
- **Do:** Give every option a title and one line on what choosing it means. **Don't:** Offer a row of bare buttons — people cannot weigh options they have to guess at.
- **Do:** Pass the agent's pick as recommended so it comes first with the moss tag. **Don't:** Tag several options as recommended, or bury the recommendation in the middle of the list.
- **Do:** Keep the free-text row, and offer Skip when the agent can decide for itself. **Don't:** Force a choice between options when none of them may fit.

### Accessibility
- The card is a group named by the question. The options are a radio group named by the question: one Tab stop, arrow keys move between options and choose.
- Each radio is named by its title (the recommended one adds "Recommended") and described by its one line.
- Choosing the free-text row shows its field, named by the question; the cursor stays on the radio so the arrow keys keep working, and Tab moves into the field.
- Continue is disabled until there is an answer. Enter in the field continues.
- The outcome line appears inside a status region that is already on the page, so it is announced; while empty the region is a real box that takes no space.
- When the outcome arrives, the buttons go away; if the cursor was in the card, it moves to the outcome line so the person keeps their place, and it stays where it was if it was elsewhere on the page.
- Long unbroken words wrap inside the card. A chosen answer passed without onAnswerChange locks the rows rather than leaving rows that do nothing.

### Design tokens
`--card` · `--background` · `--border` · `--input` · `--foreground` · `--muted-foreground` · `--ink-soft` · `--primary` · `--moss` · `--moss-deep` · `--ai-from` · `--ai-via` · `--ai-to`

