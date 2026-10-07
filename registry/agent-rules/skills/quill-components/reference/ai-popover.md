# ai-popover (component)

An AI suggestion beside the text it is about — what the AI did, the suggested text on a soft AI wash, then Discard, Try again and Replace.

### When to use
- Someone selects text (or presses an AI action on a field) and the AI offers a rewrite they can take or leave without leaving the page.

### Reach for instead
- **popover** — when the overlay holds an ordinary form or filter, not an AI suggestion.
- **ai-message** — when the AI answers in a conversation rather than suggesting an edit to text on the page.

### Rules
- **Do:** Leave Replace as the plain solid button; the wash and the mark already say this came from AI. **Don't:** Put the AI gradient on Replace or on the suggested text — accepting has to feel like any other decision.
- **Do:** Wrap the selected text as the popover's anchor so it stays highlighted underneath for comparison. In a text box or an editor, where the selection cannot be wrapped, pass it as anchor instead and leave the text as it is. **Don't:** Cover or remove the original before the person has chosen.
- **Do:** Title the popover with the action and its flavour: "Rewrite: shorter". **Don't:** Title it "AI" or "Suggestion" — people should know what was asked without remembering it.
- **Do:** Leave the suggestion tile on the soft divider line (border-border). It is read-only content, told apart from the popover by its fill. **Don't:** Outline it with the control line (border-input) — that line marks things people press or type in.

### Accessibility
- The popover is a dialog named by its title. It opens on a press (or, with anchor, when your app opens it) and focus lands on the popover itself (with a visible ring), not on a button, so a held Enter cannot press Discard. Try again keeps focus inside the popover while the suggestion is replaced, and closing it any way returns focus to its anchor, where the person was.
- After Replace, put focus in the new text yourself: the anchor the popover wrapped may be gone, so focus has nowhere to return to.
- For a selection inside a text box or an editor there is no element to wrap: pass anchor (the selection's Range, or for a textarea an object whose getBoundingClientRect returns the box you worked out), drive open yourself, and pass returnFocus (the editor). The popover sits beside the anchor and follows it as the text scrolls or the page moves. The selected text is not turned into a button, so it is not a Tab stop and its accessible name is not the passage: the editor stays the control.
- With anchor, closing any way (Replace, Discard, Insert below, Escape, a press outside, Tab past the last button) moves focus to returnFocus; left out, to the control that opened it (children), else to whatever had focus when it opened. Shift+Tab from the top of the popover goes there too and leaves it open. Escape and a press outside call onOpenChange(false).
- The popover is placed by an empty box kept over the anchor. That box is hidden from screen readers, is not a Tab stop and takes no presses: they reach the text underneath.
- On a short screen the popover is capped to the space left; the suggestion scrolls while the header and the buttons stay in view. While it overflows, the scrolling area is a Tab stop named "Suggested text" with the usual focus ring, so the arrow and Page keys scroll it; a suggestion that fits adds no Tab stop.
- It stays open while you press inside it; Escape, a press outside it, or a second press on its anchor closes it.
- An element the popover wraps that is not a button (highlighted text) is given the button role and a place in the Tab order.
- While the AI is writing, a polite live region (role="status") says the working label; when a suggestion follows it says "Suggestion ready". The region is in the popover from its first paint, empty, and the visible label is hidden from screen readers so it is not read twice. A popover that opens with a finished suggestion announces nothing extra.
- Under reduced motion the shimmer and the line hold still; the label stays readable.

### Design tokens
`--popover` · `--background` · `--border` · `--foreground` · `--muted-foreground` · `--primary` · `--ai-from` · `--ai-via` · `--ai-to` · `--ai-text-via`

