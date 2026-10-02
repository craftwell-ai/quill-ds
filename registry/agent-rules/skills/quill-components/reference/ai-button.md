# ai-button (component)

A stock Quill button that runs an AI action, marked with the AI sparkle; the label stays plain ink.

### When to use
- A button starts something an AI does: Summarize, Rewrite, Ask AI, Draft a reply.

### Reach for instead
- **button** — when the action does not involve AI.
- **prompt-composer** — when the person needs to type what they want rather than press one action.

### Rules
- **Do:** Let the sparkle carry the gradient and keep the label in the button's normal text colour. **Don't:** Fill the button or its label with the AI gradient — the gradient belongs on the mark, and a gradient fill competes with the page.
- **Do:** Use a plain Button for Accept, Replace and Use this, even inside an AI popover. **Don't:** Make the button that applies an AI suggestion an AiButton — acting on AI output is an ordinary decision.

### Accessibility
- Inherits Button semantics and focus ring; the mark is decorative because the label already says what happens.
- For an icon-only AI button, use Button with `size="icon"` and an `AiMark` with `label`.

### Design tokens
`--ai-from` · `--ai-via` · `--ai-to`

