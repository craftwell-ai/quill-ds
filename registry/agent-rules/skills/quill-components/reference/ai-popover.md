# ai-popover (component)

An AI suggestion beside the text it is about — what the AI did, the suggested text on a soft AI wash, then Discard, Try again and Replace.

### When to use
- Someone selects text (or presses an AI action on a field) and the AI offers a rewrite they can take or leave without leaving the page.

### Reach for instead
- **popover** — when the overlay holds an ordinary form or filter, not an AI suggestion.
- **ai-message** — when the AI answers in a conversation rather than suggesting an edit to text on the page.

### Rules
- **Do:** Leave Replace as the plain solid button; the wash and the mark already say this came from AI. **Don't:** Put the AI gradient on Replace or on the suggested text — accepting has to feel like any other decision.
- **Do:** Wrap the selected text as the popover's anchor so it stays highlighted underneath for comparison. **Don't:** Cover or remove the original before the person has chosen.
- **Do:** Title the popover with the action and its flavour: "Rewrite: shorter". **Don't:** Title it "AI" or "Suggestion" — people should know what was asked without remembering it.

### Accessibility
- The popover is a dialog named by its title. It opens on a press and focus lands on the popover itself (with a visible ring), not on a button, so a held Enter cannot press Discard. Try again keeps focus inside the popover while the suggestion is replaced, and closing it any way returns focus to its anchor, where the person was.
- On a short screen the popover is capped to the space left; the suggestion scrolls while the header and the buttons stay in view.
- It stays open while you press inside it; Escape, a press outside it, or a second press on its anchor closes it.
- An anchor that is not a button (highlighted text) is given the button role and a place in the Tab order.
- While the AI is writing, a polite live region (role="status") says the working label; when a suggestion follows it says "Suggestion ready". The region is in the popover from its first paint, empty, and the visible label is hidden from screen readers so it is not read twice. A popover that opens with a finished suggestion announces nothing extra.
- Under reduced motion the shimmer and the line hold still; the label stays readable.

### Design tokens
`--popover` · `--background` · `--input` · `--foreground` · `--muted-foreground` · `--primary` · `--ai-from` · `--ai-via` · `--ai-to` · `--ai-text-via`

